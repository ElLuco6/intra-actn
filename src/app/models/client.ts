import {Observable} from "rxjs";
import {Filtre} from "@models/catalogue";

export class Client{
  adresse1: string;
  adresse2: string;
  groupe: string;
  origine: string;
  gsm: number;
  marquecode: string;
  fonction: string;
  naf: number;
  naflibelle: number;
  nom: string;
  numclient: number;
  codepostal: number;
  produit: string;
  telephone: number;
  ville: string;
  siren: number;
  Bilan: string;
  region: string;
  limiteCredit: number;
  limiteCreditExceptionnel: number;
  EncoursBL: number;
  EncoursCompta: number;
  limiteCreditExceptionnelDate: string;
  risqueGlobal: number;
  contact: string;
  contacttelephone: string;
  contactgsm: string;
  contactmail: string;
  contactservice: string;
  mail: string;
  pays: string;
  numtva: number
  serie: string;
  note: number
  commercialMail: string;
  commercialMail1: string;
  commercialMail2: string;
  commercialTel: string;
  commercialTel1: string;
  commercialTel2: string;
  commercialNom: string;
  commercialNom1: string;
  commercialNom2: string;
  departementlib: string;
  plafondbloquant: number;
  plafondbloquantDate: string;
  blocage: string;
  datecreation: Date;
  conditionreg: string;
  caan: string;
  ca: string;
  CAAN1: string;
  CA1: string;
  CAAN2: string;
  CA2: string;
  CAAN3: string;
  CA3: string;
  CAAN4: string;
  CA4: string
  coface: string;
}

export class ClientFiltre {
  filtres$: Observable<Filtre[]>;
  clients$: Observable<Client[]>
}
