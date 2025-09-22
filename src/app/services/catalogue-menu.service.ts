import { Injectable } from '@angular/core';
import {debounceTime, filter, skip, switchMap} from "rxjs/operators";
import {BehaviorSubject, combineLatest, delay, Observable, of, Subject, take, takeUntil, withLatestFrom} from "rxjs";
import {CatalogueService} from "@services/catalogue.service";
import {ComparateurService} from "@services/comparateur.service";
import {WindowService} from "@services/window.service";
import {Router} from "@angular/router";
import {FavorisService} from "@services/favoris.service";
import {HttpClient} from "@angular/common/http";
import {BreakpointObserver} from "@angular/cdk/layout";
import {ComponentsInteractionService} from "@services/components-interaction.service";
import {AuthenticationService} from "@services/authentication.service";
import {Categorie, Tree} from "@/models";
import {environment} from "@env/environment";

@Injectable({
  providedIn: 'root'
})
export class CatalogueMenuService {
  structureCatalogue: Observable<Tree<Categorie>>;
  listeRessources = null;

  currentActiveCategorieIndex = new BehaviorSubject<number>(null);
  currentSubCategoriesContainer = new BehaviorSubject<HTMLElement>(null);

  showCatalogue = false;
  showRessources = false;
  showActual = false;
  showSubnav = false;

  onCatalogueCategorieHoveredIndex = new BehaviorSubject<number>(null);
  onCatalogueCategorieTappedIndex = new BehaviorSubject<number>(null);
  onCatalogueSousCategoriesContainerHoveredIndex = new BehaviorSubject<number>(null);
  onCatalogueSousCategoriesContainerTappedIndex = new BehaviorSubject<number>(null);
  onSubnavTriggerClickedOrTapped$ = new Subject<boolean>();

  comparateurReferences: string[] = [];
  favorisReferences: string[] = [];

  isPopUp = false;
  promotionHoveredInt = -1;
  nosMarquesHoveredInt = -2;
  nosMetiersHoveredInt = -3;
  selectedSideNavMenu = '';

  get subNavSmall() {
    return this._subNavSmall.value;
  }
  get subNavXLarge() {
    return this._subNavXLarge.value;
  }
  get subNavLarge() {
    return this._subNavLarge.value;
  }
  get subNavMedium() {
    return this._subNavMedium.value;
  }


  public catalogue$: Observable<[boolean, HTMLElement]>;

  private _mouseEnterTimeout: number = null;
  private _subNavSmall = new BehaviorSubject<boolean>(false);
  private _subNavXLarge = new BehaviorSubject<boolean>(false);
  private _subNavLarge = new BehaviorSubject<boolean>(false);
  private _subNavMedium = new BehaviorSubject<boolean>(false);
  private _destroy$ = new Subject<void>();

  constructor(
    private http: HttpClient,
    private router: Router,
    private window: WindowService,
    private catalogueService: CatalogueService,
    private breakpointObserver: BreakpointObserver,
    private authService: AuthenticationService,
    public componentsInteractionService: ComponentsInteractionService,
    private comparateurService: ComparateurService,
    private favorisService: FavorisService
  ) {
    this.comparateurReferences = this.comparateurService.setUp();
    if (this.comparateurReferences[0] == '') {
      this.comparateurReferences = [];
    }
    this.favorisReferences = this.favorisService.setUp();
    if (this.favorisReferences[0] == '') {
      this.favorisReferences = [];
    }

    this.structureCatalogue = this.catalogueService.getStructure();

    /*this.authService.currentUser$.pipe(takeUntil(this._destroy$)).subscribe(() => {
      this.getRessources()
        .pipe(takeUntil(this._destroy$))
        .subscribe((data) => {
          this.listeRessources = data;
        });
    });*/

    this.catalogue$ = combineLatest(
      this.onCatalogueCategorieHoveredIndex,
      this.onCatalogueSousCategoriesContainerHoveredIndex)
      .pipe(
        debounceTime(100),
        switchMap(
          ([hoveredCategorie, currentHoveredSubCategoriesContainer]) => {
            if (
              currentHoveredSubCategoriesContainer === null &&
              !this.subNavSmall
            ) {
              this.currentActiveCategorieIndex.next(hoveredCategorie);
              return of(false);
            } else {
              return of(true);
            }
          }
        ),
        filter(subCategoriesLocked => !subCategoriesLocked),
        delay(50),
        withLatestFrom(this.currentSubCategoriesContainer.pipe(skip(1)))
      );

    this.breakpointObserver
      .observe(['(max-width: 767.98px)'])
      .subscribe(state => {
        this._subNavSmall.next(state.matches);
      });

    this.breakpointObserver
      .observe(['(min-width: 1650px)'])
      .subscribe(state => {
        this._subNavXLarge.next(state.matches);
      });

    this.breakpointObserver
      .observe(['(min-width: 1300px)'])
      .subscribe(state => {
        this._subNavLarge.next(state.matches);
      });

    this.breakpointObserver
      .observe(['(min-width: 950px)'])
      .subscribe(state => {
        this._subNavMedium.next(state.matches);
      });

    // s'abonne et met à jour 'comparateurReferences' à chaque modification dans le service 'ComparateurService'
    this.comparateurService
      .compare()
      .pipe(takeUntil(this._destroy$))
      .subscribe(
        (ret) => {
          this.comparateurReferences = ret;
        },
        (error) => {
          console.error('Erreur dans \'HeaderComponent\': retour de la subscription au service \'ComparateurService\' échoué', error);
        }
      );

    // s'abonne et met à jour 'comparateurReferences' à chaque modification dans le service 'FavorisService'
    this.favorisService
      .favoris()
      .pipe(takeUntil(this._destroy$))
      .subscribe(
        (ret) => {
          this.favorisReferences = ret;
        },
        (error) => {
          console.error('Erreur dans \'HeaderComponent\': retour de la subscription au service \'FavorisService\' échoué', error);
        }
      );
  }

  ngOnInit(): void { }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  /*public getRessources(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/ListeRessources.php`, {
      withCredentials: true,
      responseType: 'json'
    });
  }*/

  /**
   * Déclenche l'ouverture de la side-nav.
   * @param selectedMenu Menu sur lequel ouvrir la side-nav (exemple : 'espace-client')
   */
  openSideNav(selectedMenu: string) {
    this.componentsInteractionService.sideNavigationLine.fireOpenSideNav(
      selectedMenu
    );
  }

  navigateCataloguePath(path) {
    this.router.navigate(['/catalogue/' + path]);
    this.showSubnav = false;
    this.showCatalogue = false;
    this.currentActiveCategorieIndex.next(null);
  }

  /**
   * Handler déclenchant lorsqu'une nouvelle recherche par mot clé vient d'être lancée.
   * Permet de fermer tous les menus concernant le catalogue.
   */
  onSearch() {
    this.showSubnav = false;
    this.showCatalogue = false;
    this.showRessources = false;
    this.showActual = false;
    this.currentActiveCategorieIndex.next(null);
  }

  /**
   * Recule d'un niveau dans le menu du catalogue. Disponible seulement au format small.
   */
  onBackButton() {
    this.currentActiveCategorieIndex.next(null);
  }

  /**
   * Navigue vers le catalogue, au niveau indiqué par niveaux.
   * Ferme également les menus ouverts associés au catalogue.
   * @param niveaux Tableau contenant les niveaux (catégorie, sous-catégorie, ...) sélectionnés pour la navigation
   */
  onCatalogueNiveauSelected(...niveaux: any[])
  {
    if (niveaux.length === 3) {

      this.structureCatalogue.pipe(take(1)).subscribe(
        (categories) =>
        {
          var subcategories = categories.nodes.find((subcat)=>{ return (subcat.value.label == niveaux[1]) });
          var subsubcategories = subcategories.nodes.find((subsubcat)=>{ return (subsubcat.value.label == niveaux[2]) });
          if (!!subsubcategories.nodes && subsubcategories.nodes.length > 1) {
            this.router.navigate(['/catalogue/' + niveaux[1] + '/' + niveaux[2]]);
            this.showSubnav = false;
            this.showCatalogue = false;
          } else {
            this.router.navigate(['/catalogue/' + niveaux[1] + '/' + niveaux[2] + '/unique']);
            this.showSubnav = false;
            this.showCatalogue = false;
          }
        }
      );

      /*this.router.navigate(['/catalogue/' + niveaux[1] + '/' + niveaux[2] + '/unique']);
      this.showSubnav = false;
      this.showCatalogue = false;*/
    } else {
      this.router.navigate(niveaux);
      this.showSubnav = false;
      this.showCatalogue = false;
      this.currentActiveCategorieIndex.next(null);
    }
  }

  onMouseEnterMenu(): void {
    if (navigator.maxTouchPoints === 0) {
      if (this._mouseEnterTimeout != null) {
        // clearTimeout(this.mouseEnterTimeout);
      }
      this._mouseEnterTimeout = this.window.setTimeout(() => this.showCatalogue = !this.subNavSmall, 200);
    } else {
      this.showCatalogue = true;
    }
  }

  onMouseLeaveMenu(): void {
    if (this._mouseEnterTimeout != null) {
      clearTimeout(this._mouseEnterTimeout);
    }
    this.showCatalogue = false;
  }
}
