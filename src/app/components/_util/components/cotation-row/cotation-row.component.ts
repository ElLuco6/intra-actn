import {Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges} from '@angular/core';
import {CotationService} from "@services/cotation.service";
import {CartService} from "@services/cart.service";
import {Cotation, Produit} from "@/models";
import {takeUntil} from "rxjs/operators";
import {Subject} from "rxjs";
import {LocalStorageService} from "@services/local-storage.service";

@Component({
  selector: 'app-cotation-row',
  templateUrl: './cotation-row.component.html',
  styleUrls: ['./cotation-row.component.scss']
})
export class CotationRowComponent implements OnChanges, OnDestroy {

  @Input() produit: Produit = null;

  @Input() uneditable = false; // Si true, n'affiche que la cotation active et ne permet pas d'en changer

  @Input() warningOnQte = false; // Si true, on coutoure la quantité

  cotations: Cotation[] = null;

  indexOfCot = -1;

  @Output() activeCotation = new EventEmitter<Cotation>();

  private _destroy$ = new Subject<void>();

  defCot: number;

  constructor(
    private cotationService: CotationService,
    private cartService: CartService
  ) { }



  ngOnChanges(changes: SimpleChanges): void {
    if (changes['produit'] && changes['produit'].currentValue) {
      this.loadCotations();
    }
  }

  loadCotations(): void {
    this.cotationService.getProduitCotations(this.produit.reference)
      .pipe(takeUntil(this._destroy$))
      .subscribe(
        (ret) => {
          if (ret.length >= 1) {
            this.cotations = ret;
            this.setInitialCotation();
            const index = this.cotations.findIndex(cotation => cotation.perm === 'O');
            if (index !== -1) {
              this.defCot = index;
            }
          }
        }
      );
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  /**
   * Initialise 'indexOfCot' sur l'index de 'cotations' correspondant à la cotation active du produit s'il y en a une
   */
  setInitialCotation(): void {
    const item = this.cartService.cart.items[this.produit.reference];
    if (item && item.cotation) {
      const produitRef = item.cotation.produit;
      const index = this.cotations.findIndex(cotation => cotation.produit === produitRef);
      if (index !== -1) {
        this.indexOfCot = index;
        this.activeCotation.next(this.cotations[index]);
      }
    }
  }

  changeRadioCot(index): void {
    // si on clique 2 fois sur le même checkbox, on reset 'indexOfCot' à -1
    if (this.indexOfCot == index) { this.indexOfCot = -1; }
    else { this.indexOfCot = index; }

    if (this.indexOfCot >= 0) {
      this.cartService.changeCotation(this.cotations[this.indexOfCot], this.produit.reference);
      this.activeCotation.next(this.cotations[index]);
    }
    else {
      this.cartService.removeCotation(this.produit.reference);
      this.activeCotation.next(null);
    }
  }
}
