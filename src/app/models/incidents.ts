import {Client} from "@models/client";
import {CdeBloque} from "@models/cdeBloque";
import {Rma} from "@models/rma";

export class Incidents {
  clientsBloques: Client[];
  clientsEncours: Client[];
  cdeBloques: CdeBloque[];
  listeRma: Rma[];
  listeCdeBloqueStk: CdeBloque[];
}
