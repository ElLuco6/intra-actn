import { Component, OnInit, Input, ViewChildren } from '@angular/core';
import { Produit } from '@/models';
import { Observable } from 'rxjs';
import { BanniereComponent } from '@components/_complementaire/banniere/banniere.component';
import { WindowService } from '@services/window.service';


/**
 * Affiche un ensemble de produits.
 */
@Component({
  selector: 'app-produits',
  templateUrl: './produits.component.html',
  styleUrls: ['./produits.component.scss']
})
export class ProduitsComponent implements OnInit {

  @Input() produits: Produit[];
  /**
   * Format d'affichage (liste ou vignette)
   */
  @Input() format: string;

  @Input() listMarque: Array<string>;
  /**
   * Nombre de produits actuellement affichés
   */
  @Input() toDisplay: number = 10;
  // Est-ce que l'affichage des produits doit être simplifié ?
  @Input() simple: boolean = false;

  @ViewChildren(BanniereComponent) banniereCompList: Array<BanniereComponent>;

  // OPTIONNAL INPUT
  @Input() isFavorisList: boolean = false;

  constructor(private window: WindowService) {}

  ngOnInit() {}

  onScrollDown() {
    this.toDisplay += 5;
  }

  onScrollUp() {
    this.toDisplay -= this.toDisplay > 5 ? 5 : 0;
  }

}
