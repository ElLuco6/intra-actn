import { Component, OnInit, OnDestroy } from '@angular/core';
import { Produit } from "@/models";
// RXJS
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
// SERVICES
import { FavorisService } from "@services/favoris.service";
import { ProduitService } from "@services/produit.service";
import {faThLarge, faThList} from "@fortawesome/free-solid-svg-icons";

type Format = 'list' | 'grid';

/**
 * Service qui enregistre, maintient et met à jours la liste de références produits à afficher dans le ComparateurComponent
 */
@Component({
  selector: 'app-favoris',
  templateUrl: './favoris.component.html',
  styleUrls: ['./favoris.component.scss']
})
export class FavorisComponent implements OnInit, OnDestroy {

  /** Liste multi onglet de favoris */
  produitsFavoris: Produit[] = [];

  /** Liste multi onglet des références de favoris */
  referencesOfFavoris: string[] = null;
  /** Subscription au FavorisService */
  favorisSubscription: Subscription = null;

  /** Format d'affichage des produits favoris dans le component
   * @example
   * 'grid' || 'list' */
  format: Format = 'grid';
  /** Doit on afficher les produits favoris en format simple ? */
  simple: boolean = false;
  /** Is there an error ? Disables the format buttons. */
  formatError: boolean = false;

  get isEmpty(): boolean {
    return this.referencesOfFavoris[0] === '';
  }

  constructor(
    private favorisService: FavorisService,
    private produitService: ProduitService
  ) { }

  /**
   * Initialisation de FavorisComponent
   */
  ngOnInit() {
    // setup and get 'referencesOfFavoris'
    this.referencesOfFavoris = this.favorisService.setUp();

    // get product for each 'referencesOfFavoris' and push them in 'produitsFavoris'
    setTimeout(() => {
      for (let i = this.referencesOfFavoris.length - 1; i >= 0; i--) {
        this.addProduitFromReference(this.referencesOfFavoris[i]);
      }
    }, 0);


    this.favorisSubscription = this.favorisService.favoris()
      .subscribe(
        (ret) => {
          this.referencesOfFavoris = ret;
          // mets à jour la list de Produits 'produitsCompare' s'il y a eu du changement dans la liste des références 'referencesOfProduitsCompare'
          this.updateProduitsFavorisFromReferencesOfProduitsCompare();
        },
        (error) => {
          console.error('Erreur dans \'FavorisComponent\': retour de la subscription au service \'FavorisService\' échoué', error);
        }
      );
  }

  /** Destruction de FavorisComponent */
  ngOnDestroy() {
    if (this.favorisSubscription != null) {
      this.favorisSubscription.unsubscribe();
    }
  }

  /**
   * Ajoute un produit au servive de favoris depuis sa référence
   * @param reference Référence du produit à ajouter au service de favoris
   */
  addProduitFromReference(reference: string): void {
    this.produitService.getProduitById(reference)
      .pipe(take(1))
      .subscribe(
        (ret) =>
        {
          if (ret.reference !== '') {
            this.produitsFavoris.push(ret);
          } else {
            this.favorisService.removeFavoris(reference);
          }
        },
        (error) =>
        {
          console.error('Erreur dans \'FavorisComponent\': \'ProduitByID.php\' à échoué :', error);
        }
      );
  }

  /**
   * Parse la liste des références des produits favoris et met à jour la liste des produits favoris
   * en enlevant les produits aux références retirées de la liste et en ajoutant les produits des nouvelles références dans la liste
   */
  updateProduitsFavorisFromReferencesOfProduitsCompare(): void
  {
    var alreadyHaveTheReferencesProduct: boolean = false;

    // retirer les produits qui ne sont plus comparés
    for (var i = this.produitsFavoris.length - 1; i >= 0; i--)
    {
      if (!this.referencesOfFavoris.includes(this.produitsFavoris[i].reference))
      {
        this.produitsFavoris.splice(i, 1);
        this.produitsFavoris = this.produitsFavoris.concat([]);
      }
    }
    // ajouter les produits ajoutés au comparateur
    for (var j = this.referencesOfFavoris.length - 1; j >= 0; j--)
    {
      // parse produits pour chaque reference de la nouvelle liste de ref
      alreadyHaveTheReferencesProduct = false;
      for (var k = this.produitsFavoris.length - 1; k >= 0; k--)
      {
        if (this.referencesOfFavoris[j] == this.produitsFavoris[k].reference)
        {
          alreadyHaveTheReferencesProduct = true;
          break;
        }
      }

      if (!alreadyHaveTheReferencesProduct)
      {
        this.addProduitFromReference(this.referencesOfFavoris[j]);
      }
    }
  }

  /** Change le format d'affichage des produits favoris */
  setFavorisFormat(newFormat: Format)
  {
    this.format = newFormat;
  }


  // Appelle le service de favoris pour ajouter, retirer, mettre à jour ou vider les produits
  /** Ajoute un produit au favoris */
  addF(str: string): void {
    this.favorisService.addFavoris(str);
  }
  /** Retire un produit des favoris */
  removeF(str: string): void {
    this.favorisService.removeFavoris(str);
  }
  /** Mets à jour la liste des favoris */
  updateF(): void {
    this.favorisService.updateFavoris();
  }
  /** Efface tous les produits des favoris */
  clearF(): void {
    this.favorisService.clearFavoris();
  }

  protected readonly faThList = faThList;
  protected readonly faThLarge = faThLarge;
}
