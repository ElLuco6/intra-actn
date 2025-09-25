import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '@env/environment';

@Component({
  selector: 'app-ca-journalier',
  templateUrl: './ca-journalier.component.html',
  styleUrl: './ca-journalier.component.scss',
})
export class CaJournalierComponent implements OnInit {
  caArray: CAjournalier[] = [];
  regionKeys: string[] = [];
  displayedColumns: string[] = [];
  loading = true;

  constructor(
    public http: HttpClient,
    public router: Router
  ) {}

  ngOnInit(): void {
    this.http
      .get<CAjournalier[]>(`${environment.apiUrl}/CAjournalier.php`)
      .subscribe((data) => {

        this.caArray = data;
        this.regionKeys = Object.keys(this.caArray[0].region);
        this.displayedColumns = [
          'date',
          ...this.regionKeys.map((key) => 'region' + key),
        ];
        const totalObject = this.caArray.find((item) => item.jour === 'Total');
        const aLivrerObject = this.caArray.find(
          (item) => item.jour === 'A livrer'
        );

        // Create a new object that is equal to the "Total" object minus the "A livrer" object
        if (totalObject && aLivrerObject) {
          const newObject: CAjournalier = {
            jour: 'Réalisé',
            region: {},
          };

          for (const key in totalObject.region) {
            if (
              totalObject.region.hasOwnProperty(key) &&
              aLivrerObject.region.hasOwnProperty(key)
            ) {
              newObject.region[key] =
                Number(totalObject.region[key]) -
                Number(aLivrerObject.region[key]);
            }
          }

          // Add the new object to the caArray
          // Add the new object to the caArray one place before the last
          this.caArray.splice(this.caArray.length - 1, 0, newObject);

          this.loading = false;
        }
      });
  }

  goDetails(region: string) {
    region = region.trim();
    let regionArray = [
      'S-O',
      'OUE',
      'S-E',
      'RHO',
      'RP',
      'NOR',
      'EST',
      'DIR',
      'VEE',
      'GRO',
      'RET',
      'INT',
      'IN2',
      'FRS',
      'AFF',
    ];


    if (regionArray.includes(region) ) {

      window.open('/espace-commercial/ca-journalier/' + region, '_blank');
        }else{

      return
    }
  }

  toggleBoldClass(i: number): boolean {
    if (i === 0) {
      return true;
    } else {
      return false;
    }
  }
}

export interface CAjournalier {
  jour: string;
  region: {
    [key: string]: string | number;
  }
}
