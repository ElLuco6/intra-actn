import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, EMPTY, BehaviorSubject, Subject } from 'rxjs';
import {map, take, takeUntil, tap} from 'rxjs/operators';
import { environment } from "@env/environment";

/**
 * Service pour fournir des prédictions par rapport à une recherche par mot clé liée au catalogue.
 */
@Injectable({
  providedIn: 'root'
})
export class CatalogueSearchPredictionService {

  source: Observable<CataloguePredictJSON>;

  public get searchString$(): Observable<string> {
    return this._searchString.asObservable();
  }

  public get searchString(): string {
    return this._searchString.value;
  }
  public set searchString(value: string) {
    this._searchString.next(value);
  }

  private _searchString = new BehaviorSubject<string>('');

  newSearch$ = new Subject<string>();

  constructor(private httpClient: HttpClient) {
    this.source = this.getCataloguePredictJSON();
  }

  /**
   *
   * @param searchString La chaîne de caractère à rechercher
   */
  getPredictions(searchString: string): Observable<PredictionResults> {
    const str = this.removeAccents(searchString);
    const keywords = [str.toUpperCase()].filter(keyword => keyword.length >= 2);

    if (keywords.length) {
      return this.source.pipe(
        map(
          source =>
            (
              {
              clients: source.filter(
                client =>
                  client.LABEL === 'CLIENT' && keywords.reduce(
                  (acc, keyword) =>
                    client.CODE.startsWith(keyword) ||
                    client.DESIGNATION.includes(keyword) ||
                    acc,
                  false
                )
              )
              .map(client => ({
                numeroClient: client.CODE,
                designation: client.DESIGNATION,
                region: client.CATEGORIE,
                label: client.LABEL
              })),
              prospects: source.filter(
                prospect => keywords.reduce(
                  (acc, keyword) =>
                    prospect.DESIGNATION.startsWith(keyword) ||
                    acc,
                  false
                )
              )
              .map(prospect => ({
                designation: prospect.DESIGNATION,
                label: prospect.LABEL
              })),
              marques: new Set([...source.filter(marque =>
                keywords.reduce(
                  (acc, keyword) =>
                    marque.LABEL.startsWith(keyword) ||
                    acc,
                  false
                )
              ).map(marque => marque?.LABEL)
              ]),
              produits: source
                .filter(produit =>
                  produit.TYPE === 'MARQUE' && keywords.reduce(
                    (acc, keyword) =>
                      produit.LABEL.includes(keyword) ||
                      produit.CODE.startsWith(keyword) ||
                      produit.DESIGNATION.includes(keyword) ||
                      acc,
                    false
                  )
                )
                .map(produit => ({
                  reference: produit.CODE,
                  designation: produit.DESIGNATION,
                  poids: this.getPoids(produit, keywords),
                  type: produit.TYPE,
                  marque: produit.LABEL
                }))
                .sort((a, b) => b.poids - a.poids)
              } as PredictionResults)
        ),
      );
    } else {
      return EMPTY;
    }
  }

  /**
   * @returns Le contenu du fichier predict.json dans un observable de CataloguePredictJSON.
   */
  public getCataloguePredictJSON(): Observable<CataloguePredictJSON> {
    return this.httpClient.get<CataloguePredictJSON>(`${environment.apiUrl}/predict.json`,
      {
        responseType: 'json'
      });
  }

  /**
   * Calcule le poids de la recherche dans les produits correspondants a la recherche
   * @param produit Un produit
   * @param keywords Une liste de mots-clés
   */
  public getPoids(produit: any, keywords: Array<string>) {
    let poids = 0;
    for (const keyword of keywords) {

      // Le poids peut augmenter si la recherche est contenu dans le nom de la marque
      if (produit.LABEL.includes(keyword)) {
        poids += keyword.length;
      }

      // Ou dans la référence produit
      if (produit.CODE.includes(keyword)) {
        poids += keyword.length;
      }

      // Ou dans la désignation produit
      if (produit.DESIGNATION.toUpperCase().includes(keyword)) {
        poids += keyword.length;
      }
    }
    return poids;
  }

  /**
   * Supprime les accents d'une chaîne de caractère
   * @param str Une chaîne de caractères
   */
  public removeAccents(str: string): string {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  public emitNewCatalogueSearch(search: string)
  {
    this.newSearch$.next(search);
  }
}

/**
 * Ensemble de résultats du fichier predict.json correspondant à une chaîne de caractères donnée.
 * Utilisé pour le contenu des autocompletes liés au catalogue.
 */
export interface PredictionResults {
  marques: Set<string>;
  produits: [
    {
      type: string;
      reference: string;
      designation: string;
      poids: number;
      marque: string;
    }
  ];
  clients: [
    {
      label: string;
      numeroClient: string;
      designation: string;
      region: string;
    }
  ];
  prospects: [
    {
      label: string;
      designation: string;
    }
  ]
}

/**
 * Représente le contenu du fichier predict.json
 */
export type CataloguePredictJSON = [{
  TYPE: string;
  LABEL: string;
  CODE: string;
  DESIGNATION: string;
  CATEGORIE: string;
  FAMILLE: string;
  REFFOUR: string;
}];
