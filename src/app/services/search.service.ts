import { Injectable } from '@angular/core';
import {map, Observable, shareReplay} from "rxjs";
import {Produit} from "../models/produit";
import {HttpClient} from "@angular/common/http";
import {environment} from "../../environments/environment";
import {Client} from "../models/client";
import {Search} from "../models/search";
import {Filtre} from "../models/catalogue";
import {Prospect} from "@models/prospect";

const CACHE_SIZE = 1;
@Injectable({
  providedIn: 'root'
})
export class SearchService {

  constructor(
    private http: HttpClient
  ) {
    this._searchFiltres = new Search();
    this._searchProduits = new Search();
    this._searchClients = new Search();
    this._searchProspects = new Search();
    this._produits$ = null;
    this._filtres$ = null;
    this._clients$ = null;
    this._prospects$ = null;
    this._etatsFiltres = [];
  }

  public getResultSearchAll(params): Observable<Client[]>{
    return this._getResultSearchALl(params);
  }

  private _getResultSearchALl(params: string): Observable<any[]>{
    return this.http.get<any[]>(`${environment.apiUrl}/Recherchetout.php`, {
      params: {
        search: params
      },
      withCredentials: true
    }).pipe(
      map(all =>
        all.map(
          elem => {
            if(elem['erreur']){
              const erreur = [];
              erreur['nom'] = elem['erreur'][0] + elem['erreur'].slice(1).toLowerCase();
              return erreur;
            } else {
              return elem;
            }
          }
        )
      ));
  }

  private _searchFiltres: Search;
  private _searchProduits: Search;
  private _searchClients: Search;
  private _searchProspects: Search;
  private _produits$: Observable<Produit[]>;
  private _filtres$: Observable<Filtre[]>;
  private _clients$: Observable<Client[]>;
  private _prospects$: Observable<Prospect[]>;
  private _etatsFiltres: Array<string>;

  get searchFiltres(): Search {
    return this._searchFiltres;
  }
  set searchFiltres(search: Search) {
    this._searchFiltres = search;
  }

  get searchProduits(): Search {
    return this._searchProduits;
  }
  set searchProduits(search: Search) {
    this._searchProduits = search;
  }


  get searchClients(): Search {
    return this._searchClients;
  }
  set searchClients(search: Search) {
    this._searchClients = search;
  }

  get searchProspects(): Search {
    return this._searchProspects;
  }
  set searchProspects(search: Search) {
    this._searchProspects = search;
  }

  get filtres(): Observable<Filtre[]> {
    if (this._filtres$ != null) {
      return this._filtres$;
    } else {
      return new Observable<Filtre[]>();
    }
  }
  set filtres(filtres: Observable<Filtre[]>) {
    this._filtres$ = filtres.pipe(shareReplay(CACHE_SIZE));
    this._etatsFiltres = [];
  }

  get produits(): Observable<Produit[]> {
    if (this._produits$ != null) {
      return this._produits$;
    } else {
      return new Observable<Produit[]>();
    }
  }
  set produits(produits: Observable<Produit[]>) {
    this._produits$ = produits.pipe(shareReplay(CACHE_SIZE));
  }

  get clients(): Observable<Client[]> {
    if (this._clients$ != null) {
      return this._clients$;
    } else {
      return new Observable<Client[]>();
    }
  }

  get prospects(): Observable<Prospect[]> {
    if (this._prospects$ != null) {
      return this._prospects$;
    } else {
      return new Observable<Prospect[]>();
    }
  }

  set clients(clients: Observable<Client[]>) {
    this._clients$ = clients.pipe(shareReplay(CACHE_SIZE));
  }

  set prospects(prospect: Observable<Prospect[]>) {
    this._prospects$ = prospect.pipe(shareReplay(CACHE_SIZE));
  }

  get etatsFiltres(): Array<string> {
    return this._etatsFiltres;
  }
  set etatsFiltres(etats: Array<string>) {
    this._etatsFiltres = etats;
  }

  /**
   * Indique si la recherche de filtre doit être executé ou non
   * @param search La recherche en cours d'exécution
   */
  public filtreARecherche(search: Search): boolean {
    return !this._searchFiltres.equals(search);
  }

  /**
   * Indique si la recherche de produits doit être executé ou non
   * @param search La recherche en cours d'exécution
   */
  public produitsARecherche(search: Search): boolean {
    return !this._searchProduits.equals(search);
  }

  /**
   * Indique si la recherche de produits doit être executé ou non
   * @param search La recherche en cours d'exécution
   */
  public clientsARecherche(search: Search): boolean {
    return !this._searchClients.equals(search);
  }

  public prospectsARecherche(search: Search): boolean {
    return !this._searchProspects.equals(search);
  }
}
