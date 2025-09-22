import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {Subscription} from "rxjs";
import {ComparateurService} from "@services/comparateur.service";

@Component({
  selector: 'app-comparateur-button',
  templateUrl: './comparateur-button.component.html',
  styleUrls: ['./comparateur-button.component.scss']
})
export class ComparateurButtonComponent implements OnInit, OnDestroy {
  @Input() produitReference: string;
  @Input() displayAsXIcon: boolean = false;

  // est ce que 'produitReference' est dans les favoris ?
  inCompare: boolean;
  // liste multi onglet des produits comparés
  referencesOfProductsInCompare: string[] = null;
  // subscription au ComparateurService
  comparateurSubscription: Subscription = null;


  constructor(
    public comparateurService: ComparateurService
  ) { }

  ngOnInit(): void {
    // set up
    this.referencesOfProductsInCompare = this.comparateurService.setUp();
    this.inCompare = this.referencesOfProductsInCompare.includes(this.produitReference);

    // subscribe
    this.comparateurSubscription = this.comparateurService.compare()
      .subscribe(
        (ret) =>
        {
          this.referencesOfProductsInCompare = ret;
          this.inCompare = ret.includes(this.produitReference);
        },
        (error) =>
        {
          console.error("Erreur dans 'AddToCartFormComponent': retour de la subscription au service 'ComparateurService' échoué", error);
        }
      );
  }

  ngOnDestroy()
  {
    if (this.comparateurSubscription != null) {
      this.comparateurSubscription.unsubscribe();
    }
  }

  toggleThisProductInComparateurService(): void
  {
    this.comparateurService.toggleCompare(this.produitReference);
  }

}
