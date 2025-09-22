import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {AuthenticationService} from "../../services/authentication.service";
import {CatalogueService} from "../../services/catalogue.service";
import {UserService} from "../../services/user.service";
import {FavorisComponent} from "@components/favoris/favoris.component";
import {BehaviorSubject, combineLatest, delay, Observable, of, Subject, Subscription, withLatestFrom} from "rxjs";
import {FavorisService} from "@services/favoris.service";
import {ComponentsInteractionService} from "@services/components-interaction.service";
import {LicenceService} from "@services/licence.service";
import {CotationService} from "@services/cotation.service";
import {LogClientService} from "@services/log-client.service";
import {CartService} from "@services/cart.service";
import {ComparateurService} from "@services/comparateur.service";
import {BreakpointObserver} from "@angular/cdk/layout";
import {debounceTime, filter, skip, switchMap, take, takeUntil, tap} from "rxjs/operators";
import {ExposeHeightSetterDirective} from "@components/_util/directives/expose-height-setter.directive";
import {environment} from "@env/environment";
import {SvgService} from "@services/svg.service";
import {Router} from "@angular/router";
import {Categorie, Tree} from "@/models";
import {RmaService} from "@services/rma.service";
import {WindowService} from "@services/window.service";
import {HttpClient} from "@angular/common/http";
import {faArrowLeft, faChevronRight, faStar} from "@fortawesome/free-solid-svg-icons";

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {
  @ViewChild('megamenu', { read: ExposeHeightSetterDirective })
  exposeHeightSetter: ExposeHeightSetterDirective;
  isPopUp = false;
  mouseEnterTimeout: number = null;
  environment = environment;
  selectedSideNavMenu = '';
  matToolTipShowDelayValue = 0;
  matToolTipHideDelayValue = 100;
  matToolTipPositionValue: 'left' | 'right' | 'above' | 'below' = 'below';
  favorisReferences: string[] = [];
  favorisSubscription: Subscription = null;
  comparateurReferences: string[] = [];
  comparateurSubscription: Subscription = null;


  _subNavSmall = new BehaviorSubject<boolean>(false);

  get subNavSmall() {
    return this._subNavSmall.value;
  }

  destroy$: Subject<boolean> = new Subject<boolean>();

  showSubnav = false;

  /**
   * Observable contenant l'arborescence du catalogue.
   */
  structureCatalogue: Observable<Tree<Categorie>>;

  /**
   * Trigger l'affichage du menu du catalogue.
   */
  showCatalogue = false;

  /**
   * Trigger l'affichage du menu des ressources.
   */
  showRessources = false;
  showActual = false;
  showPromotions = false;
  /**
   * Liste des Ressources récupérés par la requette ListeRessources.php
   */
  ListeRessources: string = null;

  promotionHoveredInt = -1;
  nosMarquesHoveredInt = -2;
  nosMetiersHoveredInt = -3;
  /**
   * Contient l'index de la dernière catégorie survolée.
   */
  onCatalogueCategorieHoveredIndex = new BehaviorSubject<number>(null);
  /**
   * Contient l'index de la dernière catégorie sélectionnée par un tap ou par le clavier.
   */
  onCatalogueCategorieTappedIndex = new BehaviorSubject<number>(null);

  /**
   * Contient l'index de la catégorie active courante.
   */
  currentActiveCategorieIndex = new BehaviorSubject<number>(null);
  /**
   * Contient la div contenant les sous-catégories de la catégorie actuelle.
   * Nécessaire seulement pour mettre à jour la hauteur du megamenu en fonction de son contenu.
   */
  currentSubCategoriesContainer = new BehaviorSubject<HTMLElement>(null);

  onCatalogueSousCategoriesContainerHoveredIndex = new BehaviorSubject<number>(
    null
  );
  onCatalogueSousCategoriesContainerTappedIndex = new BehaviorSubject<number>(
    null
  );

  constructor(
    public authService: AuthenticationService,
    public logClientService: LogClientService,
    public userService: UserService,
    private favorisService: FavorisService,
    public componentsInteractionService: ComponentsInteractionService,
    public licenceService: LicenceService,
    public cotationService: CotationService,
    public authClient: LogClientService,
    public cartService: CartService,
    public breakpointObserver: BreakpointObserver,
    private comparateurService: ComparateurService,
    public svg: SvgService,
    public router: Router,
    private rmaService: RmaService,
    private catalogueService: CatalogueService,
    private window: WindowService,
    private http: HttpClient
  ) {
    this.rmaService.popUp.subscribe(
      (data: any) => {
        this.isPopUp = data === "Ok";
      },
      error => { },
      () => { }
    );
  }

  ngOnInit(){
    this.comparateurReferences = this.comparateurService.setUp();
    if (this.comparateurReferences[0] == "") {
      this.comparateurReferences = [];
    }
    this.favorisReferences = this.favorisService.setUp();
    if (this.favorisReferences[0] == "") {
      this.favorisReferences = [];
    }
    this.favorisSubscription = this.favorisService.favoris()
      .subscribe(
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

    // Récupère l'arborescence du catalogue depuis la base de données (catégories, sous-catégories, etc.)
    this.structureCatalogue = this.catalogueService.getStructure();
    this.authService.currentUser$.pipe(takeUntil(this.destroy$)).subscribe(() => {
     // this.getRequestRessources(); ntm
    });

    this.breakpointObserver
      .observe(['(max-width: 767.98px)'])
      .pipe(takeUntil(this.destroy$))
      .subscribe(state => {
        this._subNavSmall.next(state.matches);
        if (this.exposeHeightSetter && state.matches) {
          this.exposeHeightSetter.setHeight('auto');
        }
      });

    /* If the username is too long reduce the font size */
    setTimeout(() => {
      if (this.authService.currentUser) {
        if (this.authService.currentUser.name.length > 35) {
          this.window.document.getElementById('userName').style.fontSize = '0.9rem';
        }
      }
    }, 2000);

    /**
     * Observable déclenché à chaque fois qu'une catégorie ou son conteneur de sous-catégories est survolé.
     * combineLatest() obtient les dernières valeurs associés à ces deux Observables à chaque déclenchement.
     * debounce(Time) permet d'éviter les déclenchements trop rapprochés dans le temps,
     * causés par exemple par le survolage accidentel d'une catégorie
     * lors d'une trajectoire en diagonale vers les sous-catégories.
     * Le comportement de debounce(Time) est similaire à un setTimeout(callback, Time) qui serait réinitialisé
     * à chaque nouvel évènement avant que le callback n'ait eu le temps d'être appelé.
     */
    combineLatest(
      this.onCatalogueCategorieHoveredIndex,
      this.onCatalogueSousCategoriesContainerHoveredIndex
    )
      .pipe(
        takeUntil(this.destroy$),
        debounceTime(100),
        switchMap(
          ([hoveredCategorie, currentHoveredSubCategoriesContainer]) => {
            /**
             * Si après le délai, l'on n'est ni entrain de survoler les sous-catégories, ni en format small,
             * on peut mettre à jour la catégorie active courante.
             */
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
        /**
         * Si la catégorie à été mise à jour, on adapte la hauteur du megamenu à la hauteur du contenu de la nouvelle catégorie,
         * après un court délai permettant de s'assurer de la bonne initialisation du contenu.
         */
        filter(subCategoriesLocked => !subCategoriesLocked),
        delay(50),
        withLatestFrom(this.currentSubCategoriesContainer.pipe(skip(1)))
      )
      .subscribe(([subCategoriesLocked, currentSubCategoriesContainer]) => {
        this.exposeHeightSetter.setHeight(
          currentSubCategoriesContainer.offsetHeight + 'px'
        );
      });

    /**
     * Observable déclenché à chaque fois qu'une catégorie est sélectionnée avec un évènement tap ou keydown.Tab.
     */
    this.onCatalogueCategorieTappedIndex
      .pipe(
        takeUntil(this.destroy$),
        /**
         * Mise à jour de l'index de la catégorie active courante.
         */
        tap(categorieIndex =>
          this.currentActiveCategorieIndex.next(
            this.currentActiveCategorieIndex.value === categorieIndex
              ? null
              : categorieIndex
          )
        ),
        /**
         * Mise à jour de la hauteur du megamenu en fonction de la hauteur du contenu de la nouvelle catégorie,
         * après un court délai permettant de s'assurer de la bonne initialisation du contenu.
         */
        delay(50),
        withLatestFrom(this.currentSubCategoriesContainer.pipe(skip(1)))
      )
      .subscribe(([categorieIndex, currentSubCategoriesContainer]) => {
        if (!this.subNavSmall) {
          setTimeout(() => {
            this.exposeHeightSetter.setHeight(
              currentSubCategoriesContainer.offsetHeight + 'px'
            );
          }, 20);
        }
      });

    // s'abonne et met à jour 'comparateurReferences' à chaque modification dans le service 'ComparateurService'
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

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();

    if (this.comparateurSubscription != null) {
      this.comparateurSubscription.unsubscribe();
    }
    if (this.favorisSubscription != null) {
      this.favorisSubscription.unsubscribe();
    }
  }

  logOut(){
    this.authService.logOut().subscribe(() => window.location.reload(), (error) => console.log(error))
  }

  openSideNav(selectedMenu: string) {
    this.componentsInteractionService.sideNavigationLine.fireOpenSideNav(selectedMenu);
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
    this.showPromotions = false;
    this.currentActiveCategorieIndex.next(null);
  }

  /**
   * Navigue vers le catalogue, au niveau indiqué par niveaux.
   * Ferme également les menus ouverts associés au catalogue.
   * @param niveaux Tableau contenant les niveaux (catégorie, sous-catégorie, ...) sélectionnés pour la navigation
   */
  onCatalogueNiveauSelected(...niveaux: any[]) {
    this._subCategorieHasSubSubCategorie(niveaux);
    if (niveaux.length === 3) {
      // on vérifie si la sous-catégorie à une sous-sous-catégorie, si c'est le cas on navigue vert les categories au lieu du catalogue
      this.structureCatalogue.pipe(take(1)).subscribe(
        (categories) =>
        {
          const subcategories = categories.nodes.find((subcat) => {return (subcat.value.label == niveaux[1])});
          const subsubcategories = subcategories.nodes.find((subsubcat) => {return (subsubcat.value.label == niveaux[2])});
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
    } else {
      this.router.navigate(niveaux);
      this.showSubnav = false;
      this.showCatalogue = false;
      this.currentActiveCategorieIndex.next(null);
    }
  }
  _subCategorieHasSubSubCategorie(niveaux): boolean
  {
    return true;
  }

  navigateCataloguePath(path) {
    this.router.navigate(['/catalogue/' + path]);
    this.showSubnav = false;
    this.showCatalogue = false;
    this.currentActiveCategorieIndex.next(null);
  }

  /**
   * Recule d'un niveau dans le menu du catalogue. Disponible seulement au format small.
   */
  onBackButton() {
    this.currentActiveCategorieIndex.next(null);
  }

  getRequestRessources() {
    this.http
      .get<any>(`${environment.apiUrl}/ListeRessources.php`, {
        withCredentials: true,
        responseType: 'json'
      }).pipe(takeUntil(this.destroy$)).subscribe(
      (data) => {
        this.ListeRessources = data;
      });
  }

  onMouseEnterMenu(): void {
    // this.showCatalogue = true;
    setTimeout(()=>{
      if (navigator.maxTouchPoints === 0)
      {
        this.showCatalogue = true;
      }
    },10)
    /*if (navigator.maxTouchPoints === 0)
    {
      this.showCatalogue = true;
    }*/
    /*if (navigator.maxTouchPoints === 0) {
      if (this.mouseEnterTimeout != null) {
        // clearTimeout(this.mouseEnterTimeout);
      }
      this.mouseEnterTimeout = this.window.setTimeout(() => this.showCatalogue = !this.subNavSmall, 200);
      // this.showCatalogue = true;
    } else {
      this.showCatalogue = true;
    }*/
  }

  onMouseLeaveMenu(): void {
    if (this.mouseEnterTimeout != null) {
      clearTimeout(this.mouseEnterTimeout);
    }
    this.showCatalogue = false;
  }

  getTelephoneNoSpace(tel: string): string {
    return this.authService.currentUser['COMMERCIALTEL2'].replace(/ /g, '').slice(1);
  }

  openCalatogue()
  {
    this.showCatalogue = true;
  }

  closeSubnav()
  {
    this.showSubnav = false;
  }

  toggleShowCatalogue(): void
  {
    this.showCatalogue = !this.showCatalogue;
  }

  protected readonly faStar = faStar;
  protected readonly faChevronRight = faChevronRight;
  protected readonly faArrowLeft = faArrowLeft;
}
