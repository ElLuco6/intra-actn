import { News } from '@/services/news.service';
import {
  Component,
  ElementRef,
  EventEmitter,
  Inject,
  Input,
  NgZone,
  OnInit,
  Output,
  PLATFORM_ID,
  QueryList,
  ViewChild,
  ViewChildren
} from '@angular/core';
import {environment} from "@env/environment";
import {BehaviorSubject, fromEvent, Observable, Subject, take} from "rxjs";
import {Breakpoints} from "@/enum/breakPoints.enum";
import {Produit} from "@/models";
import {ProduitService} from "@services/produit.service";
import {AuthenticationService} from "@services/authentication.service";
import {WindowService} from "@services/window.service";
import {BreakpointObserver} from "@angular/cdk/layout";
import {debounceTime, takeUntil} from "rxjs/operators";
import {isPlatformBrowser} from "@angular/common";

export enum ScrollState {
  LEFT,
  RIGHT,
  MIDDLE
}


@Component({
  selector: 'app-sliding-liste',
  templateUrl: './sliding-liste.component.html',
  styleUrls: ['./sliding-liste.component.scss']
})
export class SlidingListeComponent implements OnInit {

  @Input() nbProduits = 15;

  @Input() simplePreviewProduct = true;

  // Uniquement pour la liste des produits
  @Input() title = '';
  @Input() random = false;
  @Input() reload = false;

  // Différents type de fonctionnement pour la liste, CHANGE RADICALEMENT LE COMPORTEMENT
  @Input() type: 'produit' | 'actu' | 'comparateur' | 'galerie' = 'produit';

  // Nom de la photo de base d'un produit
  @Input()
  get produit(): string {
    return this._produit;
  }
  set produit(value: string) {
    this._produit = value;
    if (!this._produit) {
      this._produit = "";
    }
    if(this.nbProduits > 0){
      this.arrGalerie = new Array(this.nbProduits);
    }

    setTimeout(() => this.resizeElements());
  }

  @Input() selected = 0;
  @Output() select = new EventEmitter<number>();

  environment = environment;

  @Input()
  get news(): Array<News> {
    return this._news;
  }
  set news(news: Array<News>) {
    if(news) {
      this.nbProduits = news.length;
      this._news = news;
    }
    setTimeout(() => this.resizeElements());
  }

  @ViewChildren('item', { read: ElementRef }) protected produitsElement: QueryList<ElementRef>;
  @ViewChild('slider', { read: ElementRef }) public slider: ElementRef<HTMLElement>;
  @ViewChild('sliderContainer', { read: ElementRef }) public sliderContainer: ElementRef<HTMLElement>;

  nbItems = 5;
  showing: number = this.nbItems;
  SCROLL: typeof ScrollState = ScrollState;
  scrollState: ScrollState = ScrollState.LEFT;
  /** Tableau pour boucler sur les images de la galerie */
  arrGalerie = [];

  protected _news = new Array<News>();
  protected _produits$ = new BehaviorSubject<unknown[]>([]);
  protected _destroy$ = new Subject<void>();
  /** Nom de la photo de base d'un produit */
  protected _produit = '';
  protected _breakpointState = Breakpoints.GT1300GE1650;

  @Input() set produits(value: unknown[]) {
    if (value != null && value.length > 0) {
      value = (this.random ? this.produitService.shuffle(value) : value).slice(0, this.nbProduits);
      value.map((produit: Produit) => produit.photo = this.fixPhotoLink(produit.photo));
      this._produits$.next(value);
      setTimeout(() => this.resizeElements());
    } else {
      this._produits$.next([]);
    }
  }

  get produits(): Array<unknown> {
    return this._produits$.getValue();
  }

  get produits$(): Observable<Array<unknown>> {
    return this._produits$.asObservable();
  }

  constructor(
    protected produitService: ProduitService,
    protected auth: AuthenticationService,
    protected window: WindowService,
    protected breakpointObserver: BreakpointObserver,
    protected ngZone: NgZone,
    @Inject(PLATFORM_ID) protected platformId: any
  ) { }

  ngOnInit(): void {
    this._reloadItems();
    this._listenBreakpoints();
    this._listenResize();
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  ngAfterViewInit(): void {
    this.produitsElement.changes.subscribe(() => this.resizeElements());
  }

  /**
   * Recharge les produits lors de la connexion ou déconnexion de l'utilisateur.
   */
  protected _reloadItems(): void
  {
    // Met à jour les produits affichés dès qu'un nouvel utilisateur se connecte en conservant l'ordre
    // UNIQUEMENT POUR LES PROMOS
    if (this.reload && this.type === 'produit') {
      this.auth.currentUser$
        .pipe(takeUntil(this._destroy$)) // attends que des produits ait été affectés au moins une fois
        .subscribe(() => {
          this.random = false;
          this.produitService.getPromos('N')  // relance la requête de produits
            .pipe(take(1))
            .subscribe(produits =>
              this._produits$
                .pipe(take(1))
                .subscribe((_produits) =>
                  this.produits = _produits.map((produit: Produit) => produit = produits.find((p: Produit) => p.reference === produit.reference))
                )
            );
        });
    }
  }

  /**
   * S'abonne au changement de breakpoints de la page.
   */
  protected _listenBreakpoints(): void {
    this.breakpointObserver
      .observe(['(min-width: 1650px)', '(min-width: 900px) and (max-width: 1300px)', '(max-width: 900px)'])
      .pipe(takeUntil(this._destroy$))
      .subscribe(breakpoints => {
        if (breakpoints.breakpoints['(min-width: 1650px)']) {
          this._breakpointState = Breakpoints.GT1650
        } else if (breakpoints.breakpoints['(min-width: 900px) and (max-width: 1300px)']) {
          this._breakpointState = Breakpoints.GT900GE1300
        } else if (breakpoints.breakpoints['(max-width: 900px)']) {
          this._breakpointState = Breakpoints.LE900;
        } else {
          this._breakpointState = Breakpoints.GT1300GE1650;
        }
        this.window.setTimeout(() => this.onResize());
      });
  }

  /**
   * S'abonne au redimensionnement de la page.
   */
  protected _listenResize(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.ngZone.runOutsideAngular(() => {
        fromEvent(this.window.window, 'resize')
          .pipe(
            debounceTime(20),
            takeUntil(this._destroy$))
          .subscribe(() => {
            this.resizeElements();
          });
      });
    }
  }

  /**
   * Ajoute .jpg à un lien d'une photo si il n'y est pas
   * @param photoLink Le lien de la photo à fix
   */
  fixPhotoLink(photoLink = ''): string {
    if (!photoLink.endsWith('.jpg')) {
      return photoLink + '.jpg';
    }
    return photoLink;
  }

  /**
   * Recalcule l'offset de déplacement et déplace le slider
   */
  slide(): void {
    const offset = (this.slider.nativeElement.offsetWidth + 5) * ((this.showing / this.nbItems) - 1);
    this.sliderContainer.nativeElement.style.transform = `translate3d(-${offset}px, 0, 0)`;
    this.checkScrollState();
  }

  /**
   * Evenement pour déplacer vers la gauche
   */
  onPrevious(): void {
    switch (this.scrollState) {
      case ScrollState.LEFT:
        // Rien
        break;
      case ScrollState.RIGHT:
        if (this.type !== 'comparateur') {
          this.showing -= this.nbItems;
        } else {
          this.showing--;
        }
        this.slide();
        break;
      case ScrollState.MIDDLE:
        if (this.type !== 'comparateur') {
          this.showing -= this.nbItems;
        } else {
          this.showing--;
        }
        this.slide();
        break;
    }
  }

  /**
   * Evenement pour déplacer vers la droite
   */
  onNext(): void {
    switch (this.scrollState) {
      case ScrollState.LEFT:
        if (this.type !== 'comparateur') {
          this.showing += this.nbItems;
        } else {
          this.showing++;
        }
        this.slide();
        break;
      case ScrollState.RIGHT:
        // Rien
        break;
      case ScrollState.MIDDLE:
        if (this.type !== 'comparateur') {
          this.showing += this.nbItems;
        } else {
          this.showing++;
        }
        this.slide();
        break;
    }
  }

  /**
   * Mets à jour l'état du slider
   */
  checkScrollState(): void {
    if (this.showing === this.nbItems) {
      this.scrollState = ScrollState.LEFT;
    } else if (this.showing >= this.nbProduits) {
      this.scrollState = ScrollState.RIGHT;
    } else {
      this.scrollState = ScrollState.MIDDLE;
    }
  }

  /**
   * Evenement de redimensionnement de la page
   */
  onResize(): void {
    switch (this.type) {
      case 'produit':
        switch (this._breakpointState) {
          case Breakpoints.GT1650:
            this.nbItems = 5;
            break;
          case Breakpoints.GT1300GE1650:
            this.nbItems = 3;
            break;
          case Breakpoints.GT900GE1300:
            this.nbItems = 3;
            break;
          case Breakpoints.LE900:
            this.nbItems = 1;
            break;
          default: break;
        }
        break;
      case 'actu':
        switch (this._breakpointState) {
          case Breakpoints.GT1650:
            this.nbItems = 3;
            break;
          case Breakpoints.GT1300GE1650:
            this.nbItems = 2;
            break;
          case Breakpoints.GT900GE1300:
            this.nbItems = 2;
            break;
          case Breakpoints.LE900:
            this.nbItems = 1;
            break;
          default: break;
        }
        break;
      case 'comparateur':
        switch (this._breakpointState) {
          case Breakpoints.GT1650:
            this.nbItems = 5;
            break;
          case Breakpoints.GT1300GE1650:
            this.nbItems = 4;
            break;
          case Breakpoints.GT900GE1300:
            this.nbItems = 3;
            break;
          case Breakpoints.LE900:
            this.nbItems = 2;
            break;
          default: break;
        }
        break;
      case 'galerie':
        switch (this._breakpointState) {
          case Breakpoints.GT1650:
            this.nbItems = 5;
            break;
          case Breakpoints.GT1300GE1650:
            this.nbItems = 4;
            break;
          case Breakpoints.GT900GE1300:
            this.nbItems = 3;
            break;
          case Breakpoints.LE900:
            this.nbItems = 2;
            break;
          default: break;
        }
        break;
    }
    this.showing = this.nbItems;
    this.resizeElements();
  }

  /**
   * Redimensionne les éléments du slider
   */
  resizeElements(): void {
    if (this.produitsElement != null) {
      this.produitsElement.forEach((produit) => {
        const width = (this.slider.nativeElement.offsetWidth - (this.nbItems - 1) * 15 - 10) / this.nbItems;
        produit.nativeElement.style.minWidth = this.type === 'galerie' ? `${width}px` : `${width > 150 ? width : 150}px`;
        produit.nativeElement.style.width = produit.nativeElement.style.minWidth;
        this.slide();
      });
    }
  }

  /**
   * Émet l'index de l'élément sélectionné.
   */
  onSelect(index: number): void {
    this.select.emit(index);
    this.selected = index;
  }

}
