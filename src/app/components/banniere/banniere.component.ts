import { HttpClient } from '@angular/common/http';
import { Input } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { StorageService } from "../../services/storage.service";
import { environment } from "../../../environments/environment";
import { Observable } from 'rxjs';

@Component({
  selector: 'app-banniere',
  templateUrl: './banniere.component.html',
  styleUrls: ['./banniere.component.scss']
})
export class BanniereComponent implements OnInit {

  @Input() emplacement: string;

  @Input()
  public get marques(): Array<string> {
    return this._marques;
  }
  public set marques(value: Array<string>) {
    this._marques = value;
    this.load();
  }

  listBanniere: Array<string>;
  banniereActiveList: Array<string> = [];
  sort: number;
  banniereActive = '';
  linkActive = '';
  environment = environment;
  affichage = false;

  private _marques: Array<string> = [];

  constructor(
    private http: HttpClient,
    private storageService: StorageService
  ) { }

  ngOnInit(): void { }

  load(): void {
    this.chargerListBanniere().subscribe(ret => {
      this.listBanniere = ret.split(/[\r\n]+/g);

      for (const banniere of this.listBanniere) {
        for (const marque of this._marques) {
          if (marque === banniere.split('_')[0].toLocaleUpperCase() && this.emplacement === banniere.split('_')[1]) {
            this.banniereActiveList.push(banniere);
          }
        }
      }
      if (this.banniereActiveList.length !== 0) {
        this.sort = this.getRandomInt(this.banniereActiveList.length);
        this.banniereActive = this.banniereActiveList[this.sort];
        this.affichage = true;
        this.recupLink().subscribe(retour => {
          this.linkActive = retour;
        });
      }
    });
  }

  /**
   * Charge la liste de toutes les bannières.
   */
  chargerListBanniere(): Observable<string> {
    const link = environment.production ? `${environment.banniereUrl}/listBannieres.txt` : '../../assets/bannieres/listBannieres.txt';
    return this.storageService.getStoredData(
      'bannieres',
      'all',
      () => this.http.get(
        link,
        {
          responseType: 'text'
        }
      )
    );
  }

  /**
   * Génère un nombre aléatoire entre 0 et un chiffre maximum.
   * @param max Le chiffre maximum
   * @return Un nombre aléatoire entre 0 et max
   */
  getRandomInt(max: number): number {
    return Math.floor(Math.random() * Math.floor(max));
  }

  /**
   *
   */
  recupLink(): Observable<any> {
    if (environment.production) {
      return this.http.get(`${environment.banniereUrl}/${this.banniereActive}.txt`,
        {
          responseType: 'text'
        });
    }
    else {
      return this.http.get(`../../assets/bannieres/${this.banniereActive}.txt`,
        {
          responseType: 'text'
        });
    }
  }

}
