export class CdeBloque {
  type: string;
  nom: string;
  adresse1: string;
  adresse2: string;
  codepostal: string;
  ville: string;
  telephone: string;
  departement: string;
  departementlib: string;
  gsm: string;
  naf: string;
  naflibelle: string;
  numclient: number;
  groupe: string;
  note: string;
  blocage: string;
  adejacommande: string;
  ca: string;
  ca1: string;
  siren: string;
  region: string;
  limiteCredit: string;
  limiteCreditExceptionnel: string;
  limiteCreditExceptionnelDate: string;
  EncoursCompta: number;
  EncoursBL: number;
  reisqueGlobal: number;
  Bilan: string;
  commercialNom: string;
  commercialMail: string;
  commercialTel: string;
  commercialNom1: string;
  commercialMail1: string;
  commercialTel1: string;
  commercialNom2: string;
  commercialMail2: string;
  commercialTel2: string;
  clientCde: Array<ClientCdeBloque>
}

export class ClientCdeBloque {

  commande: string;
  commandedate: string;
  transaction: string;
  bl: string;
  facture: string;
  refclient: string;
  MtcdeHT: string;
  MtcdeTTC: string;
  marque: string;
  produit: string;
}
