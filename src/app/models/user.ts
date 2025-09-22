/**
 * Modèle d'un compte utilisateur.
 * Bien différencier Client et Utilisateur
 * Un client peut avoir plusieurs Utilisateurs se connectant au même compte client par le biais d'identifiants différents et avec des autorisations différentes.
 */
export class User {
  /** Numero du Client */
  id: number;
  /** Nom du Client */
  name: string;
  /** region du commercial*/
  region1: string;
  /** region 2 du commercial*/
  region2: string;
  USERAS: string;
  groupe: string;
  /** Rôle de l'Utilisateur
   * @example
   * "admin"
   */
  role: string;
  /** Identifiant de l'Utilisateur */
  TIERSUSR: string;
  /** Numero du Client */
  TIERS: string;
  /** Nom du Client */
  TIERSNOM: string;
  TIERSCADR: string;
  TIERSNOMLIV: string;
  /** Ligne d'adresse 1 */
  TIERSAD1: string;
  /** Ligne d'adresse 2 */
  TIERSAD2: string;
  /** Code postal */
  TIERSCPO: string;
  /** Ville */
  TIERSVIL: string;
  /** Telephone */
  TIERSTEL: string;
  /** FAX */
  TIERSFAX: string;
  TIERSTAC: string;
  /** Mail */
  TIERSMEL: string;
  /** Numéro du pays
   * @example 001 */
  TIERSPAYSERP: string;
  /** Code du pays
   * @example "FR" */
  TIERSPAYSISO: string;
  /** Nom du pays
   * @example "France" */
  TIERSPAYSLIB: string;
  /** Client etranger, Hors CEE
   * Vide si ce n'est pas le cas
   * exemple : "ETR" */
  TIERSETRANGER: string;
  PWOK: string;
  Pescompte: string;
  DateCNX: string;
  /** Taux de TVA appliqué au client */
  TauxTVA: number;
  Franco: string;
  Port: string;
  FrancoLimite: string;
  PortTLS: string;
  FrancoLimiteTLS: string;
  Expediteur: string;
  MultiTrans1: string;
  MultiTrans2: string;
  MultiPort1: string;
  MultiPort2: string;
  MultiPort1b: string;
  MultiPort2b: string;
  MultiPort1t: string;
  MultiPort2t: string;
  MultiFraLmt1: string;
  MultiFraLmt2: string;
  MultiFraLmt1t: string;
  MultiFraLmt2t: string;
  MultiPort1bt: string;
  MultiPort2bt: string;
  AutoCDE: string;
  MessageCDE: string;
  TIERSIND: string;
  CDE_mail: string;
  TIERS_HTTTC: string;
  TIERS_HTTTC_rev: string;
  COMMERCIAL: string;
  /** Nom du commercial par defaut du Client */
  COMMERCIALNOM: string;
  /** Nom du premier commercial du Client */
  COMMERCIALNOM1: string;
  /** Nom du second commercial du Client */
  COMMERCIALNOM2: string;
  /** Telephone commercial par defaut du Client */
  COMMERCIALTEL: string;
  /** Telephone du premier commercial du Client */
  COMMERCIALTEL1: string;
  /** Telephone du second commercial du Client */
  COMMERCIALTEL2: string;
  /** Email du commercial par defaut du Client */
  COMMERCIALMAIL: string;
  /** Email du premier commercial du Client */
  COMMERCIALMAIL1: string;
  /** Email du second commercial du Client */
  COMMERCIALMAIL2: string;
  TIERS_Representant: string;
  RMAmultiple: string;
  RMA_interlocuteur: string;
  RMA_tele: string;
  RMA_fax: string;
  RMA_mail: string;
  RMA_marq: string;
  RMA_prod: string;
  RMA_Serie: string;
  RMA_desi: string;
  RMA_motif: string;
  RMA_action: string;
  RMA_Commentaire: string;
  RMA_nocde: string;
  RMA_nobl: string;
  RMA_nofac: string;
  RMA_Dcde: string;
  RMA_Dblv: string;
  RMA_Dfac: string;
  RMA_Qte: number;
  RMA_service: string;
  RMAobsMessage: string;
  RMA_marqA: {
    1: string;
    2: string;
    3: string;
    4: string;
    5: string;
    6: string;
    7: string;
    8: string;
    9: string;
    10: string;
  };
  RMA_prodA: {
    1: string;
    2: string;
    3: string;
    4: string;
    5: string;
    6: string;
    7: string;
    8: string;
    9: string;
    10: string;
  };
  RMA_prodC: {
    1: string;
    2: string;
    3: string;
    4: string;
    5: string;
    6: string;
    7: string;
    8: string;
    9: string;
    10: string;
  };
  RMA_DosC: {
    1: string;
    2: string;
    3: string;
    4: string;
    5: string;
    6: string;
    7: string;
    8: string;
    9: string;
    10: string;
  };
  RMA_desiA: {
    1: string;
    2: string;
    3: string;
    4: string;
    5: string;
    6: string;
    7: string;
    8: string;
    9: string;
    10: string;
  };
  RMA_QteA: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
    6: number;
    7: number;
    8: number;
    9: number;
    10: number;
  };
  RMA_Message: {
    1: string;
    2: string;
    3: string;
    4: string;
    5: string;
    6: string;
    7: string;
    8: string;
    9: string;
    10: string;
  };

}

/**
 * Modèle d'une adresse postale liée à un compte utilisateur.
 */
export class Adresse {
  /** Ligne d'adresse 1 */
  adresse1: string;
  /** Ligne d'adresse 2 */
  adresse2: string;
  /** Code postal */
  codepostal: string;
  defaut: string;
  forfait: string;
  /** Nom / designation de l'adresse */
  nom: string;
  /** Nom du pays
   * exemple : "France" */
  pays: string;
  /** Code du pays
   * exemple : "001" */
  payscode: string;
  /** Code ISO du pays
   * exemple : "FR" */
  paysiso: string;
  payszobe: string;
  /** Numéro de téléphone */
  phone: string;
  /** Ville */
  ville: string;
  codeadresse: string;
}

/**
 * Modèle d'un contact du site
 */
export type Contact = {
  /** Nom du contact */
  nom: string;
  /* Telephone du contact */
  tel: string;
  /** Mail du contact */
  mail: string;
  /** Lien téléphone ? */
  telLink: string;
}

