import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from "@angular/common/http";
import { StorageService } from "./storage.service";
import { environment } from "@env/environment";
import { Observable } from "rxjs";
import { CataloguePosition, Produit, Search } from "@/models";
import { AuthenticationService } from "@services/authentication.service";
import { SearchService } from "@services/search.service";
import { map, take } from "rxjs/operators";
import { Router } from "@angular/router";
import { GrilleTarifaire } from "@models/grilleTarifaire";
import { Horizon } from "@models/horizon";

@Injectable({
  providedIn: 'root'
})
export class ProduitService {

  constructor(
    private http: HttpClient,
    private storageService: StorageService,
    private authenticationService: AuthenticationService,
    private searchService: SearchService,
    private router: Router
  ) {
  }

  public shuffle(array: any[]): any[] {
    if (array == null) {
      return [];
    }
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  public goToProduitById(produitId: string, blank?: boolean): void {
    this.getProduitById(produitId)
      .pipe(take(1))
      .subscribe((ret) => {
        const url = String(this.lienProduit(ret)).replace(/,/g, '/');
        if (blank) {
          window.open(url, '_blank');
        } else {
          this.router.navigateByUrl(url);
        }
      });
  }


  public getProduitById(id: string): Observable<Produit> {
    return this.storageService.getStoredData('produits', id, () => {
      return this.http.get<Produit>(`${environment.apiUrl}/ProduitByID.php`, {
        withCredentials: true,
        responseType: 'json',
        params: {
          ref: encodeURIComponent(id)
        }
      });
    });
  }

  public actPrixProduit(id: string) {
    return this.http.get<Produit>(`${environment.apiUrl}/ProduitByID.php`, {
      withCredentials: true,
      responseType: 'json',
      params: {
        ref: encodeURIComponent(id)
      }
    });
  }

  public getProduitByIdClient(id: string): Observable<Produit> {
    return this.storageService.getStoredDataClient('produits', id, () => {
      return this.http.get<Produit>(`${environment.apiUrl}/ProduitByID.php`, {
        withCredentials: true,
        responseType: 'json',
        params: {
          ref: encodeURIComponent(id)
        }
      });
    });
  }

  /**
   * Récupère des produit via leurs id.
   * @param references Un trableau d'id des produits à rechercher
   * @returns Observable<Produit> des produits trouvés
   */
  public getProduitsById(references: Array<string>): Observable<Array<Produit>> {
    return this.http.post<Array<Produit>>(`${environment.apiUrl}/ProduitMultById.php`,
      {
        ref: references
      },
      {
        withCredentials: true,
        responseType: 'json',
      }
    );
  }


  public getNombrePhotosProduitByID(ref: string): Observable<number> {
    return this.http.get<number>(`${environment.apiUrl}/ProduitByIDGalerie.php`, {
      withCredentials: true,
      responseType: 'json',
      params: {
        ref: encodeURIComponent(ref)
      }
    });
  }

  /**
   * Récupère une liste de produits similaire un produit.
   * @param ref La référence du produit à rechercher
   * @param limit15
   */
  getProduitSimilaire(ref: string): Observable<Produit[]> {
    return this.http.get<Produit[]>(`${environment.apiUrl}/ProduitSimilaire.php`, {
      withCredentials: true,
      params: {
        ref: encodeURIComponent(ref)
      }
    });
  }

  public getPromos(promoType = 'P'): Observable<Produit[]> {
    return this.storageService.getStoredData(promoType, '', () => {
      return this.http.get<Produit[]>(`${environment.apiUrl}/ListeProduits.php`,
        {
          withCredentials: true,
          params: { promo: promoType }
        }
      );
    });
  }

  public getProduitDescriptionById(id: string): Observable<any> {
    return this.storageService.getStoredData('descriptions', id, () => {
      return this.http.get(`${environment.apiUrl}/ProduitByIDdescription.php`, {
        withCredentials: true,
        responseType: 'json',
        params: {
          ref: encodeURIComponent(id)
        }
      });
    }, false);
  }

  public getProduitsAssociationVente(id: string): Observable<Produit[]> {
    return this.storageService.getStoredData('produitsAssocies', id, () => {
      return this.http.get<Produit[]>(`${environment.apiUrl}/ProduitAssociationVente.php`,
        {
          params: new HttpParams().set('ref', id),
          withCredentials: true
        });
    });
  }

  getProduitsRemplacement(ref: string): Observable<Produit[]> {
    // return this.storageService.getStoredData('produitsRemplacement', ref, () => {
    return this.http.get<Produit[]>(`${environment.apiUrl}/ProduitRemplacement.php`, {
      withCredentials: true,
      params: {
        ref: encodeURIComponent(ref)
      }
    });
    // });
  }

  getProduitsRenouvellement(ref: string): Observable<Produit[]> {
    // return this.storageService.getStoredData('produitsRenouvellement', ref, () => {
    return this.http.get<Produit[]>(`${environment.apiUrl}/ProduitRenouvellement.php`, {
      withCredentials: true,
      params: {
        ref: encodeURIComponent(ref)
      }
    });
    // });
  }

  public getProduits(position: CataloguePosition, search: string, marque: string, clientId): Observable<Produit[]> {
    const s = new Search(position, search, marque, this.authenticationService.currentUser);
    if (this.searchService.produitsARecherche(s)) {
      this.searchService.searchProduits = s;
      this.searchService.produits = this._getProduits(position, search, marque, clientId);
    }
    return this.searchService.produits;
  }

  public lienProduit(produit: Produit): Array<string> {
    const addNiveau = (p, i) => {
      switch (i) {
        case 1:
          return p.niveaulibelle1 === '' ? '_' : p.niveaulibelle1;
        case 2:
          return p.niveaulibelle2 === '' ? '_' : p.niveaulibelle2;
        case 3:
          return (p.niveaulibelle3 === '' || p.niveaulibelle3 === '.') ? (p.niveaulibelle4 === '' ? '_' : p.niveaulibelle4) : p.niveaulibelle3;
      }
    };
    return ['/catalogue', addNiveau(produit, 1), addNiveau(produit, 2), addNiveau(produit, 3), produit.reference];
  }

  /**
   * Renvoie le lien d'une image par défaut selon le type de produit.
   * @param produit Un produit
   */
  public errorImg(produit: Produit): string {
    if (produit.gabarit === 'V') {
      return (`${environment.produitVirtuelDefautImgUrl}`);
    }
    return (`${environment.produitDefautImgUrl}`);
  }

  public getFiltresMarqueOf(marque: string, niv1: string, niv2: string, niv3 = ''): Observable<any> {
    return this.storageService.getStoredData('filtresmarques', `${marque + niv1 + niv2 + niv3}`, () => {
      return this.http.get<any>(`${environment.apiUrl}/FiltresmarqueDetail.php`, {
        withCredentials: true,
        responseType: 'json',
        params: {
          marque: encodeURIComponent(marque),
          niv1: encodeURIComponent(niv1),
          niv2: encodeURIComponent(niv2)
        }
      });
    });
  }

  public getFiltresMarques(): Observable<any> {
    return this.storageService.getStoredData('filtresmarques', 'filtresmarques', () => {
      return this.http.get<any>(`${environment.apiUrl}/FiltresMarques.php`, {
        withCredentials: true,
        responseType: 'json'
      });
    });
  }

  getProduitsAbonnements(): Observable<Produit[]> {
    return this.http.get<Produit[]>(`${environment.apiUrl}/ListeProduits.php`, {
      withCredentials: true,
      params: {
        search: '',
        marque: '',
        division: 'ABO',
        niv1: '',
        niv2: '',
        niv3: '',
        TIERS: ''
      }
    });
  }

  private _getProduits(position: CataloguePosition, search: string, marque: string, clientId): Observable<Produit[]> {
    const params = new HttpParams()
      .set('search', search ?? '')
      .append('marque', marque ?? '')
      .append('niv1', position.category || '')
      .append('niv2', position.subCategory || '')
      .append('niv3', position.subSubCategory || '')
      .append('TIERS', clientId);

    return this.http.get<Produit[]>(`${environment.apiUrl}/ListeProduits.php`, {params, withCredentials: true})
      .pipe(
        map(produits => produits.map(produit => {
          if (produit['erreur']) {
            const erreur: Produit = new Produit();
            erreur.designation = produit['erreur'][0] + produit['erreur'].slice(1).toLowerCase();
            return erreur;
          } else if (produit['type'] != "CLIENT") {
            // Filtre les critères dynamiques des produits, supprime les critères vides.
            for (let i = 1; produit['criterelibelle' + i] !== undefined; i++) {
              if (!produit['criterelibelle' + i]?.length) {
                delete produit['criterelibelle' + i];
                delete produit['criterevalue' + i];
              }
            }
            return produit;
          }
          return null;
        })),
        map(produits => produits.filter(produit => produit !== null))
      );
  }

  /** Permet de get la grille tarifaire du produit */
  getproduitGrilleTarif(produit: Produit): Observable<Array<GrilleTarifaire>> {
    return this.http.get<Array<GrilleTarifaire>>(`${environment.apiUrl}/ProduitPrixColonne.php`, {
      params: {
        marque: produit.marque,
        produit: produit.reference
      }
    });
  }


  getProduitHorizonCmd(produit: Produit): Observable<Array<Horizon>> {
    return this.http.get<Array<Horizon>>(`${environment.apiUrl}/horizonCommande.php`, {
      params: {
        marque: produit.marque,
        produit: produit.reference
      }
    });
  }

}
