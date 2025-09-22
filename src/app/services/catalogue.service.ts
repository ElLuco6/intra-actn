import {Injectable, OnInit} from '@angular/core';
import {forkJoin, Observable, of, partition, shareReplay, take} from "rxjs";
import {map} from 'rxjs/operators'
import {Categorie, Filtre, Tree, Produit, CataloguePosition, Search, Client} from "@/models";
import {StorageService} from "./storage.service";
import {environment} from "@env/environment";
import {HttpClient, HttpParams} from "@angular/common/http";
import {SearchService} from "./search.service";
import {Prospect} from "@models/prospect";

@Injectable({
  providedIn: 'root'
})
export class CatalogueService implements OnInit {

  mapCategoriesLabelxID: Observable<Map<string, string>>;
  erreur = new Produit();
  listCat = new Map<Array<string>, any>();
  isFilArianne: boolean = true;

  private readonly _structures$: Observable<Tree<Categorie>>;

  constructor(
    private httpClient: HttpClient,
    private searchService: SearchService,
    private storageService: StorageService) {
    this._structures$ = this.storageService.getStoredData('catalogue', 'structure', () => {
      return this.httpClient.get<Tree<Categorie>>(`${environment.apiUrl}/ListeCategorie.php`, {
        withCredentials: true
      });
    }).pipe(shareReplay(1));
  }

  ngOnInit(): void {
  }

  validateRoute(...labels: string[]): boolean {
    const ids = this.findIds(labels);
    return ids.length === labels.length;
  }

  /**
   * Génère l'arborescence du catalogue
   * @returns L'arborescence du catalogue.
   */
  generateStructure() {
    return this._structures$.pipe(take(1), map(data => { // récupération de la liste de toutes les catégories
      if (this.listCat.size <= 0) // yey, on fait plus 214 loop pour rien à chaque run de catalogue
      {
        this.listCat = new Map();
        for (const categorie of data.nodes) {
          const subCat = new Map();
          for (const subCategorie of categorie.nodes) {
            const subSubCat = new Map();
            if (subCategorie.nodes) {
              for (const subSubCategorie of subCategorie.nodes) {
                subSubCat.set([subSubCategorie.value.id, subSubCategorie.value.label], []);
              }
            }
            subCat.set([subCategorie.value.id, subCategorie.value.label], subSubCat);
          }
          this.listCat.set([categorie.value.id, categorie.value.label], subCat);
        }
      }
      return this.listCat; // après formatage de la liste en map recursive, on la renvoi dans observable
    },));
  }

  /**
   * Trouve les ids correspondant aux labels fournis.
   * @param labels Labels à rechercher [niv1, niv2, niv3]
   * @returns Un tableau d'id [id1, id2, id3]
   */
  findIds(labels: any[]) {
    const search = (labels: string | any[], list: any[] | Map<string[], any>, acc: string | any[]) => {
      for (const [keys, value] of list.entries()) {
        if (keys[1] === labels[0]) {
          if (labels.length === 1) {
            return acc.concat(keys[0]);
          } else {
            return search(labels.slice(1), value, acc.concat(keys[0]));
          }
        }
      }
    };

    return search(labels, this.listCat, []);
  }


  /**
   * Récupère la structure du catalogue.
   */
  getStructure() {
    this.mapCategoriesLabelxID = this._structures$.pipe(
      map(tree => this.generateCategoriesIDsMap(tree, new Map())));
    return this._structures$;
  }

  /** Renvoie this.isFilArianne */
  getFilArianne() {
    return this.isFilArianne;
  }

  /**
   * Set this.isFilArianne
   * @param bool Nouvelle valeur de this.isFilArianne
   */
  setFilArianne(bool: boolean) {
    this.isFilArianne = bool;
  }

  /**
   * Méthode récursive parcourant un arbre de catégories pour génèrer le dictionnaire associant les labels des catégories à leurs IDs.
   * @param tree Un arbre de catégories
   * @param acc Accumulateur représentant le dictionnaire généré progressivement.
   */
  generateCategoriesIDsMap(
    tree: Tree<Categorie>,
    acc: Map<string, string>
  ): Map<string, string> {
    tree.nodes.forEach(node => {
      acc.set(node.value.label, node.value.id);
      if (node.nodes) {
        this.generateCategoriesIDsMap(node, acc);
      }
    });
    return acc;
  }

  /**
   * Récupère une liste de produits depuis le backend en fonction d'un tableau de références.
   * @param refs Tableau de références de produits à rechercher.
   */
  getProductsById(refs: string[]) {
    return this.httpClient.get<Produit[]>(`${environment.apiUrl}/ProduitsByID.php?refs=${refs.join(',')}`,
      {withCredentials: true}
    );
  }

  /**
   * Appelle ListeMarques.php via http get et renvoie son observable
   * @returns Observable du résultat de ListeMarques.php
   */
  getTarifs(): Observable<any> {
    return this.httpClient.get<any>(`${environment.apiUrl}/ListeMarques.php`,
      {withCredentials: true}
    );
  }

  /**
   * Appelle ListeCategorieMarque.php via http get et renvoie son observable
   * @returns Observable du résultat de ListeCategorieMarque.php
   */
  getCategoriesByMarques(): Observable<any> {
    return this.httpClient.get<any>(`${environment.apiUrl}/ListeCategorieMarque.php`,
      {withCredentials: true}
    );
  }

  /**
   * Appelle ListeNiv1Marque.php via http get et renvoie son observable
   * @returns Observable du résultat de ListeNiv1Marque.php
   */
  getCategoriesMarque(): Observable<any> {
    return this.httpClient.get<any>(`${environment.apiUrl}/ListeNiv1Marque.php`,
      {withCredentials: true}
    );
  }

  /**
   * Récupère la liste des filtres disponibles pour les options de parcours de catalogue spécifiées.
   * @param position Position dans le catalogue sous la forme { niv1, niv2, niv3 }
   * @param search
   * @param marque
   */
  public getFiltres(position: CataloguePosition, search: string, marque: string): Observable<Filtre[]> {
    const s = new Search(position, search, marque);
    if (this.searchService.filtreARecherche(s)) { // si on a pas déjà le résultat de la recherche
      this.searchService.searchFiltres = s;
      this.searchService.filtres = this._getAvailableFiltres(position, search, marque);
    }
    return this.searchService.filtres;
  }

  /*getClients(position: CataloguePosition, search: string, marque: string): Observable<Client[]> {
    const s = new Search(position, search, marque);
    if(this.searchService.clientsARecherche(s)){
      this.searchService.searchClients = s;
      this._getAvailableClientsAndProspects(search).subscribe(result => {
        this.searchService.clients = of(result.clients);
      });
    }
    return this.searchService.clients;
  }

  getProspects(position: CataloguePosition, search: string, marque: string): Observable<Prospect[]> {
    const s = new Search(position, search, marque);
    if(this.searchService.prospectsARecherche(s)) {
      this.searchService.searchProspects = s;
      this._getAvailableClientsAndProspects(search).subscribe(result => {
        this.searchService.prospects = of(result.prospects);
      });
    }
    return this.searchService.prospects;
  }*/

  getClients(position: CataloguePosition, search: string, marque: string): Observable<Client[]> {
    const s = new Search(position, search, marque);
    if(s.search) {
      if(this.searchService.clientsARecherche(s)){
        this.searchService.searchClients = s;
        this.searchService.clients = this._getAvailableClients(search);
      }
    }else {
      this.searchService.clients = of([]);
    }

    return this.searchService.clients;
  }

  getProspects(position: CataloguePosition, search: string, marque: string): Observable<Prospect[]> {
    const s = new Search(position, search, marque);
    if(s.search) {
      if(this.searchService.prospectsARecherche(s)){
        this.searchService.searchProspects = s;
        this.searchService.prospects = this._getAvailableProspects(search);
      }
    }else {
      this.searchService.prospects = of([]);
    }

    return this.searchService.prospects;
  }

  /**
   * Effectue la requette http get Filtres.php pour this.getFiltres()
   * Renvoie l'Observable du résultat de Filtres.php
   * @param position Position dans le catalogue à laquelle on veut connaitre les filtres
   * @param search Chaine de caractère filtrant les produits desquels on retourne les filtres par référence
   * @param marque Chaine de caractère filtrant les produits desquels on retourne les filtres par marque
   */
  private _getAvailableFiltres(position: CataloguePosition, search: string, marque: string) {
    return this.httpClient.get<Filtre[]>(`${environment.apiUrl}/Filtres.php`,
      {
        params: new HttpParams().set('search', search || '')
          .append('marque', marque || '')
          .append('niv1', position.category || '')
          .append('niv2', position.subCategory || '')
          .append('niv3', position.subSubCategory || ''),
        withCredentials: true
      }
    );
  }

  private _getAvailableClients(search: string) {
    const params = new HttpParams()
      .set('search', search ?? '');

    return this.httpClient.get<Client[]>(`${environment.apiUrl}/Recherchetout.php`, { params, withCredentials: true })
      .pipe(
        map(clients =>
          clients.map(client => {
            if(client['type'] == 'CLIENT'){
              return client;
            }else{
              return null;
            }
          }
        )), map(clients => clients.filter(produit => produit !== null))
      )
  }

  private _getAvailableProspects(search: string) {

    return this.httpClient.get<any[]>(`${environment.apiUrl}/rechercheProspect.php`, {
      params: {
        search: search
      }, withCredentials: true })
      .pipe(
        map(prospects =>
          prospects.map(prospect => {
              if(prospect['type'] == 'PROSPECT'){
                return prospect;
              }else{
                return null;
              }
            }
          )), map(prospects => prospects.filter(produit => produit !== null))
      )
  }
}
