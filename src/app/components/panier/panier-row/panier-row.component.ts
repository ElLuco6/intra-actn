import {AfterContentInit, Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {CartItem, Produit} from "@/models";
import {Client} from "@models/licence";
import {environment} from "@env/environment";
import {Subject} from "rxjs";
import {ProduitService} from "@services/produit.service";
import {CartService} from "@services/cart.service";
import {HttpClient} from "@angular/common/http";
import {takeUntil} from "rxjs/operators";
import {FormBuilder, Validators} from "@angular/forms";

@Component({
  selector: 'app-panier-row',
  templateUrl: './panier-row.component.html',
  styleUrls: ['./panier-row.component.scss']
})
export class PanierRowComponent implements OnInit, AfterContentInit {
  environment = environment;
  @Input() cartItem: CartItem;
  @Input() showInputNumber: boolean = true;
  @Input() cotationNotEditable: boolean = false;
  @Output() error = new EventEmitter<boolean>();
  @Input() indexRow: number;
  @Input() priceChange: boolean = false;
  @Output() panierValid = new EventEmitter<any>();

  produitComm: Produit = new Produit();

  showPopup = false;
  currentClient = new Client();
  currentIndex = 0;
  warningOnCotationQte: boolean = false;

  @Input() displayFormationForm: boolean = false;
  isFormation: boolean = false;

  display = [];



  get wrongValue(): boolean {
    return this._wrongValue;
  }
  set wrongValue(value: boolean) {
    this._wrongValue = value;
    this.error.emit(this._wrongValue);
  }

  public _wrongValue = false;
  _wrongValueMin = false;
  private _destroy$ = new Subject<void>();
  public details = new Array<boolean>();

  editPrix: boolean = false;

  constructor(
    public produitService: ProduitService,
    public cartService: CartService,
    private http: HttpClient,
    private fb: FormBuilder
  ) { }

  commentaireForm = this.fb.group({
    commentaire: ['', [Validators.required, Validators.maxLength(260), Validators.minLength(1)]]
  });

  commentaireFormEdit = this.fb.group({
    commentaire: ['', [Validators.required, Validators.maxLength(260), Validators.minLength(1)]]
  });

  ngOnInit(): void {
    this.cartService.cart$.pipe(takeUntil(this._destroy$)).subscribe(() => {
      this.wrongValue = (this.cartService.cart.items[this.cartItem.produit.reference]?.cotation?.qtecdemax - this.cartService.cart.items[this.cartItem.produit.reference]?.cotation?.qtecde) < this.cartService.getQteProduit(this.cartItem.produit);
      this.warningOnCotationQte = ( (this.cartService.cart.items[this.cartItem.produit.reference]?.cotation?.qtecdemax - this.cartService.cart.items[this.cartItem.produit.reference]?.cotation?.qtecde) < this.cartService.getQteProduit(this.cartItem.produit) );
    });
      // récupération des formulaire google d'inscription en la précense d'une formation
    if (this.cartItem.produit.niveaucode1 == "FOR")
    {
      this.isFormation = true;
    }
    this.cartItem.modifActiv = false;
  }

  ngAfterContentInit() {
    this.display[this.indexRow] = false;
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  /** Ajout d'un commentaire sur un produit dans le devis */
  ajoutComm(produit: Produit, commentaire: string): void {
    this.cartService.addCommProduit(commentaire, produit)
    this.commentaireForm.get('commentaire').setValue('');
  }

  /** Modification d'un commentaire sur un produit dans le devis */
  modifComm(produit: Produit, commentaire: string): void {
    this.cartService.addCommProduit(commentaire, produit)
    this.commentaireFormEdit.get('commentaire').setValue('');
  }

  deletePrixModif(ref) {
    this.cartItem.prixSaisi = 0;
    this.cartService.cart.items[ref].prixSaisi = 0;
    this.cartService.updateCart();
  }

  updatePrixModif(ref, price: string){
    let priceWithDot = price.replace(',', '.');
    let priceAsNumber = parseFloat(priceWithDot);

    if(isNaN(priceAsNumber)) {
      console.error("La valeur entrée n'est pas un nombre", price);
      return;
    }

    this.cartItem.prixSaisi = priceAsNumber;
    this.cartService.cart.items[ref].prixSaisi = priceAsNumber;
    this.cartService.updateCart();
  }

  unrollDetails(entete)
  {
    this.display[entete] = this.display[entete] == false;
  }

  /**
   * Met à jour la quantité d'un produit quand le champ de quantité est modifié.
   */
  quantiteChange(cartItem: CartItem, event: number): void
  {
    this.wrongValue = (+cartItem.produit.qtemini !== 0 && +cartItem.produit.qtemini < +cartItem.produit.qtemaxi
        && (event < +cartItem.produit.qtemini || event > +cartItem.produit.qtemaxi))
      || (+cartItem.produit.qtemini !== 0 && +cartItem.produit.qtemini !== 1 && +cartItem.produit.qtemini > +cartItem.produit.qtemaxi
        && (event < +cartItem.produit.qtemini))
      || ((this.cartService.cart.items[this.cartItem.produit.reference]?.cotation?.qtecdemax - this.cartService.cart.items[this.cartItem.produit.reference]?.cotation?.qtecde) < this.cartService.getQteProduit(this.cartItem.produit));
    this._wrongValueMin = this.cartItem.qte < this.cartService.cart.items[this.cartItem.produit.reference]?.cotation?.qtecdemini;
    this.panierValid.emit(this.cartService.cart.items);
    if (event <= 0) {
      this.cartService.removeProduit(cartItem.produit);
    } else {
      this.cartService.updateQuantiteProduit(cartItem.produit, event);
    }
  }

  removeProduit(cartItem: CartItem): void {
    this.cartService.removeProduit(cartItem.produit);
  }

  maximum(produit: Produit): number {
    return produit.codePromo === 'D' ? produit.qteStock1 : Number.MAX_SAFE_INTEGER;
  }

  isActive(index: number): boolean {
    return !!this.detailsShow[index];
  }

  get detailsShow(): Array<boolean> {
    return this.details;
  }

  showDetails(index: number): void {
    this.detailsShow[index] = !this.detailsShow[index];
  }

  showEnduserForm(client: Client, index: number): void {
    this.currentClient = client;
    this.currentIndex = index;
    this.showPopup = true;
  }

  clientChange(client: Client): void {
    if (client != null) {
      this.cartService.clientFinal = new Client(
        client.adresse1,
        client.adresse2,
        client.codepostal,
        client.mail,
        client.nom,
        client.telephone,
        client.ville,
        client.pays
      );
    }
    this.currentIndex = -1;
    this.showPopup = false;
  }

  isReducQt(cartItem: CartItem): boolean {
    if (cartItem.produit.prixPar > 0) {
      return !(cartItem.qte >= cartItem.produit.qtePar);
    } else {
      return true;
    }
  }

  protected readonly isNaN = isNaN;
}
