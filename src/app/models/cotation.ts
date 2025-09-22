/**
 * Classe représentant une instance de cotation pour un produit
 */
export class Cotation
{
  type: string
  groupe: string
  /** Status de la cotation*/
  classe: string;
  status = '';
  qtecdemini = 0;
  prixrevient: number;
  /** Référence de la cotation (nom) */
  refcot = '';
  /** Numero de la cotation (ID) */
  numcotation = '';
  /** Numéro de ligne de la cotation */
  numcotationLigne = '';
  numfrs = '';

  region: string;
  numcli: string;
  Nom: string;
  adresse: string;
  codepostal: string;
  ville: string;
  delaireappro: string;

  /** Référence du produit auquel s'applique la cotation */
  produit = '';
  /** Code de marque du produit auquel s'applique la cotation (4 caractère max) */
  marque = '';
  /** Nom complet de la marque du produit auquel s'applique la cotation*/
  marquelib = '';
  /** Désignation du produit auquel s'applique la cotation */
  designation = '';

  /** Prix standard du produit coté */
  prixstd = 0;
  /** Prix avec cotation du produit */
  prixvente = 0;
  /** Quantité en stock du produit de la cotation */
  qtestock = 0;

  /** Nombre de commandes déjà passées avec cette cotation */
  nbrcde = 0;
  /** Nombre de maximum de commandes passables avec cette cotation */
  nbrcdemax = 0;

  /** Nombre du produit déjà commandé avec cette cotation */
  qtecde = 0;
  /** Nombre de maximum du produit commandable avec cette cotation */
  qtecdemax = 0;

  /** Date de debut de la cotation */
  datedeb = new Date();
  /** Date de fin / d'expiration de la cotation */
  datefin = new Date();

  /** Raison d'invalidité de la cotation */
  invalidReason: string = "";
  qtestockext: string = '';
  qtereappro: string = '';
  dateconfcde: string = '';
  dateconfcdestatus: string = '';
  perm: string = '';

  constructor(
    cotation: unknown
  ) {
    for (const [key, value] of Object.entries(cotation)) {
      if(key == 'prixrevient'){
        this[key] = +value;
      }
      if (typeof this[key] === 'string') {
        this[key] = value;
      }else if (typeof this[key] === 'number') {
        this[key] = +value;
      }else if (this[key] instanceof Date) {
        const splittedDate = (value as string).split('/');
        this[key] = new Date(+splittedDate[2], +splittedDate[1] - 1, +splittedDate[0]);
        // -1 parce que les mois sont comptés de 0 à 11
      }
    }
  }

}

/**
 * Classe regroupant toutes les cotations d'un client
 * Valides et invalides
 */
export class AllCotations
{
  /** Liste des cotations valides du client*/
  valid: Cotation[];
  /** Liste des cotations invalides du client */
  invalid: Cotation[];
}
