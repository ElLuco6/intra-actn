import { ProduitCotation } from '@models/produitCotation';

export class CotationDeSesMorts {
  numcotation: string;
  type: string;
  groupe: string;
  refcot: string;
  datedeb: Date;
  datefin: Date;
  numfrs: string;
  perm: string;
  numcotationLigne: string;
  numcli: string;
  classe: string;
  produits: ProduitCotation[];
}
