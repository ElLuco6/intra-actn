import {Injectable, OnDestroy} from '@angular/core';
import { Client } from "@models/licence";
import { HttpClient } from '@angular/common/http';
import {BehaviorSubject, Observable, Subject, Subscription} from 'rxjs';
import { takeLast } from 'rxjs/operators';
import { environment } from "@env/environment";
import { LicenceService } from './licence.service';
import { LocalStorageService } from "./local-storage.service";
import { AuthenticationService } from './authentication.service';
import {Cart, CartItem, Cotation, Produit} from "@/models";
import {moveItemInArray} from "@angular/cdk/drag-drop";

/**
 * Service chargé de la gestion du panier.
 */
@Injectable({
  providedIn: 'root'
})
export class CartService implements OnDestroy{

  type: string = "base"; // variable de vérification du cart / utile seulement au debug

  /**
   * Subject contenant la dernière version du panier.
   */
  protected _cart: BehaviorSubject<Cart> = new BehaviorSubject<Cart>(new Cart());
  qteProduits: number;
  protected valideCommande: { ncmd: number, ticket: string, transaction: string };

  subscriptionToCurrentUser: Subscription = null;

  ////////////////////////////////////////////////////////////////////////////////////////////

  /**
   * @returns L'objet représentant le contenu du panier.
   */
  get cart(): Cart {
    return this._cart.value;
  }

  /**
   * @returns Observable de la dernière version du panier, si besoin de réagir à un changement.
   */
  get cart$(): Observable<Cart> {
    return this._cart.asObservable();
  }

  /** @returns Valeur du client final */
  get clientFinal(): Client {
    return this._client.value;
  }

  set clientFinal(client: Client) {
    this._client.next(client);
    this.licenceService.postEnduser(client).subscribe(() => {
    }, error => console.log(error));
  }

  get clientFinal$(): Observable<Client> {
    return this._client.asObservable();
  }

  /** Observable du client connecté, null si non-connecté */
  protected _client = new BehaviorSubject<Client>(null);

  constructor(
    protected httpClient: HttpClient,
    protected licenceService: LicenceService,
    protected localStorage: LocalStorageService,
    protected authService: AuthenticationService,
  ) {
    this.loadCart();

    this.updateCart();
    this.qteProduits = this.cart.qteProduits;

    this.subscriptionToCurrentUser = this.authService.currentUser$.subscribe(
      (user) => {
        if (user == null) // si l'user viens de se déconnecter
        {
          this.clearAllCotationsFromCart(); // à la déconnection on retire toute les cotations du panier pour éviter de les conserver en se connectant sur un autre compte
        }
      }
    );

  }

  /** Destruction du CartService */
  ngOnDestroy() {
    if (this.subscriptionToCurrentUser) {
      this.subscriptionToCurrentUser.unsubscribe(); // je sais pas si c'est très utile mais je prèfère que ce soit là
    }
  }

  /** Récupère le panier depuis le localstorage */
  /*protected loadCart(): void {
    const savedCart = this.localStorage.getItem('cart');
    if (savedCart) {
      this._cart = new BehaviorSubject<Cart>(Cart.fromObject(JSON.parse(savedCart)));
      this.clearAllCotationsFromCart(); // quand on recharge tout le panier en enlève les cotations
    }
  }*/
  protected loadCart(): void {
    const savedCart = this.localStorage.getItem('cart');
    if(savedCart) {
      const parsedCart = JSON.parse(savedCart);
      this._cart = new BehaviorSubject<Cart>(Cart.fromObject(parsedCart));

      const itemsArray = Object.values(this._cart.value.items);
      itemsArray.sort((a, b) => a.order - b.order);
      this.reorderItems(itemsArray);

      if (parsedCart.numDevis) {
        this.setNumDevis(parsedCart.numDevis);
      }
      if (parsedCart.refDevis) {
        this.setRefDevis(parsedCart.refDevis);
      }
    }
  }

  /**
   * Ajoute un produit au panier dans une quantité donnée, avec une cotation ou pas.
   * @param produit Le produit à ajouter.
   * @param qte       La qte de ce produit à ajouter.
   * @param cotation Une cotation
   */
  public addProduit(produit: Produit, qte: number, cotation: Cotation = null): void {
    // Si la référence du produit existe déjà dans le panier, on ajoute la quantité au produit
    if (this.cart.items[produit.reference]) {
      if (cotation) {
        this.cart.items[produit.reference].cotation = cotation;
      }
      this.updateProduit(produit, qte);
    }
      // Sinon, si ce produit n'est pas déjà présent dans le panier,
      // on créer une nouvelle référence dans le tableau d'items du panier
    // et on y ajoute la qte donnée du produit (si celle-ci est supérieure à 0).
    else if (qte > 0) {
      const item = new CartItem();
      item.produit = produit;
      item.cotation = cotation;
      item.commentaire = "";
      item.order = Object.keys(this.cart.items).length;
      this.cart.items[produit.reference] = item;
      if ((produit.codePromo === 'D') && (qte > produit.qteStock1)) {
        this.updateQuantiteProduit(produit, +produit.qteStock1);
      } else {
        this.updateQuantiteProduit(produit, qte);
      }
      this.updateCart();
    }
  }

  /**
   * Ajoute à la qte d'un produit dans le panier une qte donnée.
   * @param produit Le produit à ajouter.
   * @param qte       La qte de ce produit à ajouter.
   */
  public updateProduit(produit: Produit, qte: number): void {
    if (qte >= 0 || this.cart.items[produit.reference].qte > Math.abs(qte)) {
      // Si le produit est en déstockage et que sa quantité voulue dépasse la quantité en stock, on limite la quantité
      if ((produit.codePromo === 'D') && ((this.cart.items[produit.reference].qte + qte) > produit.qteStock1)) {
        this.updateQuantiteProduit(produit, +produit.qteStock1);
      } else {
        this.updateQuantiteProduit(produit, +this.cart.items[produit.reference].qte + qte);
      }
      this.updateCart();
      this.cart.items[produit.reference].total;
    } else {
      this.removeProduit(produit);
    }
  }

  /** Ajoute le commentaire du produit */
  public addCommProduit(commentaire: string, produit: Produit): void {
    this.cart.items[produit.reference].commentaire = commentaire;
    this.updateCart();
  }

  /** Modifie le commentaire du produit */
  public supprComm(produit: Produit): void {
    this.cart.items[produit.reference].commentaire = "";
    this.updateCart();
  }

  /** Modifier un commentaire d'un produit */
  public editComm(produit: Produit, commentaire: string): void {
    this.cart.items[produit.reference].commentaire = commentaire;
    this.updateCart();
  }

  /**
   * Met à jour les données d'un produit, et réaffecte sa quantité.
   * @param produit Le produit à mettre à jour
   * @param qte       La quantité à affecter
   * @param cotation
   */
  public realyUpdateProduit(produit: Produit, qte: number, cotation: Cotation = null): void {
    if (this.cart.items[produit.reference]) {
      if (qte > 0) {
        for (const [key, value] of Object.entries(produit)) {
          this.cart.items[produit.reference].produit[key] = value;
        }
        this.updateQuantiteProduit(this.cart.items[produit.reference].produit, qte);
      } else {
        this.removeProduit(produit);
      }
    }
  }

  /**
   * Met à jour la quantité d'un produit dans le panier.
   * @param produit Le produit à mettre à jour
   * @param quantite La nouvelle quantité de ce produit
   */
  public updateQuantiteProduit(produit: Produit, quantite: number): void {
    if (quantite >= 0) {
      const cotation = this.cart.items[produit.reference].cotation;
      this.cart.items[produit.reference].qte = quantite;
      this.updateCart();
    } else {
      this.removeProduit(produit);
    }
  }


  /**
   * Supprime la référence d'un produit du panier.
   */
  public removeProduit(produit: Produit): void {
    delete this.cart.items[produit.reference];
    this.updateCart();
  }

  /**
   * Supprime tous les produits du panier.
   */
  public emptyCart(): void {
    for (const key of Object.keys(this.cart.items)) {
      this.removeProduit(this.cart.items[key].produit);
    }
  }

  /**
   * Enregistre dans le service la commande validée par le client
   * Sert ensuite à confirmer la réussite de la commande/devis/etc dans validation-panier.component
   */
  setValideCommande(numcmd, tick, transac): void {
    this.valideCommande = {
      ncmd: numcmd,
      ticket: tick,
      transaction: transac
    };
  }

  /** Efface la commande validée par le client enregistrée */
  eraseValidCommande(): void {
    this.valideCommande = null;
  }

  /**
   * Renvoit les informations de la dernière commande validée par le client
   */
  getValidCommande(): { ncmd: number, ticket: string, transaction: string } {
    return this.valideCommande;
  }

  /**
   * Prévient d'un changement dans le panier,
   * Met à jour la qte totale de produits,
   * Enregistre le nouveau panier dans le localStorage.
   */
  updateCart(): void {
    this.cartItemsChanged.next(this.getSortedItems());
    this._cart.next(this.cart);
    this.qteProduits = this.cart.qteProduits;
    this.localStorage.setItem('cart', JSON.stringify(this.cart));
  }

  /**
   * Retourne la qte présente dans le panier d'un produit donné, identifié par sa référence.
   * @param produit Un produit
   * @returns La qte présente dans le panier de ce produit.
   */
  public getQteProduit(produit: Produit): number {
    return this.cart.items[produit?.reference] != null
      ? +this.cart.items[produit.reference].qte
      : 0;
  }

  /**
   * Sauvegarde un panier en base
   * @param saveCart La panier à sauvegarder
   */
  sauvegarderLePanierRequest(saveCart): Observable<any> {
    const mq = JSON.stringify(saveCart.map((sc) => (sc.marque)));
    const qt = JSON.stringify(saveCart.map((sc) => (sc.quantite)));
    const rf = JSON.stringify(saveCart.map((sc) => (encodeURIComponent(sc.reference))));

    const ret = this.httpClient.get<any>(`${environment.apiUrl}/Sauvepanier.php`,
      {
        withCredentials: true,
        params: {
          marque: mq,
          qte: qt,
          ref: rf
        }
      });
    return (ret);
  }

  /**
   * Ajoute un panier sauvegardé à au panier courant
   * @param addingCart Le panier sauvegardé à ajouter
   */
  addSavedCart(addingCart): void {
    const rf = addingCart.map((pd) => (pd.prod));
    this.httpClient.post<any>(
      `${environment.apiUrl}/PanierCalcul.php`,
      {
        ref: rf
      },
      {
        withCredentials: true,
        responseType: 'json',
      })
      .pipe(takeLast(1))
      .subscribe(
        (ret) => {
          this.addSavedProducts(
            this.formSavedProducts(ret),
            addingCart.slice(0).map((pd) => (Number(pd.quantitecommande)))
          );
        },
        (error) => {
          console.log('Erreur dans la requete PHP \'PanierCalcul.php\' dans CartService', error);
        }
      );
  }

  formSavedProducts(sCart): Array<Produit> {
    const products = [];
    let product: Produit;
    for (let i = 0; i < sCart.length; i++) {
      product = new Produit();
      product = sCart[i];

      /*product.classe = sCart[i].classe;
      product.codePromo = sCart[i].codePromo;
      product.dateConfReappro = sCart[i].dateConfReappro;
      product.delaisReappro = sCart[i].delaisReappro;
      product.depot1 = sCart[i].depot1;
      product.depot2 = sCart[i].depot2;
      product.designation = sCart[i].designation;
      product.enStock = sCart[i].enStock;
      product.gabarit = sCart[i].gabarit;
      product.genCod = sCart[i].genCod;
      product.marque = sCart[i].marque;
      product.marquelib = sCart[i].marquelib;
      product.pdf = sCart[i].pdf;
      product.photo = sCart[i].photo;
      product.prix = sCart[i].prix;
      product.prixAdd = sCart[i].prixAdd;
      product.prixAvant = sCart[i].prixAvant;
      product.prixD3E = sCart[i].prixD3E;
      product.prixPar = sCart[i].prixPar;
      product.prixPublic = sCart[i].prixPublic;
      product.qteEnReappro = sCart[i].qteEnReappro;
      product.qtePar = sCart[i].qtePar;
      product.qteStock1 = sCart[i].qteStock1;
      product.qteStock2 = sCart[i].qteStock2;
      product.reference = sCart[i].reference;
      product.reffournisseur = sCart[i].reffournisseur;
      product.remise = sCart[i].remise;
      product.unite = sCart[i].unite;*/
      products.push(product);
    }
    return (products);
  }

  /** Ajoute des produits sauvegardés au panier */
  public addSavedProducts(products, quantities): void {
    for (let i = 0; i < products.length; i++) {
      this.addProduit(products[i], quantities[i]);
    }
  }

  /**
   * Change la cotation d'un produit à la référence donnée dans le panier
   * @param cotation Nouvelle cotation du produit
   * @param referenceProduit Référence du produit cible dans le panier
   */
  public changeCotation(cotation: Cotation, referenceProduit: string): void {
    if (this.cart.items[referenceProduit]) {
      this.cart.items[referenceProduit].cotation = cotation;
      this.updateCart();
    }
  }

  /**
   * Retire la cotation d'un produit à la référence donnée du panier
   * @param referenceProduit Référence du produit cible
   */
  public removeCotation(referenceProduit: string): void {
    if (this.cart.items[referenceProduit]) {
      this.cart.items[referenceProduit].cotation = null;
      this.updateCart();
    }
  }

  /** Parse tous les produits du panier et en retire toutes les cotations */
  public clearAllCotationsFromCart(): void {
    Object.keys(this.cart.items).forEach(key => {
      this.removeCotation(key);
    });

    this.localStorage.setItem('cart', JSON.stringify(this.cart)); // save le panier dans le localStorage
  }

  checkQteCotation() {
    return Object.values(this.cart.items).some(item => item.cotation != null && item.qte < item.cotation.qtecdemini);
  }

  /** Renvoi un bool répondant à "Est-ce qu'un des produits du panier à une cotation active ?" */
  hasCotation(): boolean {
    return Object.values(this.cart.items).some(item => item.cotation !== null);
  }

  /** Renvoi un bool répondant à "Est-ce que le panier est vide ?" */
  isEmpty(): boolean {
    return (!this.qteProduits);
  }

  cartItemsChanged = new Subject<CartItem[]>();

  getSortedItems(): CartItem[] {
    let itemsArray = Object.values(this.cart.items);
    itemsArray.sort((a, b) => a.order - b.order);
    return itemsArray;
  }

  reorderItems(itemsArray: CartItem[]) {
    const newItems = {};
    for (let i = 0; i < itemsArray.length; i++) {
      const item = itemsArray[i];
      item.order = i; // Update the order of the item
      newItems[item.produit.reference] = item;
    }
    this._cart.value.items = newItems;
    this.updateCart();
  }

  getNumDevis() {
    return this.cart.numDevis;
  }

  setNumDevis(numDevis: string) {
    this.cart.numDevis = numDevis;
    this.updateCart();
  }

  getRefDevis() {
    return this.cart.refDevis;
  }

  setRefDevis(refDevis: string) {
    this.cart.refDevis = refDevis;
    this.updateCart();
  }
}
