import { Component } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Produit} from "@/models";
import {Observable, Subscription} from "rxjs";
import {CatalogueSearchPredictionService, PredictionResults} from "@services/catalogue-search-prediction.service";
import {FormArray, FormBuilder, FormGroup} from "@angular/forms";
import {CartService} from "@services/cart.service";
import {CatalogueService} from "@services/catalogue.service";
import {WindowService} from "@services/window.service";
import {environment} from "@env/environment";
import {takeLast} from "rxjs/operators";

@Component({
  selector: 'app-commande-rapide',
  templateUrl: './commande-rapide.component.html',
  styleUrls: ['./commande-rapide.component.scss']
})
export class CommandeRapideComponent {
  form = this.fb.group({
    items: this.fb.array([
      /*this.newItem()*/
    ])
  });

  /* Produits correspondants aux references de 'items' */
  correspondingProducts: Array<Produit> = new Array<Produit>();
  /* Tableau de numbers correspondant au status des 'correspondingProducts' */
  correspondingProductsStatus: Array<number> = new Array<number>();

  /* Tableau des subscriptions de changements de valeurs des inputs, à Unsubscribe() OnDestroy*/
  inputsValueChangesSubscriptions: Array<Subscription> = new Array<Subscription>();
  /* Tableau stoquant les codes des timeout déclanchants 'getProductsInfoByIdInCorrespondingProducts()' après une demi seconde sans modification de l'input */
  inputsTimeouts: Array<number> = new Array<number>();

  autoCompleteOptions$: Observable<PredictionResults>;
  searching: string;

  statusReturn = 0;

  //////////////////////////////////////////////////////////////////////////////////////////////////////////

  constructor(
    private http: HttpClient,
    private fb: FormBuilder,
    private cartService: CartService,
    private catalogueService: CatalogueService,
    private predictionService: CatalogueSearchPredictionService,
    private window: WindowService
  ) { }

  ngOnInit() {
    for (let i = 0; i < 4; i++) {
      this.items.push(this.newItem(i));
      // this.addNewItem();
    }
  }

  ngOnDestroy() {
    for (let i = this.inputsValueChangesSubscriptions.length - 1; i >= 0; i--) {
      this.inputsValueChangesSubscriptions[i].unsubscribe();
    }
  }

  get items() {
    return this.form.get('items') as FormArray;
  }

  newItem(i: number) {
    // ajoute une nouvelle case au tableau des timeout pour y stocker celui du nouvel objet
    this.inputsTimeouts.push(0);
    // ajoute une nouvelle case au tableau des 'correspondingProducts'
    this.correspondingProducts.push(new Produit());
    // ajoute une nouvelle case au tableau des 'correspondingProductsStatus'
    this.correspondingProductsStatus.push(0);
    // création du formControl pour l'input
    const refControl = this.fb.control('');

    this.inputsValueChangesSubscriptions.push(
      refControl.valueChanges.subscribe(
        (searchString) => {
          const str = this.removeAccents(searchString);
          this.autoCompleteOptions$ = this.predictionService.getPredictions(
            str
          );

          this.searching = str;
          ////////////////////////////////////////////////////////////////////////////////////GET PRODUCT HERE ? Also unsubscribe refControl.valueChanges.subscribe ?
          // GET PRODUCT INFO + timeout

          // if no changes since timeout duration
          clearTimeout(this.inputsTimeouts[i]);
          this.inputsTimeouts[i] = this.window.setTimeout(
            () => {
              this.statusReturn = 0;
              this.getProductsInfoByIdInCorrespondingProducts(searchString, i);
            },
            600
          );
        }
      )
    );

    return this.fb.group({
      ref: refControl,
      qte: this.fb.control(1)
    });
  }

  removeAccents(str: string): string {
    if (str) {
      return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    }
    return ("");
  }

  start(mot: string) {
    //verification de la recherche présente dans le mot
    if (mot.toUpperCase().includes(this.searching.toUpperCase())) {
      //découpage du mot pour ne renvoyer que le début (avant l'occurence de la recherche)
      return mot.slice(0, mot.toUpperCase().indexOf(this.searching.toUpperCase(), 0));
    }
    else {
      //si la recherche n'est pas dans le mot (cas possible que lors d'une recherche reference/deignation),
      //la fonction start renvoie le mot et la fonction end renvoie la chaine vide afin de ne pas avoir de modification du mot
      return mot
    }
  }

  //meme fonction qui permet de renvoyer la fin du mot
  end(mot: string) {
    if (mot.toUpperCase().includes(this.searching.toUpperCase())) {
      return mot.slice(mot.toUpperCase().indexOf(this.searching.toUpperCase(), 0) + this.searching.length);
    }
    else {
      //si la recherche n'est pas dans le mot (cas possible que lors d'une recherche reference/deignation),
      //la fonction start renvoie le mot et la fonction end renvoie la chaine vide afin de ne pas avoir de modification du mot
      return '';
    }
  }
  /**
   * @returns Le coût H.T. total de tous les produits dans la qte souhaitée.
   */
  get total() {
    let totalP = 0;
    for (let i = this.correspondingProducts.length - 1; i >= 0; i--)
    {
      if (this.correspondingProducts[i].prix)
      {
        // si un prix par quantité s'applique
        if (this.correspondingProducts[i].hasPriceByQte)
        {
          let qpai: number = this.getPriceByQtyAppliedIndex(i);
          totalP = totalP + (+this.correspondingProducts[i].qtePrice[qpai].price * +Number(this.items.value[i].qte));
        }
        else // total normal
        {
          totalP = totalP + (+this.correspondingProducts[i].prix * +Number(this.items.value[i].qte));
        }


        if (Number(this.items.value[i].qte) >= this.correspondingProducts[i].qtePar) {
          totalP = totalP + (this.correspondingProducts[i].prixPar * Number(this.items.value[i].qte));
        } else {
          totalP = totalP + (this.correspondingProducts[i].prix * Number(this.items.value[i].qte));
        }
      }
    }
    return (totalP);
  }
  getPriceByQtyAppliedIndex(i: number): number {
    const correspondingProduct = this.correspondingProducts[i];
    const itemsValue = this.items.value[i];

    if (correspondingProduct.hasPriceByQte) {
      const qteValue = +itemsValue.qte;

      const qpai = correspondingProduct.qtePrice.findIndex(price => qteValue < price.qte);

      return qpai === -1 ? correspondingProduct.qtePrice.length - 1 : qpai - 1;
    }

    return 0;
  }

  /**
   * Trouve un produit avec sa référence puis l'enregistre dans un Object 'prod: Produit' et le stoque dans 'this.correspondingProducts' au numéro d'itération de l'input
   */
  getProductsInfoByIdInCorrespondingProducts(id: string, i: number)
  {
    this.correspondingProductsStatus[i] = 0;
    this.http.get(
      `${environment.apiUrl}/ProduitByID.php`,
      {
        withCredentials: true,
        responseType: 'json',
        params: { ref: encodeURIComponent(id) } // encodage permettant l'envois de caractères spéciaux
      }
    ).pipe(takeLast(1))
      .subscribe(
        (ret: any) => {
          const prod: Produit = ret;

          if (ret.reference == "") {
            if (id == "") {
              this.correspondingProductsStatus[i] = 0;
            }
            else {
              this.correspondingProductsStatus[i] = 1;

            }
          }
          else {
            this.correspondingProductsStatus[i] = 2;
          }

          /*prod.classe = ret.classe;
          prod.codePromo = ret.codePromo;
          prod.crits = ret.crits;
          prod.dateConfReappro = ret.dateConfReappro;
          prod.delaisReappro = ret.delaisReappro;
          prod.depot1 = ret.depot1;
          prod.depot2 = ret.depot2;
          prod.designation = ret.designation;
          prod.enStock = ret.enStock;
          prod.gabarit = ret.gabarit;
          prod.garantie = ret.garantie;
          prod.genCod = ret.genCod;
          prod.marque = ret.marque;
          prod.marquelib = ret.marquelib;
          prod.pdf = ret.pdf;
          prod.photo = ret.photo;
          prod.prix = ret.prix;
          prod.prixAdd = ret.prixAdd;
          prod.prixAvant = ret.prixAvant;
          prod.prixD3E = ret.prixD3E;
          prod.prixPar = ret.prixPar;
          prod.prixPublic = ret.prixPublic;
          prod.qteEnReappro = ret.qteEnReappro;
          prod.qtePar = ret.qtePar;
          prod.qteStock1 = ret.qteStock1;
          prod.qteStock2 = ret.qteStock2;
          prod.reference = ret.reference;
          prod.reffournisseur = ret.reffournisseur;
          prod.remise = ret.remise;
          prod.unite = ret.unite;
          prod.poidsbrut = ret.poidsbrut;
          prod.promolibelle = ret.promolibelle;*/

          this.correspondingProducts[i] = prod;
        },
        (error) => {
          console.log("Erreur dans la requete 'ProduitByID.php' :", error);
        }
      );
  }

  onSubmit() {
    // for all inputs
    for (let i = this.items.value.length - 1; i >= 0; i--) {
      // if the input is filled
      if (this.items.value[i].ref) {
        // if a corresponding product has been found
        if (this.items.value[i].ref == this.correspondingProducts[i].reference) {
          // add the corresponding product to the cart service
          this.cartService.addProduit(this.correspondingProducts[i], this.items.value[i].qte);
          // this.addProductToCartServiceFromInputs(i);
        }
      }
    }
    this.statusReturn = 3;
  }

  /**
   * Go search for complementary product information with "ProduitByID.php"
   * make a object 'Produit' out of it
   * then add the product and it's quantity to the cart using the cart service
   */
  addProductToCartServiceFromInputs(i: number) {
    this.http.get(
      `${environment.apiUrl}/ProduitByID.php`,
      {
        withCredentials: true,
        responseType: 'json',
        params: { ref: this.items.value[i].ref }
      }
    )
      .pipe(takeLast(1))
      .subscribe(
        (ret: any) =>
        {
          const prod: Produit = new Produit;

          prod.classe = ret.classe;
          prod.codePromo = ret.codePromo;
          prod.crits = ret.crits;
          prod.dateConfReappro = ret.dateConfReappro;
          prod.delaisReappro = ret.delaisReappro;
          prod.depot1 = ret.depot1;
          prod.depot2 = ret.depot2;
          prod.designation = ret.designation;
          prod.enStock = ret.enStock;
          prod.gabarit = ret.gabarit;
          prod.garantie = ret.garantie;
          prod.genCod = ret.genCod;
          prod.marque = ret.marque;
          prod.marquelib = ret.marquelib;
          prod.pdf = ret.pdf;
          prod.photo = ret.photo;
          prod.prix = ret.prix;
          prod.prixAdd = ret.prixAdd;
          prod.prixAvant = ret.prixAvant;
          prod.prixD3E = ret.prixD3E;
          prod.prixPar = ret.prixPar;
          prod.prixPublic = ret.prixPublic;
          prod.qteEnReappro = ret.qteEnReappro;
          prod.qtePar = ret.qtePar;
          prod.qteStock1 = ret.qteStock1;
          prod.qteStock2 = ret.qteStock2;
          prod.reference = ret.reference;
          prod.reffournisseur = ret.reffournisseur;
          prod.remise = ret.remise;
          prod.unite = ret.unite;
          prod.poidsbrut = ret.poidsbrut;
          prod.promolibelle = ret.promolibelle;

          // ajouter toutes les infos du produit récoltés au panier
          this.cartService.addProduit(prod, this.items.value[i].qte);
        },

        (error) => {
          console.log("Erreur dans la requete 'ProduitByID.php' :", error);
        }

      );
  }

  /**
   * Change 'qte' of the FormGroup Items[i] by 1
   */
  qteChange(i: number, event: number) {

    const fg: FormGroup = this.items.controls[i] as FormGroup;
    fg.controls['qte'].setValue(event);
  }

  resetInput(i: number) {
    const fg: FormGroup = this.items.controls[i] as FormGroup;

    fg.controls['ref'].setValue("");
    fg.controls['qte'].setValue("1");

    this.correspondingProducts[i] = new Produit();

    this.items.controls[i].updateValueAndValidity({ onlySelf: false, emitEvent: true });
  }
  resetAllInputs() {
    for (let i = this.items.controls.length - 1; i >= 0; i--) {
      this.resetInput(i);
    }

    // DISPLAY STATUS
    this.statusReturn = 1;
  }

  saveInputsAsCart() {
    const cart: Array<any> = new Array<any>();

    for (let i = this.correspondingProducts.length - 1; i >= 0; i--) {
      if (this.correspondingProducts[i].reference) {
        cart.push({
          marque: this.correspondingProducts[i].marque,
          quantite: Number(this.items.value[i].qte),
          reference: this.correspondingProducts[i].reference
        });
      }
    }
    this.cartService.sauvegarderLePanierRequest(cart)
      .pipe(takeLast(1))
      .subscribe(
        (data) => {
        },
        (error) => {
          console.log("Error dans la requete : 'Sauvepanier.php'", error);
        }
      );

    // DISPLAY STATUS
    this.statusReturn = 2;
  }

  isReducQt(prod, i): boolean {
    if (prod.prixPar > 0) {
      const fg: FormGroup = this.items.controls[i] as FormGroup;
      return !(fg.controls['qte'].value >= prod.qtePar);
    } else {
      return true;
    }
  }
}
