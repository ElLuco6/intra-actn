import { AuthenticationService } from '@/services/authentication.service';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { environment } from '@env/environment';

@Component({
  selector: 'app-suivi-activite',
  templateUrl: './suivi-activite.component.html',
  styleUrls: ['./suivi-activite.component.scss'],
})
export class SuiviActiviteComponent implements OnInit {
  ///BONNE CHANCE POUR SUIVRE PTDR
  done: boolean = false;
  displayedColumns: string[] = [
    'item',
    'type',
    'data1',
    'data2',
    'data3',
    'data4',
    'data5',
    'data6',
    'data7',
    'data8',
    'data9',
    'data10',
    'data11',
    'data12',
    'mttotal',
  ];
   pourcentage = {
    "region": "S-O",
    "annee": "2024",
    "categorie": "CAB",
    "categorielib": "CABLING",
    "data": [10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10],
    "mttotal": 0,
    "niveau": "0",
    "type": "POU"
  }

  zozo = [];

  firstIteration: boolean = true;

  previousName: string | null = null;

  categoryCounter: number = 0; // Compteur pour suivre l'ordre des catégories

  constructor(public http: HttpClient, public auth: AuthenticationService) {}


  region: String = '';
  annee: String = '';
  firstArray = [];
  previousValue: string;
  categoryColors: { [key: string]: string } = {};
  availableColors: string[] = ['#f4f4f4', '#d9e1f2'];
  defaultExpandedIndex = 0;

  getCategoryColor(categorielib: string): string {
    // Vérifiez si la couleur a déjà été attribuée à cette catégorie
    if (!this.categoryColors.hasOwnProperty(categorielib)) {
      // Sélectionnez la prochaine couleur du tableau availableColors
      const nextColor =
        this.availableColors[
          this.categoryCounter % this.availableColors.length
        ];
      // Stockez la couleur dans l'objet categoryColors pour cette catégorie
      this.categoryColors[categorielib] = nextColor;
      // Incrémentez le compteur pour passer à la couleur suivante
      this.categoryCounter++;
    }
    // Renvoyez la couleur associée à cette catégorie
    return this.categoryColors[categorielib];
  }

  shouldHide(transaction: any): boolean {
    if (
      transaction.categorielib === this.previousName &&
      !this.firstIteration
    ) {
      return true; // Masquer la cellule si la catégorie est identique à la précédente et ce n'est pas la première itération
    } else {
      this.previousName = transaction.categorielib; // Mettre à jour la catégorie précédente
      this.firstIteration = false; // Définir la première itération sur false après la première itération
      return false; // Ne pas masquer la cellule si la catégorie est différente ou pendant la première itération
    }
  }

  ngOnInit() {
    this.http
      .get<Graph[][]>(`${environment.apiUrl}/objectif.php`, {
        withCredentials: true,
        responseType: 'json',
      })
      .subscribe((data) => {
        this.firstArray = data;
        this.firstArray = this.firstArray.map((row) => row.reverse()).reverse(); //On tri

        let index = 0;
        let index2 = 0;
        let index3 = 0;
        let index4 = 0;
        this.firstArray.forEach((e) => {
          e.forEach((d: any[]) => {
            d.forEach((g) => {
              this.zozo.push(g);
              g.forEach((d: any[]) => {
                let ligne = {
                  region: d[0],
                  annee: d[1],
                  categorie: d[2],
                  type: d[3],
                  categorielib: d[4],
                  niveau: d[5],
                  mttotal: d[6],
                  data: d[7],
                };

                this.firstArray[index][index2][index3][index4] = ligne;

                index4++;
              });
              index3++;
              index4 = 0;
            });
            index3 = 0;
            index2++;
          });
          index2 = 0;
          index++;
        });

        //ANNE
        const resultat = this.fusionnerObjets(this.firstArray);
        this.firstArray = resultat;

        let index5 = 0;
        let index6 = 0;
        let index7 = 0;
        //let index8 = 0
        this.firstArray.forEach((e) => {
          e.forEach((d) => {
            if (d.length > 1) {
              const tempArray = [[]]; //je rajoute 1 niveau pour pas tout casser
              this.firstArray[index5][index6][index7].forEach((e) => {

                tempArray[0].push(e);
              });
              index7++;
              this.firstArray[index5][index6][index7].forEach((z,i) => {
                tempArray[0].push(z);

              });

              //Creation de la ligne pourcentage


              //etape 1 crée des sous tableau pour chaque categories
              let sousTableauxParCategorie = [];

              function trouverOuCreeSousTableau(categorie) {
                for (let i = 0; i < sousTableauxParCategorie.length; i++) {
                  if (sousTableauxParCategorie[i][0].categorie === categorie) {
                    return sousTableauxParCategorie[i];
                  }
                }
                let nouveauSousTableau = [];

                sousTableauxParCategorie.push(nouveauSousTableau);
                return nouveauSousTableau;
              }

              // Parcourir chaque objet et le placer dans le sous-tableau correspondant
              tempArray[0].forEach(objet => {
                let sousTableau = trouverOuCreeSousTableau(objet.categorie);
                sousTableau.push(objet);
              });

              // Créer un tableau final pour stocker tous les sous-tableaux
              let tableauFinal = [];

              // Ajouter chaque sous-tableau au tableau final
              sousTableauxParCategorie.forEach(sousTableau => {
                tableauFinal.push(sousTableau);
              });

              //etape 2 crée l'objet pourcentage si y'a un OBJ et un CA dans le tableau
              tableauFinal.forEach(sousTableau => {
                // Parcourir chaque paire d'objets dans le sous-tableau
                for (let i = 0; i < sousTableau.length; i++) {
                  for (let j = i + 1; j < sousTableau.length; j++) {
                    // Vérifier si un objet a un type "CA" et l'autre a un type "OBJ"
                    if (sousTableau[i].type === "CA" && sousTableau[j].type === "OBJ" ||
                        sousTableau[i].type === "OBJ" && sousTableau[j].type === "CA") {
                      // Ajouter un nouvel objet au sous-tableau
                      sousTableau.push({

                        region: sousTableau[0].region,
                        annee: sousTableau[0].annee,
                        categorie: sousTableau[0].categorie,
                        "categorielib": sousTableau[0].categorielib,
                        "data":   this.calculatePercentagesArray(sousTableau[i], sousTableau[j]),
                        "mttotal": this.calculatePercentagesMtTotal(sousTableau[i].mttotal, sousTableau[j].mttotal),
                        "niveau": sousTableau[0].niveau,
                        "type": 'OBJ %'
                      });
                      // Sortir de la boucle une fois que la condition est remplie pour éviter d'ajouter plusieurs fois le même nouvel objet
                      break;
                    }
                  }
                }
              });


              // Insérer tableau final dans l'array du graph
              let tableauFinalUnique = [].concat(...tableauFinal);
              tempArray[0] = tableauFinalUnique;


              tempArray[0].sort(function (a: any, b: any) {
                if (a.categorie < b.categorie) {
                  return -1;
                } else {
                  return 1;
                }
              });
              this.firstArray[index5][index6] = tempArray;

            }

            index7 = 0;
            index6++;
          });
          index6 = 0;
          index5++;
        });


        this.firstArray.sort((a, b) => b.annee - a.annee);

        this.region = null;
      });

    this.done = true;

  }
  getColor(type: string, value: number): { color: string, fontWeight: string, backgroundColor: string } | void {
    if (type === 'OBJ %') {
      if (value >= 98 && value <= 120) {
        return { color: '#000000', fontWeight: 'bold', backgroundColor: '#D0E9C6' };
      } else if (value >= 120 && value <= 135) {
        return { color: '#000000', fontWeight: 'bold', backgroundColor: '#A3D9A5' };
      } else if (value >= 135) {
        return { color: '#000000', fontWeight: 'bold', backgroundColor: '#72C791' };
      }
    } else {
      return null;
    }
  }

  //Fonction qui reduce le tableau des CA et ajoute la somme de mttoal et data aux résultat
  fusionnerObjets(tableau) {
    // Vérifier si le tableau est vide
    if (tableau.length === 0) {
      return [];
    }

    // Vérifier si le premier élément du tableau est un objet
    if (typeof tableau[0] === 'object' && !Array.isArray(tableau[0])) {
      const objetsFusionnes = tableau.reduce((acc, current) => {
        const categorie = current.categorie;
        const existingObj = acc.find((item) => item.categorie === categorie);

        if (existingObj) {
          existingObj.mttotal += current.mttotal;

          for (let i = 0; i < existingObj.data.length; i++) {
            current.data[i] += existingObj.data[i];
          }
        } else {
          acc.push(current);
        }

        return acc;
      }, []);

      return objetsFusionnes;
    }

    // Traiter chaque élément du tableau récursivement
    return tableau.map((element) => this.fusionnerObjets(element));
  }

  calculatePercentagesArray(array1: Graph, array2: Graph): number[] | void {
    if (array1.data.length !== array2.data.length ) {
      return [0];
    }

    return array1.data.map((value, index) => {
      if (array2.data[index] === 0) {
        return 0;
      }
      if (array1.type === "OBJ") {
        let percentage = (Number(array2.data[index]) / Number(value)) * 100;

        return parseFloat(percentage.toFixed(2));
      } else {
        let percentage = (Number(value)/Number(array2.data[index])) * 100;
        return parseFloat(percentage.toFixed(2));
      }

    }
    );
  }
  calculatePercentagesMtTotal(value1: number, value2: number): number {
    if (typeof value1 !== 'number' || typeof value2 !== 'number') {
      return 0;
    }

    if (value2 === 0) {
      return 0;
    }

    let percentage = (value1 / value2) * 100;
    return parseFloat(percentage.toFixed(2));
  }
}
export class Graph {
  type: String;
  annee: String;
  categorie: String;
  categorielib: String;
  region: String;
  niveau: String;
  data: Array<Number>;
  mttotal: Number;
  //Dans le constructor l'ordre des données doir etre le meme que dans save.csv
  constructor(
    type: String,
    annee: String,
    categorie: String,
    categorielib: String,
    region: String,
    niveau: String,
    data: Array<Number>
  ) {
    this.type = type;
    this.annee = annee;
    this.categorie = categorie;
    this.categorielib = categorielib;
    this.region = region;
    this.niveau = niveau;
    this.data = data;
  }
}
