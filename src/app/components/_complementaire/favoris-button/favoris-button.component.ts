import {Component, Input, OnInit} from '@angular/core';
import {FavorisService} from "../../../services/favoris.service";
import {Subscription} from "rxjs";

@Component({
  selector: 'app-favoris-button',
  templateUrl: './favoris-button.component.html',
  styleUrls: ['./favoris-button.component.scss']
})
export class FavorisButtonComponent implements OnInit {
  @Input() produitReference: string;
  @Input() displayAsXIcon: boolean = false;

  // Est-ce que 'produitReference' est dans les favoris ?
  inFav: boolean;
  // Liste multi onglet des favoris
  referencesOfFavoris: string[] = null;
  // Subscription au FavorisService
  favorisSubscription: Subscription = null;

  constructor(
    public favorisService: FavorisService
  ) { }

  ngOnInit(): void {
    // set up
    this.referencesOfFavoris = this.favorisService.setUp();
    if (this.referencesOfFavoris.includes(this.produitReference)) {
      this.inFav = true;
    }
    else {
      this.inFav = false;
    }

    // subscribe
    this.favorisSubscription = this.favorisService.favoris()
      .subscribe(
        (ret) => {
          this.referencesOfFavoris = ret;
          if (ret.includes(this.produitReference)) {
            this.inFav = true;
          }
          else {
            this.inFav = false;
          }
        },
        (error) => {
          console.error('Erreur dans \'AddToCartFormComponent\': retour de la subscription au service \'FavorisService\' échoué', error);
        }
      );
  }

  ngOnDestroy() {
    if (this.favorisSubscription != null) {
      this.favorisSubscription.unsubscribe();
    }
  }

  toggleThisProductInFavorisService(): void {
    this.favorisService.toggleFavoris(this.produitReference);
  }

}
