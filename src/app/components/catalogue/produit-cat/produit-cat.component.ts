import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterEvent, Event } from '@angular/router';
import { CartService } from "@services/cart.service";
import { CotationService } from '@services/cotation.service';
import { ProduitDetailService } from "@services/produit-detail.service";
import { Produit, Cotation, User } from "@/models";
import { GrilleTarifaire } from "@models/grilleTarifaire";
import { LogClientService } from "@services/log-client.service";
import { filter, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { environment } from "@env/environment";
import { LoadingService } from "@services/loading.service";
import { Horizon } from "@models/horizon";


@Component({
  selector: 'app-produit-cat',
  templateUrl: './produit-cat.component.html',
  styleUrls: ['./produit-cat.component.scss'],
  animations: [
    trigger('expandVertical', [
      state('open', style({ height: '*' })),
      state('closed', style({ height: '0' })),
      transition('open => closed', animate('300ms ease-in-out')),
      transition('closed => open', animate('300ms ease-in-out'))
    ])
  ],
  providers: [ProduitDetailService]
})
export class ProduitCatComponent implements OnInit, OnDestroy {
  document = window.document;
  simpleProduitsAssocieVente = false;
  simpleProduitsRemplacementVente = false;
  simpleProduitsRenouvellementVente = false;
  formatProduitsAssocieVente = 'list';
  formatProduitsRemplacementVente = 'list';
  formatProduitsRenouvellementVente = 'list';
  environment = environment;
  produit: Produit = new Produit();
  imgUrl: string = null;
  cotations: Cotation[] = null;
  activeCotation: Cotation = null;
  descriptionMap: Map<string, Array<string>> = new Map();
  produitsRemplacement: Produit[] = [];
  produitsRenouvellement: Produit[] = [];
  produitsSimilaire: Produit[] = [];
  produitsAssocies: Produit[] = [];
  grilleTarif: Array<GrilleTarifaire> = [];
  horizonCmd: Array<Horizon> = [];
  qtePriceAppliedIndex: number;
  isLoading: boolean;
  private _destroy$ = new Subject<void>();
  currentUser: User;
  collapsedIdsArray: string[] = ['gille-tarif'];

  constructor(
    public authClient: LogClientService,
    private cotationService: CotationService,
    private router: Router,
    public cartService: CartService,
    protected produitDetailService: ProduitDetailService,
    private loadingService: LoadingService
  ) { }

  ngOnInit(): void {
    this.currentUser = JSON.parse(this.authClient.getClientFromStorage()) as User;
    this.authClient._currentCient$.subscribe(async d => {


      if (this.currentUser?.id !== d?.id) {


        this.currentUser = d;
        this.getProduit();
        this.cotationService.getProduitCotations(this.produit.reference).subscribe();
      } else {
        await this.asyncProduit();
        this.cotationService.getProduitCotations(this.produit.reference).subscribe(data => {

          this.cotations = data;

        });


      }
    });

    this.router.events.pipe(
      filter((e: Event | RouterEvent) => e instanceof RouterEvent),
      takeUntil(this._destroy$)
    ).subscribe(() => window.scrollTo({ top: 0, behavior: 'smooth' }));

    this.loadingService.loading$.subscribe(isLoading => {
      this.isLoading = isLoading;
    });
  }

  async asyncProduit(): Promise<Produit> {
    return new Promise((resolve) => {
      this.getProduit();
      resolve(this.produit);
    });
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  getProduit(): void {
    this.produitDetailService.getProduit((
      produit,
      imgUrl,
      cotations,
      description,
      produitsRemplacement,
      produitsRenouvellement,
      produitsSimilaires,
      produitsAssocies,
      grilleTarif,
      horizonCmd) => {
      this.produit = produit;
      this.imgUrl = imgUrl;
      this.cotations = cotations;
      this.descriptionMap = description;
      this.produitsRemplacement = produitsRemplacement;
      this.produitsRenouvellement = produitsRenouvellement;
      this.produitsSimilaire = produitsSimilaires;
      this.produitsAssocies = produitsAssocies;
      this.grilleTarif = grilleTarif;
      this.horizonCmd = horizonCmd;
      this.sortHorizonCmdByDate();
      this.getQtePriceAppliedIndex();
    });
  }

  sortHorizonCmdByDate() {
    this.horizonCmd.sort((a, b) => {
      const valueA = this.parseDate(a.dateLivraisonTheorique);
      const valueB = this.parseDate(b.dateLivraisonTheorique);
      return valueA - valueB;
    });
  }

  parseDate(dateStr: string): number {
    const [day, month, year] = dateStr.split('/').map(Number);
    return new Date(year, month - 1, day).getTime();
  }

  getQtePriceAppliedIndex(): void {
    this.qtePriceAppliedIndex = this.cartService.cart.items[this.produit.reference]?.priceByQtyAppliedIndex ?? 0;
  }

  jumpToAnchor(anchor: string): void {
    const element = document.getElementById(anchor);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }

  /**
   * Evenement de redimensionnement de la page
   */
  onResize(event): void {
    this.checkSize(event.target.innerWidth);
  }

  /**
   * Vérifie la taille en largeur de la page et modifie ses paramètre d'affichage en fonction
   */
  checkSize(width: number): void {
    if (width >= 1150) {
      this.simpleProduitsAssocieVente = false;
      this.formatProduitsAssocieVente = 'list';
    } else {
      this.simpleProduitsAssocieVente = true;
      this.formatProduitsAssocieVente = 'list';
      if (width < 768) {
        this.formatProduitsAssocieVente = 'grid';
      }
    }
  }

  /**
   * Change l'image affichée du produit
   * @param index Numero de l'image du produit à afficher
   */
  changePhoto(index: number): void {
    if (index === 0) {
      this.imgUrl = environment.photoReel + this.produitDetailService.urlImage(this.produit);
    } else {
      this.imgUrl = environment.photoReel + this.produitDetailService.urlImage(this.produit, index);
    }
  }

  /**
   * Ouvre ou ferme un élément.
   * @param event L'élément DOM déclencheur
   * @param id L'identifiant de l'élément
   */
  toggleCollapseDivById(event, id: string): void {
    if (!event.srcEvent) {
      if (this.collapsedIdsArray.includes(id)) {
        this.collapsedIdsArray.splice(this.collapsedIdsArray.indexOf(id), 1);
      } else {
        this.collapsedIdsArray.push(id);
      }
    }
  }

  /**
   * Change la cotation active du produit
   * @param event Nouvelle cotation du produit, null si on retire la cotation
   */
  changeActiveCotation(event: Cotation): void {
    this.activeCotation = event;
  }
}
