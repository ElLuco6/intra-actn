import { Commande } from "./commande";
import { Produit } from './produit';

export class Licence {
  serie: string;
  client: Client;
  nombredejoursrestant: number;
  prixht: number;
  prixpublic: number;
  quantite: number;
  renouvellementdate: Date;
  renouvellementstatus: string;
  niv1: string;
  niv2: string;
  niv3: string;

  produit: Produit;
  commande: Commande;

  statut: string;

  history = new Array<Licence>();

  private _defaultString = '';
  private _defaultNumber = 0;

  constructor(rLicence: RawLicence) {
    this.serie = rLicence.serie || this._defaultString;
    this.renouvellementdate = this.extractDate(rLicence.renouvellementdate);
    this.renouvellementstatus = rLicence.renouvellementstatus || this._defaultString;
    this.nombredejoursrestant = Math.ceil((this.renouvellementdate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    this.niv1 = rLicence.niv1;
    this.niv2 = rLicence.niv2;
    this.niv3 = rLicence.niv3;
    this.quantite = +rLicence.quantite;
    this.statut = (this.renouvellementdate == null) ? 'En attente' : ((new Date() <= this.renouvellementdate) ? 'Active' : 'Expirée');
    this.client = new Client(
      rLicence.clientfinaladresse1,
      rLicence.clientfinaladresse2,
      rLicence.clientfinalcodepostal,
      rLicence.clientfinalmail,
      rLicence.clientfinalnom,
      rLicence.clientfinaltelephone,
      rLicence.clientfinalville,
      rLicence.clientfinalpays,
      rLicence.serie
    );
    this.commande = new Commande();
    this.commande.numcommande = rLicence.commande;
    this.commande.numfacture = rLicence.facture;
    this.commande.numbl = rLicence.bl;
    this.commande.datecommande = new Date(+rLicence.commandedate.slice(6, 10), +rLicence.commandedate.slice(3, 5), +rLicence.commandedate.slice(0, 2));
    this.commande.datefacture = new Date(+rLicence.facturedate.slice(6, 10), +rLicence.facturedate.slice(3, 5), +rLicence.facturedate.slice(0, 2));
    this.commande.datebl = new Date(rLicence.bldate);
    this.commande.referencecommande = rLicence.refcde;
    this.commande.statut = '';
    this.produit = new Produit();
    this.produit.reference = rLicence.produit;
    this.produit.designation = rLicence.designation;
    this.produit.garantie = rLicence.garantiemois;
    this.produit.marque = rLicence.marque;
    this.produit.prix = +rLicence.prixht;
    this.produit.prixPublic = +rLicence.prixpublic;
    this.produit.genCod = rLicence.ean;
  }

  isDisabled(): boolean {
    return this.statut == null || this.statut === 'Expirée' || this.statut === 'En attente';
  }

  extractDate(s: string): Date {
    return new Date(+s.substr(6, 4), +s.substr(3, 2) - 1, +s.substr(0, 2));
  }
}

export class Client {
  adresse1: string;
  adresse2: string;
  codepostal: string;
  mail: string;
  nom: string;
  telephone: string;
  ville: string;
  pays: string;
  serie: string;
  numtva: string;

  private _defaultString = '';

  static fromObject(obj: any): Client {
    const client = new Client();
    for (const [property, value] of Object.entries(obj)) {
      client[property] = value;
    }
    return client;
  }

  constructor(
    adresse1?: string,
    adresse2?: string,
    codepostal?: string,
    mail?: string,
    nom?: string,
    telephone?: string,
    ville?: string,
    pays?: string,
    serie?: string,
    numtva?: string
  ) {
    this.adresse1 = adresse1 || this._defaultString;
    this.adresse2 = adresse2 || this._defaultString;
    this.codepostal = codepostal || this._defaultString;
    this.mail = mail || this._defaultString;
    this.nom = nom || this._defaultString;
    this.telephone = telephone || this._defaultString;
    this.ville = ville || this._defaultString;
    this.pays = pays || this._defaultString;
    this.serie = serie || this._defaultString;
    this.numtva = numtva || this._defaultString;
  }

  public valueOf(): string {
    const s = this.nom + this.adresse1 + this.adresse2 + this.codepostal + this.mail + this.telephone + this.mail;
    return s.toLocaleLowerCase();
  }
}

export class RawLicence {
  serie: string;
  bl: string;
  bldate: string;
  clientfinaladresse1: string;
  clientfinaladresse2: string;
  clientfinalcodepostal: string;
  clientfinalmail: string;
  clientfinalnom: string;
  clientfinaltelephone: string;
  clientfinalville: string;
  clientfinalpays: string;
  refcde: string;
  commande: string;
  commandedate: string;
  facture: string;
  facturedate: string;
  designation: string;
  devisdate: string;
  devisdemandedate: string;
  devisdemandenumero: string;
  ean: string;
  garantiemois: string;
  marque: string;
  nombredejoursrestant: string;
  prixht: string;
  prixpublic: string;
  produit: string;
  quantite: string;
  renouvellementdate: string;
  renouvellementstatus: string;
  validation: string;
  validationdate: string;
  niv1: string;
  niv2: string;
  niv3: string;
}
