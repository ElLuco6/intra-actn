export class Campagne {
  public texte: string;
  public libelle: string;
  public datedeb: string;
  public datefin: string;
  public user: string;
  public user1: string;
  public user2: string;
  public user3: string;
  public user4: string;
  public campagne: string;

  constructor(campagne: string, datedeb: string, datefin: string, libelle: string, texte: string, user: string, user1: string, user2: string, user3: string, user4: string) {
    this.campagne = campagne;
    this.datedeb = datedeb;
    this.datefin = datefin;
    this.libelle = libelle;
    this.texte = texte;
    this.user = user;
    this.user1 = user1;
    this.user2 = user2;
    this.user3 = user3;
    this.user4 = user4;
  }
}
