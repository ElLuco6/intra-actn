import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-tableau-objectifs',
  templateUrl: './tableau-objectifs.component.html',
  styleUrl: './tableau-objectifs.component.scss'
})
export class TableauObjectifsComponent implements OnInit {
  @Input() chiffresRealises: ToBeNamed;
  @Input() objectifs: ToBeNamed;

  afficherValeursConsolidees = true;

  tableauChiffresRealises;
  tableauCRSplit;
  tableauObjectifs;
  tableauObjectifsSplit;

  listeMois: { id: string, nom: string }[] = [
    { id: 'janvier', nom: 'Janvier' },
    { id: 'fevrier', nom: 'Février' },
    { id: 'mars', nom: 'Mars' },
    { id: 'avril', nom: 'Avril' },
    { id: 'mai', nom: 'Mai' },
    { id: 'juin', nom: 'Juin' },
    { id: 'juillet', nom: 'Juillet' },
    { id: 'aout', nom: 'Août' },
    { id: 'septembre', nom: 'Septembre' },
    { id: 'octobre', nom: 'Octobre' },
    { id: 'novembre', nom: 'Novembre' },
    { id: 'decembre', nom: 'Décembre' },
    { id: 'total', nom: 'Total' }
  ];
  totauxMois: {
    annee: string,
    categorie: string,
    mois: string,
    valeurReelle: number,
    valeurConsolidee: number,
    objectif: number,
    completion: number,
    niveaux: { niv1: number, niv2: number, niv3: number }
  }[] = [];

  expanded: boolean[] = [];

  constructor() {
  }

  ngOnInit(): void {

    if (this.chiffresRealises) {
      this.tableauChiffresRealises = this.convertToArrayStructure(this.chiffresRealises);
      this.tableauCRSplit = this.splitCategoriesEtMarquesPreco(this.tableauChiffresRealises);
    }
    if (this.objectifs) {
      this.tableauObjectifs = this.convertToArrayStructure(this.objectifs);
      this.tableauObjectifsSplit = this.splitCategoriesEtMarquesPreco(this.tableauObjectifs);
    }

    this.fillTotauxMois();
  }

  convertToArrayStructure(obj: any) {
    return Object.keys(obj).map(annee => {
      const categories = Object.keys(obj[annee]).map(categorieId => {
        const categorieData = obj[annee][categorieId];

        const marques = Object.keys(categorieData.marques).map(marqueId => {
          const marqueData = categorieData.marques[marqueId];
          const montants = Object.values(marqueData.montants).map((valeur, index) => {
            return {
              mois: this.listeMois[index].id,
              valeur,
            };
          });
          const montantsConsolides = Object.values(marqueData.montantsConsolides).map((valeur, index) => {
            return {
              mois: this.listeMois[index].id,
              valeur,
            };
          });

          return {
            marqueId: marqueId,
            marquelib: marqueData.marquelib,
            coeff: marqueData.coeff,
            montants,
            montantsConsolides,
          };
        });

        return {
          categorieId: categorieId,
          libelle: categorieData.libelle,
          niv1: categorieData.niv1,
          niv2: categorieData.niv2,
          niv3: categorieData.niv3,
          marques,
        };
      });

      return {
        annee, categories
      };
    });
  }

  fillTotauxMois() {
    this.totauxMois = [];

    if (!this.tableauChiffresRealises || !this.tableauObjectifs) return;

    this.tableauObjectifs.forEach(ligne => {
      const annee = ligne.annee;
      const ligneChiffresRealises = this.tableauChiffresRealises.find(obj => obj.annee === annee);

      ligne.categories.forEach(categorie => {
        const categorieLibelle = categorie.libelle;

        const totalReelParMois: Record<string, number> = {};
        const totalConsolideParMois: Record<string, number> = {};
        const objectifsParMois: Record<string, number> = {};

        this.listeMois.forEach(mois => {
          totalReelParMois[mois.id] = 0;
          totalConsolideParMois[mois.id] = 0;
          objectifsParMois[mois.id] = 0;
        });

        categorie.marques.forEach(marque => {
          marque.montants.forEach((montant) => {
            objectifsParMois[montant.mois] += Number(montant.valeur);
          });
        });

        if (ligneChiffresRealises) {
          const categorieChiffresRealises = ligneChiffresRealises.categories.find(cat => cat.libelle === categorieLibelle);
          if (categorieChiffresRealises) {
            categorieChiffresRealises.marques.forEach(marque => {
              marque.montants.forEach((montant) => {
                totalReelParMois[montant.mois] += Number(montant.valeur);
              });
              marque.montantsConsolides.forEach((montantConsolide) => {
                totalConsolideParMois[montantConsolide.mois] += Number(montantConsolide.valeur);
              });
            });
          }
        }

        this.listeMois.forEach(mois => {
          this.totauxMois.push({
            annee,
            categorie: categorieLibelle,
            mois: mois.id,
            valeurReelle: totalReelParMois[mois.id],
            valeurConsolidee: totalConsolideParMois[mois.id],
            objectif: objectifsParMois[mois.id] || 0,
            completion: objectifsParMois[mois.id] ? this.calculerPourcentage(totalConsolideParMois[mois.id], objectifsParMois[mois.id]) : 100,
            niveaux: {
              niv1: Number(categorie.niv1),
              niv2: Number(categorie.niv2),
              niv3: Number(categorie.niv3),
            }
          });
        });
      });
    });
  }

  splitCategoriesEtMarquesPreco(tableau: any[]) {
    return tableau.map(ligne => ({
      annee: ligne.annee,
      categories: ligne.categories.filter(categorie => !categorie.libelle.startsWith('Marque ')),
      marquesPreconisees: ligne.categories.filter(categorie => categorie.libelle.startsWith('Marque '))
    }));
  }

  trouverCategorieCorrespondante(annee: number, categorieId: string) {
    return this.tableauChiffresRealises.find((chiffres) => chiffres.annee === annee).categories.find((categorie) => categorie.categorieId === categorieId);
  }

  calculerPourcentage(valeur: number, objectif: number) {
    return Math.floor(valeur / objectif * 100);
  }

  convertirNiveaux(niveaux: object) {
    return Object.values(niveaux).map(niveau => Number(niveau));
  }

  toggleValeursConsolidees() {
    this.afficherValeursConsolidees = !this.afficherValeursConsolidees;
  }

  removePrefix(marque: string): string {
    return marque.startsWith('Marque ') ? marque.slice(7) : marque;
  }

}

export type ToBeNamed = {
  [category: string]: {
    libelle: string;
    marques: {
      [marque: string]: {
        marquelib: string;
        coeff: number;
        montants: {
          [mois: string]: number;
        };
      };
    };
  };
}