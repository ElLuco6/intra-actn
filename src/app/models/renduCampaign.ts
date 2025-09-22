export class RenduCampaign {
  adresse1: string;
  codepostal: string;
  departement: string;
  numclient: string;
  telephone: string;
  raisonSociale: string;
  region: string;
  ville: string;
  type: string;
  siret: string;
  rendus: [{
    nom: string;
    date: string;
    mail: string;
    gsm: string;
    texte: string;
    appelcode: string;
    appellib: string;
    user: string;
  }];
}
