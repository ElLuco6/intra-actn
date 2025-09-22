import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { environment } from '@env/environment';

@Component({
  selector: 'app-suivi-objectifs',
  templateUrl: './suivi-objectifs.component.html',
  styleUrl: './suivi-objectifs.component.scss'
})
export class SuiviObjectifsComponent implements OnInit {

  chiffresRealises: DataStructure = {};
  objectifs: DataStructure = {};

  selectedTabIndex = 0;

  displayedRegions = [];

  constructor(private http: HttpClient) { }

  ngOnInit() {
    this.getObjectif2025();

  }

  onTabChange(event: any): void {
    this.selectedTabIndex = event.index;
  }

  getObjectif2025() {
    this.http.get<{ [type: string]: DataStructure }>(`${environment.apiUrl}/objectif2025.php`).subscribe(
      (data) => {
        Object.keys(data['CA']).forEach(region => {
          this.displayedRegions.push(region);
        });
        this.chiffresRealises = data['CA'];
        this.objectifs = data['OBJ'];
      }
    );

  }
}

export type DataStructure = {
  [region: string]: {
    [annee: string]: {
      [category: string]: {
        libelle: string;
        niv1: number;
        niv2: number;
        niv3: number;
        marques: {
          [marque: string]: {
            marquelib: string;
            coeff: number;
            montants: {
              [mois: string]: number;
            };
            montantsConsolides: {
              [mois: string]: number;
            }
          };
        };
      };
    };
  };
}