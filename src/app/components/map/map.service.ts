import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '@env/environment';
import { interval } from 'rxjs';
import { AddressUser } from './map.component';

@Injectable({
  providedIn: 'root'
})
export class MapService {

  constructor(public router: Router,
              public http: HttpClient) { }

  aidePopup =""
  filtringArray!: AddressUser[]

  number: number[]=[
    1,10000,200000,30300,40014,0
  ]
  caFiltre: caFiltre[]= [
    {
      "libelle":"0 à 10000",
      "min":0,
      "max":10000
    },
    {
      "libelle":"10000 à 20000",
      "min":10000,
      "max":20000
    },
    {
      "libelle":"20000 à 30000",
      "min":20000,
      "max":30000
    },
    {
      "libelle":"30000 à 40000",
      "min":30000,
      "max":40000
    },
    {
      "libelle":"40000 à 50000",
      "min":40000,
      "max":50000
    },
    {
      "libelle":"50000 à 60000",
      "min":50000,
      "max":60000
    },
    {
      "libelle":"60000 à 70000",
      "min":60000,
      "max":70000
    },
    {
      "libelle":"70000 à 80000",
      "min":70000,
      "max":80000
    },
    {
      "libelle":"80000 à 90000",
      "min":80000,
      "max":90000
    },
    {
      "libelle":"90000 à 100000",
      "min":90000,
      "max":100000
    },
    {
      "libelle":"+100000",
      "min":100000,
      "max":1000000
    }

  ]

  region: region[] = [
    {
      "name": "- - -",
      "code": "ALL",
      "lat": 46.4662882,
      "long": 2.6548421
    },
    {
      "name": "Île-de-france",
      "code": "RP",
      "lat": 48.8499198,
      "long": 2.6370411
    },
    {
      "name": "Centre-Val de Loire",
      "code": "",
      "lat": 47.7515,
      "long": 1.675
    },
    {
      "name": "Bourgogne-Franche-Comté",
      "code": "",
      "lat": 47.280513,
      "long": 4.999437
    },
    {
      "name": "Normandie",
      "code": "NOR",
      "lat": 48.879870,
      "long": 0.171253
    },
    {
      "name": "Hauts-de-France",
      "code": "",
      "lat": 49.847503,
      "long": 2.763062
    },
    {
      "name": "Grand Est",
      "code": "EST",
      "lat": 48.485760,
      "long": 5.482160
    },
    {
      "name": "Pays de la Loire",
      "code": "",
      "lat": 47.7632836,
      "long": -0.3299687
    },
    {
      "name": "Bretagne",
      "code": "",
      "lat": 48.202047,
      "long": -2.932644
    },
    {
      "name": "Nouvelle-Aquitaine",
      "code": "",
      "lat": 44.7002222,
      "long": -0.2995785
    },
    { /// voir comment on utilise la data
      "name": "Occitanie",
      "code": "S-O",
      "lat": 43.604652,
      "long": 1.444209
    },
    {
      "name": "Auvergne-Rhône-Alpes",
      "code": "RHO",
      "lat": 45.1695797,
      "long": 5.4502821
    },
    {
      "name": "Provence-Alpes-Côte d'Azur",
      "code": "",
      "lat": 43.9351691,
      "long": 6.0679194
    },
    {
      "name": "Corse",
      "code": "",
      "lat": 42.039604,
      "long": 9.012893
    }
  ]

  

 

  toLink(url) {
    this.router.navigate([url]);
  }


  // fonctions qui retourne la chaine de caractère contenant l'aide correspondante
  retournAide(): string {
    return this.aidePopup;
  }



  filtringArr() {
    this.http.get(`${environment.backend}/CarteTemp/datasave.csv`, {
      responseType: 'text'
    })
      .subscribe(
        data => {

          let csvToRomArray = data.split("\n"); //on range le tableau avec split en ajoutant une nouvelle clé pour chaque espace

          this.filtringArray = []
          for (let index = 1; index < csvToRomArray.length - 1; index++) {
            let row = csvToRomArray[index].split(","); //on crée une clé pour chaque dans notre tableau préremplie ,
            this.filtringArray.push(new AddressUser(row[0], row[1], row[2], row[3], row[4], row[5], row[6], row[7], row[8], row[9], row[10], row[11], row[12], row[13], row[14], row[15]));// On crée est on ajoute dans le tableau les nouvelle adresse et on enlève les blanc avec trim()
          }



        }
      )
  }


}
export class region {
  name: string;
  code: string;
  lat: number;
  long: number;
  constructor(name: string, code: string, lat: number, long: number) {
    this.name = name;
    this.code = code;
    this.lat = lat;
    this.long = long;
  }
}
export class caFiltre{
  libelle:string;
  min:number;
  max:number
  constructor(  libelle:string,
    min:number,
    max:number){
     this.libelle = libelle;
     this.min = min; 
     this.max= max
  }
}

export class departement {
  arguliblibelle: string;
  argument: string;
  libelle: string;
  titre1: string;
  titre2: string;
  titre3: string;
  titre4: string;
  titre5: string;
  valeur1: string;
  constructor(arguliblibelle: string,
    argument: string,
    libelle: string,
    titre1: string,
    titre2: string,
    titre3: string,
    titre4: string,
    titre5: string,
    valeur1: string) {
    this.arguliblibelle = arguliblibelle;
    this.argument = argument;
    this.libelle = libelle;
    this.titre1 = titre1;
    this.titre2 = titre2;
    this.titre3 = titre3;
    this.titre4 = titre4;
    this.titre5 = titre5;
    this.valeur1 = valeur1;
  }

}
export class mapDate{
  
  fileModifiedDate: Date
  /* constructor(fileModifiedDate:Date){
      
      this.fileModifiedDate = fileModifiedDate;
    } */
}