import { Tree } from './basics';
import { Observable } from 'rxjs';
import { Produit } from './produit';

/**
 * Echantillon du catalogue
 * Filtres et produits disponibles pour une certaine position dans le catalogue (en fonction de l'url)
 */
export class CatalogueSample {
  /* Observable des filtres de l'échantillon */
  filtres$: Observable<Filtre[]>;
  /* Observable des produits de l'échantillon */
  produits$: Observable<Produit[]>;
}

/**
 * Un emplacement dans le catalogue
 */
export class CataloguePosition {
  /** Categorie niveau 1 du catalogue */
  category: string;
  /** Categorie niveau 2 du catalogue */
  subCategory: string;
  /** Categorie niveau 3 du catalogue */
  subSubCategory: string;

  constructor(category?: string, subCategory?: string, subSubCategory?: string) {
    this.category = category || '';
    this.subCategory = subCategory || '';
    this.subSubCategory = subSubCategory || '';
  }
}

/**
 * Modèle d'une catégorie (ou sous-catégorie, ...) du catalogue.
 */
export class Categorie {
  /**
   * ID de categorie/sous-categorie du catalogue
   * @example
   * "RE"
   */
  id: string;
  /** Nom complet de la categorie */
  label: string;
  /** Nom de l'image de la categorie */
  photo: string;
}

/**
 * Représente un attribut ou critère filtrable avec ses différentes options possibles.
 */
export class Filtre {
  /** Attribut ou critère visé par le filtre */
  target: string | number;
  /** Nom à afficher du filtre */
  label: string;
  /** Liste des options possibles pour ce filtre */
  options: any[];
  /** Type de filtre
   * @example
   * 'hidden' */
  type: string;
  method: string;
  forme: string;
  //affichable: string;
}
