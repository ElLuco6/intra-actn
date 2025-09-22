import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AbonnementsService {

  heure =[
    { "heure": "00:00", "value": "00:0" },
    { "heure": "00:30", "value": "00:3" },
    { "heure": "01:00", "value": "01:0" },
    { "heure": "01:30", "value": "01:3" },
    { "heure": "02:00", "value": "02:0" },
    { "heure": "02:30", "value": "02:3" },
    { "heure": "03:00", "value": "03:0" },
    { "heure": "03:30", "value": "03:3" },
    { "heure": "04:00", "value": "04:0" },
    { "heure": "04:30", "value": "04:3" },
    { "heure": "05:00", "value": "05:0" },
    { "heure": "05:30", "value": "05:3" },
    { "heure": "06:00", "value": "06:0" },
    { "heure": "06:30", "value": "06:3" },
    { "heure": "07:00", "value": "07:0" },
    { "heure": "07:30", "value": "07:3" },
    { "heure": "08:00", "value": "08:0" },
    { "heure": "08:30", "value": "08:3" },
    { "heure": "09:00", "value": "09:0" },
    { "heure": "09:30", "value": "09:3" },
    { "heure": "10:00", "value": "10:0" },
    { "heure": "10:30", "value": "10:3" },
    { "heure": "11:00", "value": "11:0" },
    { "heure": "11:30", "value": "11:3" },
    { "heure": "12:00", "value": "12:0" },
    { "heure": "12:30", "value": "12:3" },
    { "heure": "13:00", "value": "13:0" },
    { "heure": "13:30", "value": "13:3" },
    { "heure": "14:00", "value": "14:0" },
    { "heure": "14:30", "value": "14:3" },
    { "heure": "15:00", "value": "15:0" },
    { "heure": "15:30", "value": "15:3" },
    { "heure": "16:00", "value": "16:0" },
    { "heure": "16:30", "value": "16:3" },
    { "heure": "17:00", "value": "17:0" },
    { "heure": "17:30", "value": "17:3" },
    { "heure": "18:00", "value": "18:0" },
    { "heure": "18:30", "value": "18:3" },
    { "heure": "19:00", "value": "19:0" },
    { "heure": "19:30", "value": "19:3" },
    { "heure": "20:00", "value": "20:0" },
    { "heure": "20:30", "value": "20:3" },
    { "heure": "21:00", "value": "21:0" },
    { "heure": "21:30", "value": "21:3" },
    { "heure": "22:00", "value": "22:0" },
    { "heure": "22:30", "value": "22:3" },
    { "heure": "23:00", "value": "23:0" },
    { "heure": "23:30", "value": "23:3" }
  ] 
 
  
  constructor() { }
}

export interface AbonnementClient {
  client: string;
  clientraisonsociale: string;
  devis: string;
  dossier: string;
  numero: string;
  revendeurnom: string;
  services: string;
  statut: string;
  produits: any[];
}