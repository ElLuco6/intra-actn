import {Component, OnDestroy, OnInit} from '@angular/core';
import {environment} from "@env/environment";
import {CartItem, User} from "@/models";
import {Subject} from "rxjs";
import {CartService} from "@services/cart.service";
import {HttpClient} from "@angular/common/http";
import {ProduitService} from "@services/produit.service";
import {AuthenticationService} from "@services/authentication.service";
import {Router} from "@angular/router";
import {SnackbarService} from "@services/snackbar.service";
import {take, takeUntil} from "rxjs/operators";
import {TransportService} from "@services/transport.service";
import {RmaService} from "@services/rma.service";
import {LogClientService} from "@services/log-client.service";
import {LocalStorageService} from "@services/local-storage.service";
import {ComponentsInteractionService} from "@services/components-interaction.service";
import {CdkDragDrop, moveItemInArray} from "@angular/cdk/drag-drop";

@Component({
  selector: 'app-panier',
  templateUrl: './panier.component.html',
  styleUrls: ['./panier.component.scss']
})
export class PanierComponent implements OnInit, OnDestroy {
  /** Variable contenant un regroupement de variables d'environement vitales au site */
  environment = environment;
  /** Observable de ListePaniers.php */
  listePanier$ = null;
  /** Liste des paniers sauvegardés */
  listePanier;
  /** Est-ce que le composant est en train de sauvegarder un panier ?
   * Affiche le widget de chargement */
  savingCart: boolean = false;
  /** Est-ce que l'on affiche les panierSauvegardés ? */
  paniersDisplay = false;

  itemsArray: CartItem[];
  /**
   * Possibilités de location
   * 0 : pas de produits louables
   * 1 : une partie des produits du panier sont louables
   * 2 : tout les produits du panier sont louables
   */
  locationState: 0 | 1 | 2 = 0;

  /** Tableau stockant la présence d'erreurs dans le panier */
  panierRowErrors: Array<boolean>;
  /** Est-ce que la validation du panier est désactivée ? */
  disableValidation = true;
  /** Utilisateur connecté */
  user: User = null;

  /** Observable de nettoyage, déclanchée à la destruction du composant */
  private _destroy$ = new Subject<void>();
  loadingCart: boolean = true;

  constructor(
    public cartService: CartService,
    //public locationService: LocationService,
    private http: HttpClient,
    public produitService: ProduitService,
    private transportService: TransportService,
    private rmaService: RmaService,
    private authenticationService: AuthenticationService,
    private router: Router,
    private snackbarService: SnackbarService,
    private authClient: LogClientService,
    private localStorage: LocalStorageService,
    private componentsInteractionService: ComponentsInteractionService
  ) { }

  client;

  /**
   * Initialisation de PanierComponent
   * - Récupère l'utilisateur
   * - Récupère les grilles de transport, le taux de TVA et le mail de l'utilisateur
   * - Actualise le panier
   * - Récupère la liste des paniers sauvegardés
   * - Vérifie la possibilité de louer le panier
   */
  ngOnInit()
  {
    this.cartService.cartItemsChanged.subscribe((newItems: CartItem[]) => {
      this.itemsArray = newItems;
    });

    setTimeout(() => {
      if(!this.localStorage.getItem('client')){
        this.router.navigate(['/']);
        this.componentsInteractionService.sideNavigationLine.fireOpenSideNav('toggleEspaceClient');
      }
    }, 100);


    this.authClient._currentCient$.subscribe(
      (data) => {
        if(data){
          this.user = this.authenticationService.currentUser;
          this.client = this.authClient.currentClient;
          this.transportService.formatGrille();
          this.transportService.setTVA(this.client.TauxTVA);
          this.transportService.setMail(this.client.TIERSMEL);
          /* PANIERCALCUL.PHP */
          this.actualiserPanier();

          this.panierRowErrors = new Array(this.cartService.qteProduits);
          this.panierRowErrors.fill(false);

          this.cartService.cart$.pipe(takeUntil(this._destroy$)).subscribe(
            () =>
            {
              this.setLocationState();
            }
          );
          this.loadingCart = false;
        }
      }
    )
  }

  /** Destruction de PanierComponent */
  ngOnDestroy() {
    if (this.listePanier$ != null) {
      this.listePanier$.unsubscribe();
    }

    this._destroy$.next();
    this._destroy$.complete();
    setTimeout(() => this.snackbarService.hideSnackbar(), 5000);
  }

  isPirceIsEditedArray: number[] = [];

  get priceIsEdited(){
    this.isPirceIsEditedArray = [];
    Object.values(this.cartService.cart.items).forEach((d) => {
      if(d.prixSaisi){
        this.isPirceIsEditedArray.push(d.prixSaisi);
      }
    });
    return this.isPirceIsEditedArray.length === 0;
  }


  /** Actualise le panier et en vérifie les données
   * Désactive la validation le temps de vérifier */
  actualiserPanier() {
    this.disableValidation = true;
    /* recupérer les éléments du panier et les formater pour la requette */
    const cartSave = Object.values(this.cartService.cart.items).map(
      (item) => {
        return ({
          marque: item.produit.marque,
          quantite: item.qte,
          reference: item.produit.reference,
          // cotation: item.cotation.numcotation,
          // cotationLigne: item.cotation.numcotationLigne
        });
      }
    );

    const rf = cartSave.map((sc) => (sc.reference));
    const qt = cartSave.map((sc) => (sc.quantite));
    // const cot = cartSave.map((sc) => (sc.cotation));
    /* Requette 'PanierCalcul.php' */
    if (rf.length > 0) {
      this.http.post<any>(
        `${environment.apiUrl}/PanierCalcul.php`,
        {
          ref: rf
        },
        {
          withCredentials: true,
          responseType: 'json',
        }
      )
        .pipe(take(1))
        .subscribe(
          (ret) => {

            this.updateCart(this.cartService.formSavedProducts(ret), qt);
            this.loadingCart = false;
          },
          (error) => {
            console.log('Erreur dans la requette PHP \'PanierCalcul.php\'', error);
            /*this.authenticationService.logOut();
            this.router.navigate(['/login'], {
              queryParams: { returnUrl: 'panier' },
              state: { error: true }
            });*/
          }
        );
    } else {
      this.disableValidation = false;
    }
  }



  /**
   * Mets à jour le panier avec de nouvelles informations plus récentes
   * @param products Liste de Produits aux informations mises à jour
   * @param quantities Liste de quantités des produits dans 'products'
   */
  updateCart(products, quantities: number[]): void {
    // Cherche les items retirés du panier
    const deletedItems = [];
    Object.keys(this.cartService.cart.items).forEach(item => {
      const produit = products.find(product => product.reference === item);
      if (produit == null) {
        deletedItems.push(item);
        this.cartService.removeProduit(this.cartService.cart.items[item].produit);
      }
    });
    if (deletedItems.length > 0) {
      const params = {
        noTimer: true,
        warning: true,
        large: true
      };
      if (deletedItems.length > 1) {
        this.snackbarService.showSnackbar(`Les produits ${deletedItems.join(', ')} ne sont plus proposés à la vente et ont été retirés de votre panier.`, '', () => { }, 0, params);
      } else {
        this.snackbarService.showSnackbar(`Le produit ${deletedItems[0]} n'est plus proposé à la vente et a été retiré de votre panier.`, '', () => { }, 0, params);
      }
    }
    for (let i = 0; i < products.length; i++) {
      this.cartService.realyUpdateProduit(products[i], quantities[i]);
    }
    this.disableValidation = false;
  }

  /**
   * Définit si le panier peut être loué
   * Set 'this.locationState' avec le code de status location du panier
   * Ne pas autoriser la location du panier si aucun produit n'est louable et prévenir le client si tous les produits ne sont pas louables
   */
  setLocationState(): void {
    const panierKeys: string[] = Object.keys(this.cartService.cart.items);
    const panierKeysLength = panierKeys.length;

    const countProduct = panierKeys.filter(key => this.cartService.cart.items[key].produit.criterevalue19).length;

    if (countProduct === panierKeysLength) {
      this.locationState = 2;
    } else if (countProduct > 0) {
      this.locationState = 1;
    } else {
      this.locationState = 0;
    }
  }

  /**
   * Sauvegarder le panier actuel
   */
 /* sauvegarderLePanier(): void {
    this.savingCart = true;
    const cartSave = Object.values(this.cartService.cart.items).map(
      (item) => {
        return (
          {
            marque: item.produit.marque,
            quantite: item.qte,
            reference: item.produit.reference
          }
        );
      }
    );

    let ret = '';

    this.cartService.sauvegarderLePanierRequest(cartSave)
      .pipe(takeLast(1))
      .subscribe(
        (data) => {
          ret = data;
          this.getSavedPaniers();
          this.savingCart = false;
        },
        (error) => {
          this.savingCart = false;
        }
      );
  }*/


  /** Afficher les paniers sauvegardés */
  afficherPaniers() {
    this.paniersDisplay = true;
  }
  /** Cacher les paniers sauvegardés */
  hidePaniers() {
    this.paniersDisplay = false;
  }
  /** Afficher/Cacher les paniers sauvegardés */
  togglePaniers() {
    this.paniersDisplay = !this.paniersDisplay;
  }

  /* myfunctions */
/*  groupBy = function (xs, key) {
    return xs.reduce(function (rv, x) {
      (rv[x[key]] = rv[x[key]] || []).push(x);
      return rv;
    }, {});
  };*/

  groupByArray = function (xs, key) {
    return xs.reduce(function (rv, x) {
      const v = key instanceof Function ? key(x) : x[key];
      const el = rv.find((r) => r && r.key === v);
      if (el) {
        el.values.push(x);
      } else {
        rv.push({ key: v, values: [x] });
      }
      return rv;
    }, []);
  };

  /** Formate la date d'aujourd'hui en une string et la renvoie */
  /*getCurrentDateInString = () => {
    /!* SET DATE INPUT *!/
    const today = new Date();
    const dd = today.getDate();
    const mm = today.getMonth() + 1;
    const yyyy = today.getFullYear();
    let minday;
    let minmonth;
    if (dd < 10) {
      minday = '0' + dd;
    }
    else {
      minday = dd;
    }
    if (mm < 10) {
      minmonth = '0' + mm;
    }
    else {
      minmonth = mm;
    }

    const mindate = yyyy + '-' + minmonth + '-' + minday;
    return (mindate);
  };*/

  /** Applique la valeur booleene donnée à l'index donnée de la liste d'erreur des lignes du panier 'this.panierRowErrors'
   * @param i Index de 'this.panierRowErrors' à modifier
   * @param value Nouvelle valeur à entrer dans 'this.panierRowErrors[i]''
   */
  panierRowError(i: number, value: boolean) {
    this.panierRowErrors[i] = value;
  }

  /** Répond à : Est-ce qu'il y a une erreur dans une des lignes du panier ? */
  isErrorInPanier(): boolean {
    return this.panierRowErrors.some(p => p);
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.itemsArray, event.previousIndex, event.currentIndex);
    this.cartService.reorderItems(this.itemsArray);
  }
}

export function getRandomShit(){
  return 8;
}
