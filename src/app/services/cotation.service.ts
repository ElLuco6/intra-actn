import {AllCotations, Cotation} from "../models/cotation";
import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
// ENV
import {environment} from "../../environments/environment";
// SERVICES
import {AuthenticationService} from "./authentication.service";
// RXJS
import {BehaviorSubject, Observable} from 'rxjs';
import {map, take} from 'rxjs/operators';
import {CotationDeSesMorts} from "@models/cotationDeSesMorts";
import {ProduitCotation} from "@models/produitCotation";

@Injectable({
  providedIn: 'root'
})
export class CotationService
{
  private _cotations: BehaviorSubject<Cotation[]> = new BehaviorSubject<Cotation[]>([]);
  private _disabledCotations: BehaviorSubject<Cotation[]> = new BehaviorSubject<Cotation[]>([]);
  private _allCotations: BehaviorSubject<Cotation[]> = new BehaviorSubject<Cotation[]>([]);

  // le nombre de jours en dessous duquel la cotation deviens critique si elle lui reste des produits non-commandés
  private _daysLeftForCotationToBeCritical: number = environment.daysLeftForCotationToBeCritical;
  public nbrOfCriticalCotations = 0;

  // OBSERVABLES
  public get cotations$(): Observable<Cotation[]> {
    return this._cotations.asObservable();
  }
  public get disabledCotations$(): Observable<Cotation[]> {
    return this._disabledCotations.asObservable();
  }
  public get allCotations$(): Observable<Cotation[]> {
    return this._allCotations.asObservable();
  }
  // VALUES
  public get cotations(): Cotation[] {
    return this._cotations.value;
  }
  public get disabledCotations(): Cotation[] {
    return this._disabledCotations.value;
  }
  public get allCotations(): Cotation[] {
    return this._allCotations.value;
  }

  constructor(
    private httpClient: HttpClient,
    private auth: AuthenticationService,
    private authService: AuthenticationService
  ) {
    this.auth.currentUser$.subscribe( // SUB TO USER
      (user) => {
        if (user == null) {
          this._cotations.next([]);
        }
        else // SI L'USER VIENS DE SE CONNECTER
        {
          this.getCotations() // SUB TO COTATIONS
            .pipe(take(1))
            .subscribe(
              (ret: any) => {
                const cotations: AllCotations = this.constructCotations(ret); // ON FORMATE PROPREMENT LE RETOUR DE REQUETE EN OBJETS 'Cotation'
                this._cotations.next(cotations.valid); // ON REVOIT LE TABLEAU DE COTATIONS PAR LE BEHAVIOUR SUBJECT
                this._disabledCotations.next(cotations.invalid);
                this._allCotations.next(cotations.valid.concat(cotations.invalid));

                const tempCurrentDate: Date = new Date();
                this.nbrOfCriticalCotations = 0;

                let datediff: number;
                for (const cot of cotations.valid) // ON COMPTE LES COTATIONS CRITIQUES
                {
                  datediff = this.dateDifferenceInDays(cot.datefin, tempCurrentDate);
                  if (datediff > 0 && datediff <= this._daysLeftForCotationToBeCritical) {
                    if (cot.qtecde < cot.qtecdemax) {
                      this.nbrOfCriticalCotations++;
                    }
                  }
                }
              },
              (error) => {
                console.error("CotationService constructor : Subscribe aux cotations échoué :", error);
              }
            );
        }
      },
      (error) => {
        console.error("CotationService constructor : Unexpected error dans l'authservice 'wtfbruv_01'", error);
      }
    );
  }

  private constructCotations(cotations: any[]): AllCotations
  {
    const constructedCotations: AllCotations = { valid: [], invalid: [] };
    if (cotations['valid'])
    {
      for (const cot of cotations['valid']) {
        constructedCotations.valid.push(
          new Cotation(cot)
        );
      }
    } else {
      constructedCotations.valid = [];
    }

    if (cotations['invalid'])
    {
      for (const cot of cotations['invalid']) {
        constructedCotations.invalid.push(
          new Cotation(cot)
        );
      }
    } else {
      constructedCotations.invalid = [];
    }

    return (constructedCotations);
  }

  cotationClient(client){
    this.getCotationsClient(client)
      .pipe(take(1))
      .subscribe(
        (ret: any) => {
          const cotations: AllCotations = this.constructCotations(ret);
          this._cotations.next(cotations.valid);
          this._disabledCotations.next(cotations.invalid);
          this._allCotations.next(cotations.valid.concat(cotations.invalid));

          const tempCurrentDate: Date = new Date();
          this.nbrOfCriticalCotations = 0;

          let datediff: number;
          for (const cot of cotations.valid) // ON COMPTE LES COTATIONS CRITIQUES
          {
            datediff = this.dateDifferenceInDays(cot.datefin, tempCurrentDate);
            if (datediff > 0 && datediff <= this._daysLeftForCotationToBeCritical) {
              if (cot.qtecde < cot.qtecdemax) {
                this.nbrOfCriticalCotations++;
              }
            }
          }
        },
        (error) => {
          console.error("CotationService constructor : Subscribe aux cotations échoué :", error);
        }
      );
  }

  private getCotationsClient(client){
    return this.httpClient.get<AllCotations>(`${environment.apiUrl}/ListeCotations.php`, {
      withCredentials: true,
      responseType: 'json',
      params: {client: client}
    });
  }

  /**
   * Récupère une liste de cotations.
   */
  private getCotations(): Observable<AllCotations>
  {
    return this.httpClient.get<AllCotations>(`${environment.apiUrl}/ListeCotations.php`, {
      withCredentials: true,
      responseType: 'json',
      params: {client: ''}
    });
  }

  /**
   * Récupère la liste des cotations d'un produit.
   */
  public getProduitCotations(referenceProduit: string): Observable<Cotation[]>
  {
   
    
    return (
      this.cotations$.pipe(map(cotations => cotations.filter(
        (cotationLine) => { return (cotationLine.produit == referenceProduit); }
      )))
    );
  }

  /**
   * calcul la différence en jours entre date1 et date 2
   * en utilisant : date1 - date2
   */
  public dateDifferenceInDays(date1: Date, date2: Date): number
  {
    const diffTime: number = date1.valueOf() - date2.valueOf();
    const diffDays: number = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return (diffDays);
  }

  public ddmmyyyyToDate(datestring: string): Date
  {
    const temp: string[] = datestring.split('/');
    return new Date(+temp[2], +temp[1], +temp[0]);
  }

  public getInvalidReasons(invalidCotations: Cotation[]): Cotation[]
  {
    let currentDate = new Date();
    for (const invalidCotation of invalidCotations) // ON COMPTE LES COTATIONS CRITIQUES
    {
      if ((invalidCotation.qtecdemax - invalidCotation.qtecde) <= 0)
      {
        invalidCotation.invalidReason = "Tous les produits ont été commandés";
      }
      else if ((invalidCotation.nbrcdemax - invalidCotation.nbrcde) <= 0)
      {
        invalidCotation.invalidReason = "Commandes épuisées";
      }
      else if (invalidCotation.datefin.valueOf() < currentDate.valueOf())
      {
        invalidCotation.invalidReason = "Cotation périmée";
      }
    }

    return (invalidCotations);
  }

  getCotationTous(){
    return this.httpClient.get<Cotation[]>(`${environment.apiUrl}/ListeCotationsToutes.php`, {
      params: {
        regions: JSON.stringify([this.authService.currentUser.region1, this.authService.currentUser.region2])
      }
    });
  }

  groupByNumCotation(data: Cotation[]): { [key: string]: CotationDeSesMorts } {
    return data.reduce((acc, item) => {
      if (!acc[item.numcotation]) {
        acc[item.numcotation] = {
          type: item.type,
          numcli: item.numcli,
          groupe: item.groupe,
          classe: item.classe,
          numcotation: item.numcotation,
          refcot: item.refcot,
          datedeb: new Date(item.datedeb),
          datefin: new Date(item.datefin),
          numfrs: item.numfrs,
          numcotationLigne: item.numcotationLigne,
          perm: item.perm,
          produits: []
        };
      }
      acc[item.numcotation].produits.push({
        region: item.region,
        Nom: item.Nom,
        adresse: item.adresse,
        codepostal: item.codepostal,
        ville: item.ville,
        status: item.status,
        marque: item.marque,
        marquelib: item.marquelib,
        produit: item.produit,
        designation: item.designation,
        prixvente: item.prixvente,
        nbrcde: item.nbrcde,
        nbrcdemax: item.nbrcdemax,
        qtecde: item.qtecde,
        qtecdemini: item.qtecdemini,
        qtecdemax: item.qtecdemax,
        prixstd: item.prixstd,
        prixrevient: item.prixrevient,
        qtestock: item.qtestock,
        qtestockext: item.qtestockext,
        delaireappro: item.delaireappro,
        dateconfcde: item.dateconfcde,
        dateconfcdestatus: item.dateconfcdestatus,
        qtereappro: item.qtereappro
      } as ProduitCotation);
      return acc;
    }, {} as { [key: string]: CotationDeSesMorts });
  }

}
