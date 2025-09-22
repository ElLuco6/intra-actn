import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { environment } from "@env/environment";
import { User } from "@/models";
import { BehaviorSubject, EMPTY, finalize, Observable, Subject, take } from "rxjs";
import { map } from "rxjs/operators";
import { Alive } from "@services/authentication.service";
import { CataloguePredictJSON } from "@services/catalogue-search-prediction.service";
import { CotationService } from "@services/cotation.service";
import { Router } from "@angular/router";
import { LocalStorageService } from "@services/local-storage.service";
import { SnackbarService } from "@services/snackbar.service";

@Injectable({
  providedIn: 'root'
})
export class LogClientService {

  private _currentClient = new BehaviorSubject<User>(null);
  private _alive = new Subject<Alive>();

  source: Observable<ClientPredictJSON>;
  private _searchString = new BehaviorSubject<string>('');

  private _blocageMessage: string = '';


  public get searchString$(): Observable<string> {
    return this._searchString.asObservable();
  }

  public get searchString(): string {
    return this._searchString.value;
  }
  public set searchString(value: string) {
    this._searchString.next(value);
  }

  public get blocage() {
    return this._blocageMessage;
  }

  constructor(
    private http: HttpClient,
    private cotationService: CotationService,
    private router: Router,
    private localStorage: LocalStorageService,
    private snack: SnackbarService
  ) {
    this.source = this.getPredicJson();
  }

  public get _currentCient$(): Observable<User> {
    return this._currentClient.asObservable();
  }

  public get currentClient(): User {
    return this._currentClient.value;
  }

  logClient(login: number) {
    return this.http.post<any>(`${environment.apiUrl}/LogClientIn.php`,
      {
        login,
        password: 'a'
      },
      { withCredentials: true }
    ).pipe(take(1), map(data => this._logClient(data)));
  }

  private _logClient(data): User | any {
    if (data.client?.id !== '' && data.client?.id !== undefined) {
      data.client.id = Number(data.client.id);
      this._currentClient.next(data.client as User);
      this._blocageMessage = '';
      if (data.client['BLOCAGE'] != '') {
        this._blocageMessage = data.client.BLOCAGE;
        this.snack.showSnackbar('Ce client est bloqué : ' + this._blocageMessage, '', () => { }, 5000, { noTomer: true, warning: true, large: true });
      }
      this.localStorage.setItem('client', JSON.stringify(data.client));
      return data.client as User;
    } else if (data.error) {
      return data;
    }
    return null;
  }

  retrieveCurrentSessionClient(): Observable<any> {
    return this.http.get(`${environment.apiUrl}/RetrieveSession.php`, {
      withCredentials: true,
      responseType: 'json'
    }).pipe(take(1), map(data => this._logClient(data)));
  }

  logClientOut() {
    return this.http.post<any>(`${environment.apiUrl}/LogClientOut.php`, null, {
      withCredentials: true
    }).pipe(finalize(() => {
      this._currentClient.next(null);
      //this.cotationService.cotationClient('');
      this.localStorage.removeItem('client');
      if (this.router.url.startsWith('/espace-client') || this.router.url.startsWith('/panier')) {
        this.router.navigate(['/']);
      }
    }))
  }

  hasEscompte(): boolean {
    return this.currentClient && (+this.currentClient.Pescompte > 0);
  }

  getPredict(searchString: string, fromLogClient?: boolean): Observable<PredictionResultsClient> {
    const str = this.removeAccents(searchString);
    const keywords = [str.toUpperCase()].filter(keyword => keyword.length > 2);
    if (keywords.length) {
      if (fromLogClient) {
        return this.http.get<CataloguePredictJSON>(`${environment.apiUrl}/predictclient2.json`,
          { responseType: 'json' }).pipe(
            map(
              source => (
                {
                  clients: source.filter(
                    client => keywords.reduce(
                      (acc, keyword) =>
                        client.CODE.startsWith(keyword) ||
                        client.DESIGNATION.includes(keyword) ||
                        acc,
                      false
                    )
                  ).map(client => ({
                    code: client.CODE,
                    designation: client.DESIGNATION
                  }))
                } as PredictionResultsClient)
            )
          );
      }
      return this.source.pipe(
        map(
          source => (
            {
              clients: source.filter(
                client => keywords.reduce(
                  (acc, keyword) =>
                    client.CODE.startsWith(keyword) ||
                    client.DESIGNATION.includes(keyword) ||
                    acc,
                  false
                )
              ).map(client => ({
                code: client.CODE,
                designation: client.DESIGNATION
              }))
            } as PredictionResultsClient)
        )
      );
    } else {
      return EMPTY
    }
  }

  public getPredicJson(): Observable<ClientPredictJSON> {
    return this.http.get<CataloguePredictJSON>(`${environment.apiUrl}/predictclient.json`,
      { responseType: 'json' });
  }

  public removeAccents(str: string): string {


    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  /**
   * Envoie une demande de nouveau mot de passe.
   *
   * @param mail l'email du client
   */
  public forgottenPassword(mail: string): Observable<any> {
    return this.http.post(`${environment.apiUrl}/MDPOublie.php`,
      { mail },
      { withCredentials: true }
    );
  }

  changeClient(logId: number) {
    if (this.currentClient && this.currentClient.id == logId) {
      this.logClientOut().subscribe();
    } else {
      this.logClientOut().subscribe(() => {
          this.logClient(logId).subscribe();
        }
      );
    }
  }

  /**
   * renvoie le numclien depusi le localstorage
   */
  public getClientFromStorage(): any {
    return this.localStorage.getItem('client');
  }

}

export interface PredictionResultsClient {
  clients: [
    {
      code: string;
      designation: string;
    }
  ];
}

export type ClientPredictJSON = [{
  CODE: string;
  DESIGNATION: string;
}]
