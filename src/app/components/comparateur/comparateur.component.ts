import {Component, OnInit} from '@angular/core';
import {environment} from "@env/environment";
import {Subscription, take} from "rxjs";
import {ComparateurService} from "@services/comparateur.service";
import {ProduitService} from "@services/produit.service";
import {HttpClient} from "@angular/common/http";
import {WindowService} from "@services/window.service";
import {Produit} from "@/models";
import {ExportToXslService} from "@services/export-to-xsl.service";
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-comparateur',
  templateUrl: './comparateur.component.html',
  styleUrls: ['./comparateur.component.scss']
})
export class ComparateurComponent implements OnInit {

  environment = environment;

  // Attributs
  /////////////////////////////////////////////////////////////////////////////////

  /** Liste des Produits comparés */
  produitsCompare: Produit[] = [];

  /** Liste multi onglet des references des produits comparés */
  referencesOfProduitsCompare: string[] = null;
  /** Subscription au 'ComparateurService' */
  compareSubscription: Subscription = null;
  /** Is the compare localStorage not empty ? */
  notEmpty: boolean = true;

  /////////////////////////////////////////////////////////////////////////////////

  // slider: Element = document.querySelector('.compareList');
  // isDown: boolean = false;
  // startX;
  // scrollLeft;


  constructor(
    private produitService: ProduitService,
    private comparateurService: ComparateurService,
    private http: HttpClient,
    private window: WindowService,
    private exportToXslService: ExportToXslService
  ) {
  }

  /**
   * Initialisation de ComparateurComponent
   * - Récupère la liste de références des produits comparés
   * - Récupère la liste des Produits à partir des références
   * - S'abonne au ComparateurService pour mettre à jours les liste
   */
  ngOnInit() {
    // setup and get 'referencesOfProduitsCompare'
    this.referencesOfProduitsCompare = this.comparateurService.setUp();

    // is 'referencesOfProduitsCompare' empty ?
    this.notEmpty = this.referencesOfProduitsCompare[0] != "";

    // get product for each 'referencesOfProduitsCompare' and push them in 'produitsCompare'
    setTimeout(() => {
      for (var i = this.referencesOfProduitsCompare.length - 1; i >= 0; i--) {
        this.addProduitObjFromReference(this.referencesOfProduitsCompare[i]);
      }
    }, 0);


    this.compareSubscription = this.comparateurService.compare()
      .subscribe(
        (ret) => {
          this.referencesOfProduitsCompare = ret;
          // mets à jour la list de Produits 'produitsCompare' s'il y a eu du changement dans la liste des références 'referencesOfProduitsCompare'
          this.updateProduitsCompareFromReferencesOfProduitsCompare();

          this.notEmpty = this.referencesOfProduitsCompare.length != 0;
        },
        (error) => {
          console.error("Erreur dans 'comparateurComponent': retour de la subscription au service 'comparateurService' échoué", error);
        }
      );
  }

  /** Destruction de ComparateurComponent */
  ngOnDestroy() {
    if (this.compareSubscription != null) {
      this.compareSubscription.unsubscribe();
    }
  }

  /**
   * Ajoute un objet Produit à la liste des produits comparés à sa position dans l'ordre des prix croissant
   */
  addToProduitsCompareByPrice(produit: Produit): void {
    for (var i = 0; i < this.produitsCompare.length; i++) {
      if (this.produitsCompare[i].prix >= produit.prix) {
        this.produitsCompare.splice(i, 0, produit);
        break;
      }
    }
    if (i >= this.produitsCompare.length) {
      this.produitsCompare.push(produit);
      this.produitsCompare = this.produitsCompare;
    }
    this.produitsCompare = this.produitsCompare.concat([]);
  }

  /**
   * Récupère les informations d'un produit depuis sa référence avant de l'ajouter à la liste des produits comparés
   * @param reference Référence du produit à ajouter aux produits comparés
   */
  addProduitObjFromReference(reference: string): void {
    this.produitService.getProduitById(reference)
      .pipe(take(1))
      .subscribe(
        (ret) => {
          if (ret.reference !== '') {
            // this.produitsCompare.push(ret);
            // this.produitsCompare = this.produitsCompare.concat([ret]);
            this.addToProduitsCompareByPrice(ret);
          } else {
            this.comparateurService.removeFromCompare(reference);
          }
        },
        (error) => {
          console.error("Erreur dans 'comparateurComponent': 'ProduitByID.php' à échoué :", error);
        }
      );
  }

  updateProduitsCompareFromReferencesOfProduitsCompare() {
    var alreadyHaveTheReferencesProduct: boolean = false;

    // retirer les produits qui ne sont plus comparés
    for (var i = this.produitsCompare.length - 1; i >= 0; i--) {
      if (!this.referencesOfProduitsCompare.includes(this.produitsCompare[i].reference)) {
        this.produitsCompare.splice(i, 1);
        this.produitsCompare = this.produitsCompare.concat([]);
      }
    }
    // ajouter les produits ajoutés au comparateur
    for (var j = this.referencesOfProduitsCompare.length - 1; j >= 0; j--) {
      // parse produits pour chaque reference de la nouvelle liste de ref
      alreadyHaveTheReferencesProduct = false;
      for (var k = this.produitsCompare.length - 1; k >= 0; k--) {
        if (this.referencesOfProduitsCompare[j] == this.produitsCompare[k].reference) {
          alreadyHaveTheReferencesProduct = true;
          break;
        }
      }

      if (!alreadyHaveTheReferencesProduct) {
        this.addProduitObjFromReference(this.referencesOfProduitsCompare[j]);
      }
    }
  }

  // EXCEL EXPORT
  /////////////////////////////////////////////////////////////////////////////////

  urlOfProduct(produit: any): string {
    let url = 'https://www.actn.fr/catalogue/';

    // Ajouter les niveaux de libellé s'ils existent
    if (produit.niveaulibelle1 && produit.niveaulibelle1 !== '.') {
      url += produit.niveaulibelle1 + '/';
    } else {
      url += '_/';
    }

    if (produit.niveaulibelle2 && produit.niveaulibelle2 !== '.') {
      url += produit.niveaulibelle2 + '/';
    } else {
      url += '_/';
    }

    if (produit.niveaulibelle3 && produit.niveaulibelle3 !== '.') {
      url += produit.niveaulibelle3 + '/';
    } else {
      url += '_/';
    }

    // Ajouter la référence du produit à la fin de l'URL
    url += produit.reference;

    return url;
  }

  export() {
    const data: any[][] = [];

    // Récupération de tous les critères possibles
    const allCritereNames: Set<string> = new Set();
    for (const product of this.produitsCompare) {
      for (const critere of product.crits) {
        if(critere.name != '' && critere.value != '') {
          allCritereNames.add(critere.name);
        }
      }
    }

    // Ajout des en-têtes
    const headers: string[] = [
      'Marque',
      'Désignation',
      'Référence',
      'Référence fournisseur',
      'Gencode',
      'Prix HT',
      'D3E',
      'Garantie',
      'Url vers le produit',
      ...Array.from(allCritereNames) // Ajout de tous les critères possibles
    ];
    data.push(headers);

    // Ajout d'une ligne vide après le header
    data.push([]);

    // Ajout des données des produits
    for (const product of this.produitsCompare) {
      const rowData: any[] = [
        product.marque,
        product.designation,
        product.reference,
        product.reffournisseur,
        product.genCod,
        product.prix,
        product.prixD3E,
        product.garantie,
        this.urlOfProduct(product)
      ];

      // Remplissage des valeurs pour chaque critère
      for (const critereName of Array.from(allCritereNames)) {
        const critere = product.crits.find(c => c.name === critereName);
        rowData.push(critere ? critere.value : ''); // Si le critère est trouvé pour ce produit, ajoutez sa valeur, sinon ajoutez une chaîne vide
      }
      data.push(rowData);
    }

    // Génération du nom de fichier
    const fileName = 'ACTN_Comparateur_export.xlsx';

    // Création du workbook
    const workbook = XLSX.utils.book_new();

    // Création d'une feuille
    const worksheet = XLSX.utils.aoa_to_sheet(data);

    // Définir la largeur des colonnes en fonction de la longueur des chaînes de caractères
    worksheet['!cols'] = data[0].map((col, i) => {
      return {wch: Math.max(...data.map(row => (row[i] ? String(row[i]).length : 0)))};
    });

    // Ajout de la feuille au workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Feuille 1');

    // Génération du fichier Excel
    XLSX.writeFile(workbook, fileName);
  }




  // COMPARATEUR SERVICE
  // Appelle le service de comparateur pour ajouter, retirer, mettre à jour ou vider les produits
  /////////////////////////////////////////////////////////////////////////////////
  /** Ajoute un produit au comparateur */
  addF(str: string): void {
    this.comparateurService.addToCompare(str);
  }

  /** Retire un produit du comparateur */
  removeF(str: string): void {
    this.comparateurService.removeFromCompare(str);
  }

  /** Mets à jour la liste du comparateur */
  updateF(): void {
    this.comparateurService.updateCompare();
  }

  /** Efface tous les produits du comparateur */
  clearF(): void {
    this.comparateurService.clearCompare();
  }

}
