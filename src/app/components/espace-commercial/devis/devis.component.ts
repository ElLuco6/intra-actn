import {
  Component,
  ElementRef,
  EventEmitter,
  NgZone,
  OnInit,
  Output,
  QueryList,
  ViewChild,
  ViewChildren
} from '@angular/core';
import {debounceTime, skip, take, takeUntil} from "rxjs/operators";
import {Devis, DevisService} from "@services/devis.service";
import {BehaviorSubject, fromEvent, Observable, Subject} from "rxjs";
import {SortAndFilterService} from "@services/sort-and-filter.service";
import {AuthenticationService} from "@services/authentication.service";
import {PageEvent} from "@angular/material/paginator";
import {environment} from "@env/environment";
import {ProduitService} from "@services/produit.service";
import {ActivatedRoute, Router} from "@angular/router";
import {LogClientService, PredictionResultsClient} from "@services/log-client.service";
import {CartService} from "@services/cart.service";
import {WindowService} from "@services/window.service";
import {Produit} from "@/models";
import {MatAutocompleteTrigger} from "@angular/material/autocomplete";
import {FormControl, Validators} from "@angular/forms";
import {faCheck, faFilePdf, faMinus, faPlus, faRedoAlt} from "@fortawesome/free-solid-svg-icons";

@Component({
  selector: 'app-devis',
  templateUrl: './devis.component.html',
  styleUrls: ['./devis.component.scss']
})
export class DevisComponent implements OnInit {

  @ViewChildren('devis') protected _listeDevis: QueryList<ElementRef>;
  @Output() hasFocusedInputChange = new EventEmitter<boolean>();
  @ViewChild(MatAutocompleteTrigger) autocomplete: MatAutocompleteTrigger;
  autoCompleteOptions$: Observable<PredictionResultsClient>;


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
  explicationPDFindispo = "Le fichier PDF associé à ce devis est momentanément indisponible.";
  allDevis: boolean;

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
  clientSearch = new FormControl('');
  searching: string;

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
    protected window: WindowService,
    public predictionService: LogClientService
  ) {
  }

  eventClientSearch;

  /**
   * Initialisation du DevisComponent
   * - Parametrage du paginator
   * - Récupération et filtrage des Devis
   */
  ngOnInit(): void {
    this.processedDevis$
      .pipe(skip(1), takeUntil(this._destroy$))
      .subscribe(() => {
        this.paginator.low = 0;
        this.paginator.high = this.paginator.pageSize;
        this.paginator.pageIndex = 0;
      });
    this.clientSearch.valueChanges.subscribe(searchString => {
      this.searching = searchString;
      this.predictionService.searchString = searchString;
    });
    this.predictionService.searchString$.pipe(takeUntil(this._destroy$)).subscribe(value => {
      if (this.searching !== value) {
        this.clientSearch.setValue(value);
      }
      this.autoCompleteOptions$ = this.predictionService.getPredict(value);
      this.searching = value.toUpperCase();
    });
    this.getDevis('');

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

  getDevis(region) {
    this.devisService.getDevisRegion(region)
      .pipe(take(1), takeUntil(this._destroy$))
      .subscribe(
        devis => {
          if (this.allDevis) {
            this.marqueArray.clear();
            this._devis = [];
          }
          this.allDevis = false;
          this._devis = devis;
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

  numClient: number;

  onShowRefreshDevis(devis: Devis, numClient?: number): void {
    this.devisPopup = devis;
    this.showRefreshDevis = true;
    this.numClient = numClient;
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
   * @param type
   * @param method
   * @param event L'objet lié à l'évènement déclencheur
   * @param values
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
    this.authClient.logClient(Number(this.devisPopup.client)).subscribe({
      next: () => {
        this.cartService.setNumDevis(this.devisPopup.numcommande);
        this.cartService.setRefDevis(this.devisPopup.referencecommande);
        this.router.navigate(['/panier']).then();
      },
      error: (error) => {
        console.error('Failed to authenticate client:', error);
      }
    });
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
        state: {devis}
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

  checked: boolean = true;

  isChecked() {
    if (this.checked) {
      this.getDevis('ALL');
      this.checked = false;
    } else {
      this.getDevis('');
      this.checked = true;
    }
  }

  inputFocused() {
    this.hasFocusedInputChange.emit(true);
  }

  start(mot: string): string {
    // verification de la recherche présente dans le mot
    if (mot.includes(this.searching)) {
      // découpage du mot pour ne renvoyer que le début (avant l'occurence de la recherche)
      return mot.slice(0, mot.indexOf(this.searching, 0));
    } else {
      // si la recherche n'est pas dans le mot (cas possible que lors d'une recherche reference/deignation),
      // la fonction start renvoie le mot et la fonction end renvoie la chaine vide afin de ne pas avoir de modification du mot
      return mot;
    }
  }


  // meme fonction qui permet de renvoyer la fin du mot
  end(mot: string): string {
    if (mot.includes(this.searching)) {
      return mot.slice(mot.indexOf(this.searching, 0) + this.searching.length);
    } else {
      // si la recherche n'est pas dans le mot (cas possible que lors d'une recherche reference/deignation),
      // la fonction start renvoie le mot et la fonction end renvoie la chaine vide afin de ne pas avoir de modification du mot
      return '';
    }
  }

  get region(): Array<any> {
    let region = [];
    this._devis.forEach((e) => {
      region.push(e.region);
    });
    region = region.filter((x, i) => region.indexOf(x) === i);
    return region;
  }

  openInNewWindow(client) {
    const url = this.router.serializeUrl(
      this.router.createUrlTree(['/client-detail/' + client])
    );
    window.open(decodeURIComponent(url), '_blank');
  }

  protected readonly faFilePdf = faFilePdf;
  protected readonly faPlus = faPlus;
  protected readonly faMinus = faMinus;
  protected readonly faCheck = faCheck;
  protected readonly faRedoAlt = faRedoAlt;
}
