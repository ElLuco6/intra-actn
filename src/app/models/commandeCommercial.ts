import {Produit} from "@models/produit";

export class CommandeCommercial {
  numclient: string;
  nom: string;
  numCde: string;
  refCde: string;
  numBl: string;
  numFacture: string;
  dateCde: Date;
  departement: string;
  montantHt: string;
  produits: Array<Produit>;
  numClient: number;
  region: string;
}
