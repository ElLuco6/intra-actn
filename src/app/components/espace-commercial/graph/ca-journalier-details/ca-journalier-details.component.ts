import {HttpClient} from '@angular/common/http';
import {Component} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {environment} from '@env/environment';

@Component({
  selector: 'app-ca-journalier-details',
  templateUrl: './ca-journalier-details.component.html',
  styleUrl: './ca-journalier-details.component.scss'
})
export class CaJournalierDetailsComponent {

  caArray: CAjournalier[] = [];
  regionKeys: string[] = [];
  loading = true
  region: string = ""
  displayedColumns = ['Client', 'enoprepa', 'totalcommande', 'Totalenccoursmoisanterieur'];

  constructor(public http: HttpClient, public activitedRouter: ActivatedRoute, public router: Router) {
  }

  ngOnInit(): void {

    this.region = this.activitedRouter.snapshot.params['region']


    this.getDetail(this.region);

  }

  toggleBoldClass(i: number): boolean {
    if (i === 0) {
      return true
    } else {
      return false
    }

  }


  redirect(nclient: string) {
    if (nclient !== undefined || "0") {
      const url = this.router.serializeUrl(
        this.router.createUrlTree(['/client-detail/' + nclient])
      );
      window.open(decodeURIComponent(url), '_blank');


    }
  }

  getDetail(region: string) {
    this.http.get<any>(`${environment.apiUrl}/CAjournalierDetail.php`, {
      params: {
        region: region
      }

    }).subscribe((data) => {
      this.caArray = data;


      /*   this.regionKeys = Object.keys(this.caArray[0].region);
        const totalObject = this.caArray.find(item => item.jour === 'Total');
        const aLivrerObject = this.caArray.find(item => item.jour === 'A livrer');

        // Create a new object that is equal to the "Total" object minus the "A livrer" object
        if (totalObject && aLivrerObject) {
            const newObject: CAjournalier = {
              jour: 'Réalisé',
              region: {}
            };

            for (const key in totalObject.region) {
              if (totalObject.region.hasOwnProperty(key) && aLivrerObject.region.hasOwnProperty(key)) {
                newObject.region[key] = Number(totalObject.region[key]) - Number(aLivrerObject.region[key]);
              }
            }

            // Add the new object to the caArray
            // Add the new object to the caArray one place before the last
          this.caArray.splice(this.caArray.length - 1, 0, newObject);

        }; */
      this.loading = false
    })
  }

}

export interface CAjournalier {
  jour: string;
  region: {
    [key: string]: string | number;
  }
}
