import {Component, EventEmitter, Input, NgZone, OnInit, Output} from '@angular/core';
import {ProduitService} from "@services/produit.service";
import {WindowService} from "@services/window.service";
import {ActivatedRoute, Router} from "@angular/router";
import {debounceTime, skip, take, takeUntil} from "rxjs/operators";
import {Devis, DevisService} from "@services/devis.service";
import {fromEvent} from "rxjs";
import {SortAndFilterService} from "@services/sort-and-filter.service";
import {CartService} from "@services/cart.service";
import {AuthenticationService} from "@services/authentication.service";
import {DevisComponent} from "@components/espace-client/devis/devis.component";
import {LogClientService} from "@services/log-client.service";
import {faCheck, faFilePdf, faMinus, faPlus, faRedoAlt} from "@fortawesome/free-solid-svg-icons";
import {environment} from "@env/environment";

@Component({
  selector: 'app-devis-actn',
  templateUrl: './devis-actn.component.html',
  styleUrls: ['../devis.component.scss']
})
export class DevisActnComponent extends DevisComponent implements OnInit {
  @Input() override numClient: number = 0;
  constructor(
    public override authService: AuthenticationService,
    public override authClient: LogClientService,
    protected override router: Router,
    protected override cartService: CartService,
    protected override devisService: DevisService,
    public override saf: SortAndFilterService,
    protected override produitService: ProduitService,
    protected override activatedRoute: ActivatedRoute,
    protected override ngZone: NgZone,
    protected override window: WindowService) {
    super(authService, authClient, router, cartService, devisService, saf, produitService, activatedRoute, ngZone, window);
  }

  @Output() public Refresh = new EventEmitter<Devis>();

  override onShowRefreshDevis(devis: Devis){
    this.Refresh.emit(devis);
  }

  @Output() public Edit = new EventEmitter<Devis>();

  override onShowEditPopup(devis: Devis){
    this.Edit.emit(devis);
  }

  override ngOnInit(): void {
    if(this.numClient == 0){
      this.numClient = this.authClient.currentClient.id;
    }
    this.processedDevis$
      .pipe(skip(1), takeUntil(this._destroy$))
      .subscribe(() => {
        this.paginator.low = 0;
        this.paginator.high = this.paginator.pageSize;
        this.paginator.pageIndex = 0;
      });

    this.devisService.getDevis(this.numClient)
      .pipe(take(1), takeUntil(this._destroy$))
      .subscribe(devis => {
        this._devis = devis.filter(devis => devis.transactioncode === 'DEV');
        const s = new Set<string>();
        this._devis.forEach(d => {
          d.produits.forEach(p => this.marqueArray.set(p.marque, p.marquelib));
          s.add(d.statut);
        });
        this.statutArray = Array.from(s).sort((s1, s2) => s1.localeCompare(s2));
        this.saf.setTri('devis', 'datecommande', 'date', 'desc');
        this.marquesSelected = this.saf.getFiltre('devis', 'produits.marquelib', 'includes') as Array<string> || [];
        this.processedDevis$.next(this.saf.filtrer('devis', this._devis));
      });

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

  protected override readonly faFilePdf = faFilePdf;
  protected override readonly faPlus = faPlus;
  protected override readonly faMinus = faMinus;
  protected override readonly faCheck = faCheck;
  protected override readonly faRedoAlt = faRedoAlt;
}
