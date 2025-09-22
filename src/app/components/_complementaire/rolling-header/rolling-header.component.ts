import {AfterViewInit, Component, NgZone, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {SvgService} from "@services/svg.service";
import {ExposeHeightSetterDirective} from "@components/_util/directives/expose-height-setter.directive";
import {WindowService} from "@services/window.service";
import {Router} from "@angular/router";
import {
  BehaviorSubject,
  combineLatest,
  delay,
  fromEvent,
  Observable,
  of,
  Subject,
  Subscription,
  withLatestFrom
} from "rxjs";
import {debounceTime, filter, skip, switchMap, take, takeUntil} from "rxjs/operators";
import {CartService} from "@services/cart.service";
import {AuthenticationService} from "@services/authentication.service";
import {LicenceService} from "@services/licence.service";
import {environment} from "@env/environment";
import {BreakpointObserver} from "@angular/cdk/layout";
import {Categorie, Tree} from "@/models";
import {CatalogueService} from "@services/catalogue.service";
import {LogClientService} from "@services/log-client.service";
import {ComponentsInteractionService} from "@services/components-interaction.service";
import {FavorisService} from "@services/favoris.service";
import {ComparateurService} from "@services/comparateur.service";
import {CatalogueMenuService} from "@services/catalogue-menu.service";
import {faArrowLeft, faCalendar, faChevronRight, faStar} from "@fortawesome/free-solid-svg-icons";
import {state} from "@angular/animations";

@Component({
  selector: 'app-rolling-header',
  templateUrl: './rolling-header.component.html',
  styleUrls: ['./rolling-header.component.scss']
})
export class RollingHeaderComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('megamenu', { read: ExposeHeightSetterDirective }) exposeHeightSetter: ExposeHeightSetterDirective;

  environment = environment;
  showHeader = false;

  private _destroy$: Subject<void> = new Subject<void>();
  comparateurReferences: string[] = [];
  comparateurSubscription: Subscription = null;
  favorisReferences: string[] = [];
  favorisSubscription: Subscription = null;
  selectedSideNavMenu = '';

  ronnlingBarClientTel: boolean = true;

  constructor(
    public router: Router,
    public authService: AuthenticationService,
    public cartService: CartService,
    private window: WindowService,
    public licenceService: LicenceService,
    public cms: CatalogueMenuService,
    private ngZone: NgZone,
    public svg: SvgService,
    public logClientService: LogClientService,
    public componentsInteractionService: ComponentsInteractionService,
    public comparateurService: ComparateurService,
    public favorisService: FavorisService,
    private breakpointObserver: BreakpointObserver
  ) { }

  ngOnInit(): void {
    this.cms.catalogue$
      .subscribe(([subCategoriesLocked, currentSubCategoriesContainer]) => {
        this.exposeHeightSetter.setHeight(
          currentSubCategoriesContainer.offsetHeight + 'px'
        );
      });

    this.breakpointObserver
      .observe(['(max-width: 767.98px)'])
      .subscribe(state => {
        this.ronnlingBarClientTel = !state.matches;
      });
    this.comparateurReferences = this.comparateurService.setUp();
    if (this.comparateurReferences[0] == "") {
      this.comparateurReferences = [];
    }
    this.favorisReferences = this.favorisService.setUp();
    if (this.favorisReferences[0] == "") {
      this.favorisReferences = [];
    }
    this.favorisSubscription = this.favorisService.favoris().subscribe(
      (ret) => {
        this.favorisReferences = ret;
      },
      (error) => {
        console.error("Erreur dans 'HeaderComponent': retour de la subscription au service 'FavorisService' échoué", error);
      }
    );
    this.comparateurSubscription = this.comparateurService.compare()
      .subscribe(
        (ret) => {
          this.comparateurReferences = ret;
        },
        (error) => {
          console.error("Erreur dans 'HeaderComponent': retour de la subscription au service 'ComparateurService' échoué", error);
        }
      );
  }

  openSideNav(selectedMenu: string) {
    this.componentsInteractionService.sideNavigationLine.fireOpenSideNav(selectedMenu);
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  ngAfterViewInit(): void {
    this.showHeader = this.window.pageYOffset > 120;
    this.ngZone.runOutsideAngular(() => {
      fromEvent(this.window.document, 'scroll')
        .pipe(
          debounceTime(20),
          takeUntil(this._destroy$))
        .subscribe(e => {
          if (!this.showHeader && this.window.pageYOffset > 120) {
            this.ngZone.run(() => this.showHeader = true);
          } else if (this.showHeader && this.window.pageYOffset <= 120) {
            this.ngZone.run(() => this.showHeader = false);
          }
        });
    });
  }

  protected readonly faChevronRight = faChevronRight;
  protected readonly faArrowLeft = faArrowLeft;
  protected readonly faCalendar = faCalendar;
  protected readonly faStar = faStar;
}
