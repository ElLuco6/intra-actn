/**
 * Modèle d'un produit.
 * Les attributs décrits ici sont communs à tous les produits, tous les produits possèdent une marque, une photo, etc...
 * Les produits possèdent également des attributs dynamiques (de type Critere),
 * ajoutés à la récupération du produit depuis le backend.
 */
export class Produit {

  Prixlibelle: string;
  prixrevient: number;
  ncotation
  classe: number;
  prixdatepromo: string;
  /**
   * Code désignant le type de promotion appliqué du produit
   * Aucune promotion si vide
   * N => Nouveauté
   * D => Déstockage
   * P => Promotion
   * B => Pack
   * '' (vide) => Pas de promotion
   */
  codePromo: string;
  crits: Array<any>;
  dateConfReappro: string;
  delaisReappro: number;
  depot1: string;
  depot2: string;
  /**
   * Désignation complete du produit
   */
  designation: string;

  prixstd: number;

  /**
   * Ce produit est t'il dans le stock local
   * @example
   * "O" | "N"
   */
  enStock: string;

  /**
   * Gabarit du produit
   * V => Virtuel
   * H => Hors gabarit
   * '' (vide) => Gabarit classique
   */
  gabarit: 'V' | 'H' | '';

  /**
   * Durée en mois de la garantie du produit
   */
  garantie: string;
  genCod: string;

  /**
   * Bool indiquant si le produit a des prix variables selon là quantité commandée
   */
  hasPriceByQte: boolean;
  livraisondirecte: string;

  /**
   * Code de marque du produit
   * Maximum 4 caractères
   * @example
   * "GRAN"
   */
  marque: string;

  /**
   * Nom complet de la marque du produit
   * @example
   * "GRANDSTREAM"
   */
  marquelib: string;

  /**
   * Nom du PDF principal du produit
   */
  pdf: string;
  /**
   * Tableau de tous les PDFs du produit et leurs labels
   * @example
   * [
   *   { url: "HIK-HCSA-FD-M2", label: "Voir la fiche commerciale" },
   *   { url: "HIK-HCSA-FD-M2_FOR", label: "Programme de la formation" }
   * ]
   */
  pdfs: Array<{ label: string, url: string }>;

  /**
   * Nom de la photo principale du produit
   */
  photo: string;
  prix: number;
  prixAdd: number;
  prixAvant: number;
  prixD3E: number;
  prixPar: number;

  /**
   * Prix public du produit
   */
  prixPublic: number;

  /**
   * Quantité de ce produit en réapprovisionnement
   */
  qteEnReappro: number;
  qtePar: number;
  qtePrice: Array<{price: number, qte: number}>;

  /**
   * Quantité de ce produit en stock local
   */
  qteStock1: number;
  qteStock2: number;
  /**
   * Quantité minimum du produit commandable en une fois
   * Pas de quantité minimum si égal à 0
   */
  qtemini: number;
  /**
   * Quantité maximum du produit commandable en une fois
   * Pas de quantité maximum si égal à 0
   */
  qtemaxi: number;

  /**
   * Reference ACTN du produit
   */
  reference: string;

  /**
   * Reference du fournisseur pour le produit
   */
  reffournisseur: string;

  remise: number;
  unite: string;

  /**
   * Poids en kg du produit
   * utile à la livraison
   */
  poidsbrut: number;

  /**
   * Libellé complet de la promotion appliquée au produit s'il y en a une
   * @example
   * 'Nouveauté'
   */
  libPromo: string;
  promolibelle: string
  /**
   * Nom de l'image du produit
   */
  photos: number;

  /**
   * Code de la catégorie niveau 1 du produit
   * Maximum 3 caractères
   * @example
   * "TEL"
   */
  niveaucode1: string;

  /**
   * Code de la catégorie niveau 2 du produit
   * Vide si le produit n'en a pas
   * Maximum 3 caractères
   * @example
   * niveaucode1: "TSF"
   */
  niveaucode2: string;
  /**
   * Code de la catégorie niveau 3 du produit
   * Vide si le produit n'en a pas
   * Maximum 3 caractères
   * @example
   * niveaucode2: "DEC"
   */
  niveaucode3: string;
  /**
   * Code de la catégorie niveau 4 du produit
   * Vide si le produit n'en a pas
   * Maximum 3 caractères
   */
  niveaucode4: string;
  /**
   * Code de la catégorie niveau 5 du produit
   * Vide si le produit n'en a pas
   * Maximum 3 caractères
   */
  niveaucode5: string;

  /**
   * Libellé complet de la catégorie niveau 1 du produit
   */
  niveaulibelle1: string;
  /**
   * Libellé complet de la catégorie niveau 2 du produit
   */
  niveaulibelle2: string;
  /**
   * Libellé complet de la catégorie niveau 3 du produit
   */
  niveaulibelle3: string;
  /**
   * Libellé complet de la catégorie niveau 4 du produit
   */
  niveaulibelle4: string;
  /**
   * Libellé complet de la catégorie niveau 5 du produit
   */
  niveaulibelle5: string;


  criterevalue19: string;
  /**
   * Critère réservé à la Garantie
   */
  criterevalue20: string;

  perm: string;

  /**
   * @param prod Produit à comparer avec ce produit
   * @returns si le produit comparé est égal à ce produit (Bool)
   */
  public egal(prod: Produit): boolean {
    return (this.reference == prod.reference) &&
    (this.prix == prod.prix) &&
    (this.prixAdd == prod.prixAdd) &&
    (this.prixAvant == prod.prixAvant) &&
    (this.prixD3E == prod.prixD3E) &&
    (this.prixPar == prod.prixPar) &&
    (this.prixPublic == prod.prixPublic);
  }
}

/**
 * Modèle d'un critère dynamique de produit
 * @example
   * { name: 'Vitesse', value: '100MB'}
 */
export class Critere {
  /**
   * Nom du critere de produit
   */
  name: string;
  /**
   * Valeur du critere de produit
   */
  value: string;
}

/**
 * Modèle d'un code promo.
 * Encore non utilisé, peut être amené à changer.
 */
export class CodePromo {
  /** Nom de la promotion */
  name: string;
  /** Code couleur de promotion*/
  color: string;
}

/**
 * Modèle de valeurs de payment de location
 * @example
   * { mois: '12', taux: '12.5'}
 */
export class Location {
  /**
   * Durée de la location en mois
   */
  mois: number;
  /**
   * Taux en pourcentage de l'augmentation du prix final du produit pour la durée de location associée
   */
  taux: number;
}

/**
 * Case du tableau de produits à louer
 */
export class LocationProduit {
  /** Produit à louer */
  produit: Produit;
  /** Qte de produit */
  qte: number;

  constructor(produit: Produit, qte: number = 1) {
    this.produit = produit;
    this.qte = qte;
  }
}



