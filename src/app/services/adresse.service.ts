import { Injectable } from '@angular/core';
import {environment} from "@env/environment";
import {HttpClient, HttpParams} from "@angular/common/http";
import {map, take} from "rxjs/operators";
import {BehaviorSubject, Observable} from "rxjs";
import {StorageService} from "@services/storage.service";
import {Adresse} from "@/models";
import {Router} from "@angular/router";
import {RmaService} from "@services/rma.service";
import {FormGroup} from "@angular/forms";

@Injectable({
  providedIn: 'root'
})
export class AdresseService {
  environment = environment;
  addSuccess = '';
  delSuccess = '';
  defautSuccess = '';
  editSuccess = '';

  private _adresses = new BehaviorSubject<Adresse[]>(null);

  public get adressesList(): Adresse[] {
    return this._adresses.value;
  }

  public get adressesList$(): Observable<Adresse[]> {
    return this._adresses.asObservable();
  }

  constructor(
    private httpClient: HttpClient,
    private storageService: StorageService,
    private router: Router
  ) {
    this.getAddress().subscribe();
  }

  /**
   * Retourne une liste d'adresse correspondantes à une adresse incomplète.
   * @param search Une adresse incomplète
   * @returns Une liste de 1000 adresses maximum
   * @see https://geo.api.gouv.fr/adresse
   */
  public findAdresse(search: string): Observable<any> {
    return this.httpClient.get<any>('https://api-adresse.data.gouv.fr/search/',
      {
        params: new HttpParams()
          .set('q', search)
          .append('limit', '1000')
      }
    );
  }

  /**
   * Retourne la liste de tous les pays du monde contenant les différentes traductions et le code ISO-3166-1 associés.
   * @returns Un objet sous cette forme {
   *  name: string,
   *  alpha2Code: string,
   *  translations: string[]
   * }
   * @see https://restcountries.eu/
   */
  public getCountries(): Observable<Array<any>> {
    return this.httpClient.get<Array<any>>('https://restcountries.com/v2/all',
      {
        params: new HttpParams()
          .set('fields', 'alpha2Code,translations,name')/*;numericCode;*/
      }
    ).pipe(
      map(pays =>
        pays.sort( (pays1, pays2) => this.getNameOfCountry(pays1).localeCompare(this.getNameOfCountry(pays2)) )
      )
    );
  }

  /**
   * Retourne le nom d'un pays en français, et si la traduction n'est pas dispo, en anglais.
   * @param pays Un object de la forme {name, translations[fr], ...}
   */
  public getNameOfCountry(pays: { name: string, translations: { fr: string; }; }): string {
    return pays.translations.fr != null ? pays.translations.fr : pays.name;
  }

  /**
   * Retourne le nom d'un pays à partir de son code
   */
  public getCountryFromCode(code = 'fr'): Observable<{ name: string, translations: { fr: string; }; }> {
    if (code.length === 2) {
      return this.storageService.getStoredData('pays', code, () => {
        return this.httpClient.get<{ name: string, translations: { fr: string; }; }>(`https://restcountries.eu/rest/v2/alpha/${code}`,
          {
            params: new HttpParams()
              .set('fields', 'alpha2Code;translations;name')
          });
      });
    } else {
      return new Observable(obs => {
        obs.next({ name: code, translations: { fr: code } });
        obs.complete();
      });
    }
  }

  getAddress() {
    return this.httpClient
      .get(
        `${environment.apiUrl}/ListeAdresses.php`,
        {withCredentials: true, responseType: 'json'}
      ).pipe(take(1), map(data => this.adresses(data)));
  }

  private adresses(data){
    this._adresses.next(data as Adresse[])
  }

  editAddressRequest(editForm) {
    return this.httpClient
      .get(`${environment.apiUrl}/Adresse.php`, {
        withCredentials: true,
        responseType: 'json',
        params: {
          action: 'UPD',
          codead: editForm.idAddr,
          nom: editForm.nomAddr,
          ad1: editForm.addr1,
          ad2: editForm.addr2,
          cp: editForm.codePostal,
          ville: editForm.ville,
          phone: editForm.telephone,
          payx: editForm.pays,
          defaut: editForm.defaut
        }
      }).subscribe(() => {
        this.router.navigate(['/espace-client/adresses']);
        this.getAddress().subscribe()
      });
  }

  addAddressRequest(nomAddr, addr1, addr2, codePostal, ville, telephone, pays, defaut) {
    return this.httpClient
      .get(`${environment.apiUrl}/Adresse.php`, {
        withCredentials: true,
        responseType: 'json',
        params: {
          action: 'ADD',
          codead: '000',
          nom: nomAddr,
          ad1: addr1,
          ad2: addr2,
          cp: codePostal,
          ville: ville,
          phone: telephone,
          payx: pays,
          defaut: defaut
        }
      })
      .subscribe(() => {
        this.router.navigate(['/espace-client/adresses']);
        this.getAddress().subscribe()
      });
  }

  /**
   * Change the current default address
   */
  changeDefaultAddress(addr, defaut) {
    this.httpClient
      .get(`${environment.apiUrl}/Adresse.php`, {
        withCredentials: true,
        responseType: 'text',
        params: {
          action: 'UPD',
          codead: addr.codeadresse,
          nom: addr.nom,
          ad1: addr.adresse1,
          ad2: addr.adresse2,
          cp: addr.codepostal,
          ville: addr.ville,
          phone: addr.phone,
          payx: addr.pays,
          defaut: defaut ? 'P' : ''
        }
      })
      .subscribe(() => {
        this.getAddress().subscribe();
      });
  }

  deleteAddress(idAddr) {
    return this.httpClient
      .get(`${environment.apiUrl}/Adresse.php`, {
        withCredentials: true,
        responseType: 'text',
        params: {
          action: 'DEL',
          codead: idAddr,
          nom: '',
          ad1: '',
          ad2: '',
          cp: '',
          ville: '',
          phone: '',
          payx: '',
          defaut: ''
        }
      })
      .subscribe(() => {
        this.getAddress().subscribe();
      })
  }

}
