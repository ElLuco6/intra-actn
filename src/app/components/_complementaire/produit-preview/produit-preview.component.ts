import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import {Cotation, Produit } from "@/models";
import { AuthenticationService } from "@services/authentication.service";
import { CotationService } from "@services/cotation.service";
import { SvgService } from "@services/svg.service";
import {CartService } from "@services/cart.service";
import { ComponentsInteractionService } from "@services/components-interaction.service";
import { ProduitService } from "@services/produit.service";
import { environment } from "@env/environment";
import {distinctUntilChanged, map, take, takeUntil} from 'rxjs/operators';
import {Observable, of, Subject, Subscription} from 'rxjs';
import {LogClientService} from "@services/log-client.service";

@Component({
  selector: 'app-produit-preview',
  templateUrl: './produit-preview.component.html',
  styleUrls: ['./produit-preview.component.scss']
})
/**
 * Composant affichant toutes les informations essentielles d'un produit dans une boite concise et adaptée à l'affichage par ligne ou en vignette
 */
export class ProduitPreviewComponent implements OnInit, OnDestroy
{
  /** Variable contenant les valeurs d'environement esssentielles au site */
  environment = environment;

  /** Input : Produit à afficher dans le ProduitPreviewComponent */
  @Input() get produit(): Produit {
    return this._produit;
  }
  set produit(value: Produit) {
    this._produit = value;
    this.lienProduit = this.produitService.lienProduit(this._produit);
    for (let i = 1; i <= 20; i++) {
      if (value[`criterelibelle${i}`] === 'Durée' && value[`criterevalue${i}`].length > 0) {
        this.hasAbonnement = true;
        this.dureeAbonnement = value[`criterevalue${i}`];
        break;
      }
    }

    let last = 0;
    last = this._produit?.pdfs?.length - 1; // s'assure qu'on ne va pas chercher des PDF s'il n'y en a pas
    if (last >= 0) {
      this.lastPdfOfPdfs = this._produit.pdfs[last];
    }
  }

  /**
   * Le format d'affichage actif (liste ou vignettes)
   * 'list' || 'grid' ?
   */
  @Input() format: string;

  /** True si le client a une cotation pour ce produit */
  hasCotation = false;

  /** True si le produit est dans la liste du comparateur. */
  inComparator = false;

  /** True si le produit est dans la liste des favoris. */
  inFav = false;

  lienProduit = [];

  /** Mode d'affichage, si true moins d'éléments sont affichés */
  @Input() simple = false;

  /** Si True, affiche la croix permettant de retirer le produit des produits comparés  */
  @Input() displayRemoveProductFromComparateurButton: boolean = false;
  /** Si True, affiche la croix permettant de retirer le produit des produits favoris  */
  @Input() displayRemoveProductFromFavorisButton: boolean = false;

  /**
   * Booléens d'affichage des promots
   */
  /** Le produit est-il en une promotion ? */
  isPromotion = false;
  /** Le produit est-il nouveau ? */
  isNouveau = false;
  /** Le produit est-il en destockage ? */
  isDestockage = false;
  /** Le produit fait t'il partie d'une opération spéciale ? */
  isOperationSpeciale = false;
  /** Le produit fait t'il partie d'un pack / bundle ? */
  isBundle = false;

  /**
   * Ouvre le popup et le layer des prix par quantité du produit
   */
  openQtePriceLayer: boolean = false;

  /** Phrase affichée quand on survole le panneau 'attention', par defaut : "Chargement en cours..." */
  phraseAttention: string = 'Chargement en cours...';
  /** Valeur du critère relatif à la location */
  locationCritereValue: string = "";

  /** nom du dernier pdf de la liste 'pdfs' d'objet */
  lastPdfOfPdfs: { label: string, url: string } = null;

  /** nom dy 'type' du cotationToolTip */
  cotationToolTipType: string = "cotation";
  /** Bool true si le produit a une cotationa active, change certains paramètres d'affichage */
  cotationWarn: boolean = false;
  /** L'index du prix par quantité appliqué en fonction de la quantité du produit dans le panier */
  qtePriceAppliedIndex: number;

  /** L'objet 'Produit' affiché par le ProduitPreviewComponent */
  private _produit: Produit;
  /** Est-ce que l'objet est un objet à abonnement ? */
  public hasAbonnement = false;
  /** Durée de l'abonnement du produit */
  public dureeAbonnement = '0';
  /** Observable de nettoyage, déclanchée à la destruction du composant */
  private _destroy$ = new Subject<void>();

  cotationLa: Cotation;


  /**
   * @param produitService
   * @param authService Gestion de l'authentification,
   * utilisé ici pour décider d'afficher ou non les prix et autres informations réservées aux clients connectés.
   * @param componentsInteractionService Lignes de communication entre composants éloignés,
   * Utilisé ici pour déclencher l'ouverture de la side-nav.
   * @param cotationService
   * @param svg
   * @param cartService
   * @param authClient
   */
  constructor(
    public produitService: ProduitService,
    public authService: AuthenticationService,
    public componentsInteractionService: ComponentsInteractionService,
    private cotationService: CotationService,
    public svg: SvgService,
    public cartService: CartService,
    public authClient: LogClientService
  ) { }

  /* Initialisation du ProduitPreviewComponent */
  ngOnInit(): void
  {
    this.authClient._currentCient$.subscribe(() => {
      setTimeout(() => {
        this.doesProductHaveCotation();
      }, 1000)
    });
    var tempProd: any = this._produit;
    this.locationCritereValue = tempProd.criterevalue19;
    this.getQtePriceAppliedIndex(0);

    this.cartService.cart$ // à chaque modification du cart
      .pipe(takeUntil(this._destroy$)) // jusqu'à que le product-preview-component soit détruit
      .subscribe( // vérifier si le produit à une cotation active
        (ret) =>
        {
          if (this.cartService.cart?.items[this.produit.reference]?.cotation != null) // if the product has a selected cotation
          {
            this.cotationToolTipType = "cotationWarn";
            this.cotationWarn = true;
          }
          else
          {
            this.cotationToolTipType = "cotation";
            this.cotationWarn = false;
          }
        }
      );
  }

  /* Destruction du ProduitPreviewComponent */
  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  /** Edite et renvoit this.produit.photo utilisable dans une URL pour afficher l'image */
  urlImage(): string {
    if (this.produit.photo.endsWith('.jpg')) {
      return this.produit.photo.substring(0, this.produit.photo.length - 4);
    } else {
      return this.produit.photo;
    }
  }

  /**
   * Verifie avec le service de cotation si le client a une cotation pour ce produit
   * et applique les modification nécéssaires à l'affichage si c'est le cas
   */
  doesProductHaveCotation(): void
  {
    this.cotationService.getProduitCotations(this._produit.reference)
      .pipe(take(1))
      .subscribe(
        (ret) =>
        {
          ret.forEach((d) => {
            if(d.perm == 'O'){
              this.cotationLa = d;
            }
          });
          this.hasCotation = ret.length >= 1;
        }
      );
  }

  /**
   * Déclenche le chargement de la description du produit pour extraire le "Attention".
   */
  loadAttention(): void {
    this.produitService.getProduitDescriptionById(this.produit.reference)
      .pipe(take(1), map((description: Description) => description.filter(d => d.type === 'ATT')))
      .subscribe((description: Description) => this.phraseAttention = description[0].description ?? 'Ce produit présente une spécificité, cliquez ici pour y accéder');
  }

  /** Set this.qtePriceAppliedIndex avec l'index du tableau de prix par quantité à appliquer en fonction de la quantité dans le panier */
  getQtePriceAppliedIndex(event: number)
  {
    this.qtePriceAppliedIndex = this.cartService.cart.items[this.produit.reference]?.priceByQtyAppliedIndex;
    if (this.qtePriceAppliedIndex == undefined)
    {
      this.qtePriceAppliedIndex = 0;
    }
  }

}

/** Type propice au stockage des lignes de descriptions */
type Description = {
  "type": string,
  "marque": string,
  "reference": string,
  "description": string
}[];
