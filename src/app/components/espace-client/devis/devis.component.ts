import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  NgZone,
  OnDestroy,
  OnInit,
  QueryList,
  ViewChildren
} from '@angular/core';
import {BehaviorSubject, fromEvent, Observable, Subject} from "rxjs";
import {ProduitService} from "@services/produit.service";
import {WindowService} from "@services/window.service";
import {ActivatedRoute, Router} from "@angular/router";
import {debounceTime, skip, take, takeUntil} from "rxjs/operators";
import {Devis, DevisService} from "@services/devis.service";
import {Produit} from "@/models";
import {SortAndFilterService} from "@services/sort-and-filter.service";
import {PageEvent} from "@angular/material/paginator";
import {CartService} from "@services/cart.service";
import {AuthenticationService} from "@services/authentication.service";
import {environment} from "@env/environment";
import {LogClientService} from "@services/log-client.service";
import {faCheck, faFilePdf, faMinus, faPlus, faRedoAlt} from "@fortawesome/free-solid-svg-icons";

@Component({
  selector: 'app-devis',
  templateUrl: './devis.component.html',
  styleUrls: ['./devis.component.scss']
})
export class DevisComponent implements OnInit, OnDestroy, AfterViewInit {

  @ViewChildren('devis') protected _listeDevis: QueryList<ElementRef>;
  @Input() numClient: number = 0;

  devis$: Observable<Array<Devis>> = null;
  processedDevis$ = new BehaviorSubject<Array<Devis>>([]);
  marqueArray = new Map<string, string>();
  statutArray: Array<string> = [];
  marquesSelected: Array<string> = [];
  environment = environment;

  devisPopup: Devis = null;
  showEditPopup = false;
  showMissingPopup = false;
  showRefreshDevis = false;
  commentaireModification = '';
  demandeEnvoye = false;
  explicationPDFindispo = "Le fichier PDF associé à ce devis est momentanément indisponible."

  /**
   * Récupère les paramètres du paginator depuis DevisService
   * @returns les paramètres du paginator depuis DevisService
   */
  get paginator(): {
    pageIndex: number;
    pageSize: number;
    pageSizeOptions: number[];
    previousPageIndex: number;
    low: number;
    high: number;
  } {
    return this.devisService.paginator;
  }

  get detailsShow(): Array<boolean> {
    return this.devisService.details;
  }

  /** Observable de nettoyage, déclanchée à la destruction du DevisComponent */
  protected _destroy$ = new Subject<void>();
  /** Liste filtrés des Devis */
  protected _devis: Array<Devis> = null;

  constructor(
    public authService: AuthenticationService,
    public authClient: LogClientService,
    protected router: Router,
    protected cartService: CartService,
    protected devisService: DevisService,
    public saf: SortAndFilterService,
    protected produitService: ProduitService,
    protected activatedRoute: ActivatedRoute,
    protected ngZone: NgZone,
    protected window: WindowService
  ) { }

  /**
   * Initialisation du DevisComponent
   * - Parametrage du paginator
   * - Récupération et filtrage des Devis
   */
  ngOnInit(): void
  {
    this.processedDevis$
      .pipe(skip(1), takeUntil(this._destroy$))
      .subscribe(() => {
        this.paginator.low = 0;
        this.paginator.high = this.paginator.pageSize;
        this.paginator.pageIndex = 0;
      });

    this.devisService.getDevis(this.numClient)
      .pipe(take(1), takeUntil(this._destroy$))
      .subscribe(
        devis => {
          this._devis = devis.filter(devis => devis.transactioncode === 'PRW');
          const s = new Set<string>();
          this._devis.forEach(d => {
            d.produits.forEach(p => this.marqueArray.set(p.marque, p.marquelib));
            s.add(d.statut);
          });
          this.statutArray = Array.from(s).sort((s1, s2) => s1.localeCompare(s2));
          this.saf.setTri('devis', 'datecommande', 'date', 'desc');
          this.marquesSelected = this.saf.getFiltre('devis', 'produits.marquelib', 'includes') as Array<string> || [];
          this.processedDevis$.next(this.saf.filtrer('devis', this._devis));
        }
      );

    this.ngZone.runOutsideAngular(() => {
      fromEvent(this.window.document, 'scroll')
        .pipe(
          skip(1),
          debounceTime(20),
          takeUntil(this._destroy$))
        .subscribe(() => {
          this.devisService.scroll = this.window.pageYOffset;
        });
    });
  }

  /** Destruction du DevisComponent */
  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  /** Après initialisation de la vue de DevisComponent */
  ngAfterViewInit(): void {
    this._listeDevis.changes
      .pipe(
        takeUntil(this._destroy$),
        debounceTime(100)
      ).subscribe(() => {
      this.window.scrollTo(0, this.devisService.scroll);
    });
  }

  /**
   * Indique si les détails d'un devis doivent s'afficher.
   * @param index index du devis
   */
  isActive(index: number): boolean {
    return !!this.detailsShow[index];
  }

  /**
   * Affiche ou cache les détails d'un devis.
   * @param index index du devis
   */
  showDetails(index: number): void {
    this.detailsShow[index] = !this.detailsShow[index];
  }

  onShowEditPopup(devis: Devis): void {
    this.devisPopup = devis;
    this.showEditPopup = true;
  }

  onShowRefreshDevis(devis: Devis): void {
    this.devisPopup = devis;
    this.showRefreshDevis = true;
  }

  onHideEditPopup(): void {
    this.showEditPopup = false;
    this.devisPopup = null;
    this.demandeEnvoye = false;
    this.commentaireModification = '';
  }

  onHideMissingPopup(): void {
    this.showMissingPopup = false;
  }

  onHideRefreshDevis(): void {
    this.showRefreshDevis = false;
  }

  onDemandeEdition(): void {
    this.devisService.demandeModification(this.devisPopup.numcommande, this.commentaireModification).pipe(take(1)).subscribe(() => this.demandeEnvoye = true);
  }

  /**
   * Indique l'ordre du tri pour une colonne donnée.
   * @param s Le nom de la colonne
   * @returns *asc* pour ordre croissant, *desc* pour décroissant et *off* si inactif
   */
  selected(s: string): string {
    return this.saf.getTri('devis')[0] === s ? this.saf.getTri('devis')[1] : 'off';
  }

  /**
   * Ajoute 30 jours à une date.
   * @param date une date
   * @returns la date fournie + 30 jours
   */
  add30Days(date: Date): Date {
    const d = new Date(date.getTime());
    d.setDate(d.getDate() + 30);
    return d;
  }

  /**
   * Déclenche le tri des éléments quand un des éléments du bandeau est cliqué.
   * @param s La colonne sur laquelle trier
   * @param type Le type de tri a effectuer
   */
  onTri(s: string, type: string): void {
    this.processedDevis$.next(this.saf.onTri('devis', s, type, this.processedDevis$.value));
  }

  /**
   * Déclenche le filtrage des devis quand un filtre est modifié.
   * @param target La colonne sur laquelle filtrer
   * @param event L'objet lié à l'évènement déclencheur
   */
  onSearch(target: string, type: string, method: string, event: string, values?: string): void {
    if (values) {
      setTimeout(() => this.processedDevis$.next(this.saf.onFiltre('devis', target, type, method, this[values], this._devis)), 1);
    } else {
      setTimeout(() => this.processedDevis$.next(this.saf.onFiltre('devis', target, type, method, event['target'].value != null ? event['target'].value : event['target'].innerText, this._devis)), 1);
    }
  }

  /**
   * Ajoute tous les produits d'un devis dans le panier.
   * @param empty true si le panier doit être vidé, false sinon
   */
  onRefreshDevis(empty: boolean): void {
    if (empty) {
      this.cartService.emptyCart();
    }
    this.devisPopup.produits.forEach(produit => {
      const p = new Produit();
      p.marque = produit.marque;
      p.marquelib = produit.marquelib;
      p.reference = produit.prod;
      p.designation = produit.designation;
      p.prix = +produit.prixbase;
      // p.pr = produit.prixnet
      p.prixD3E = +produit.prixd3e;
      this.cartService.addProduit(p, +produit.quantitecommande);
    });
    this.router.navigate(['/panier']);
  }

  /**
   * Affiche la page de validation de devis.
   * @param devis Le devis à valider
   */
  onValider(devis: Devis): void {
    this.router.navigate(
      ['validation'],
      {
        relativeTo: this.activatedRoute,
        state: { devis }
      }
    );
  }

  /**
   * Redéfinit les variables du paginator quand celui-ci est modifié.
   * @param e Un objet de type PageEvent
   */
  onPaginatorEvent(e: PageEvent): void {
    this.paginator.pageIndex = e.pageIndex;
    this.paginator.low = e.pageIndex * e.pageSize;
    this.paginator.high = this.paginator.low + e.pageSize;
    this.paginator.pageSize = e.pageSize;
    this.paginator.previousPageIndex = e.previousPageIndex;
  }

  /**
   * Toggle les marques dans le filtre des marques.
   * @param marque La marque à toggle
   */
  filtreMarqueToggle(marque: string): void {
    if (this.marquesSelected.includes(marque)) {
      this.marquesSelected.splice(this.marquesSelected.findIndex(ms => ms === marque));
    } else {
      this.marquesSelected.push(marque);
    }
    this.marquesSelected = [].concat(this.marquesSelected);
    setTimeout(() => this.processedDevis$.next(this.saf.onFiltre('devis', 'produits.marquelib', 'array', 'includes', this.marquesSelected, this._devis)), 1);
  }

  /**
   * Affiche la fiche d'un produit à partir de sa référence.
   * @param ref La référence d'un produit
   */
  onClickReference(ref: string): void {
    this.produitService.getProduitById(ref).pipe(take(1), takeUntil(this._destroy$)).subscribe(produit => {
      if (produit.marque) {
        this.router.navigate(this.produitService.lienProduit(produit));
      } else {
        this.showMissingPopup = true;
      }
    });
  }

  protected readonly faFilePdf = faFilePdf;
  protected readonly faPlus = faPlus;
  protected readonly faMinus = faMinus;
  protected readonly faCheck = faCheck;
  protected readonly faRedoAlt = faRedoAlt;
}
