import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment} from "@env/environment";
import { Observable } from 'rxjs';

/** Service manipulant les grilles de transport */
@Injectable({
  providedIn: 'root'
})
export class TransportService {

  /** Grilles de transport */
  grilleTrans;
  /** Taux de TVA */
  tva;
  /** Adresse mail */
  mail;

  /** Renvoie les grilles de transport */
  getGrille() {
    return this.grilleTrans;
  }
  /** Renvoie le taux de TVA*/
  getTxTVA(){
    return this.tva;
  }
  /** Renvoie le mail */
  getMail(){
    return this.mail;
  }
  /** Set le taux de TVA du TransportService */
  setTVA(tva){
    this.tva = tva;
  }
  /** Set le mail du TransportService */
  setMail(mail){
    this.mail = mail;
  }

  constructor(
    private http: HttpClient,
  ) { }

  /** S'abonne au service qui recupere la grille, et rempli le set de transport */
  formatGrille(): void {
    this.chargerGrille().subscribe(
      data => {
        this.grilleTrans = data;
      },
      err => { },
      () => { }
    );
  }

  /** lien avec le php permettant de recupérer la grille de transport */
  chargerGrille(): Observable<any> {
    return this.http.get(`${environment.apiUrl}/ListePort.php`, { withCredentials: true, responseType: 'json', params: {client: ''} });
  }

}
