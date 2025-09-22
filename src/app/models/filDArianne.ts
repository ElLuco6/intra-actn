/**
 * Modèle représentant le fil d'arianne.
 */
export class FilDArianne {
  /**
   * Liste des sections du fil d'arianne.
   */
  items: FilDArianneItem[];
}

/** Informations d'un element cliquable du Fil d'Arianne */
export class FilDArianneItem {

  /** url cible de l'element du fil d'Arianne */
  url: string;
  /** Label à afficher dans le Composant FilDArianne */
  label: string;
  /** Le chemin de l'URL est-il gardé */
  guarded?: boolean;
}
