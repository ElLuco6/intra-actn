import { Injectable } from '@angular/core';
import { ProduitService } from "./produit.service";
import { Observable, Subject } from 'rxjs';
import { CatalogueSample, Filtre } from "../models/catalogue";
import { shareReplay } from 'rxjs/operators';

/** Service Resolver récupérant les produits en bundles / packs */
@Injectable({
  providedIn: 'root'
})
export class PacksResolverService {

  constructor(private produitService: ProduitService) { }

  /**
   * Récupère la liste des Produits en promos Pack / Bundle
   * Depuis de 'ProduitService'
   */
  resolve(): Observable<CatalogueSample> {
    const filtres$ = new Subject<Array<Filtre>>();
    const produits$ = this.produitService.getPromos("B").pipe(shareReplay(1));
    produits$.subscribe(() => {
      filtres$.next([]);
      filtres$.complete();
    });

    return new Observable(obs => {
      obs.next(
        {
          filtres$: filtres$.asObservable(),
          produits$
        } as CatalogueSample);
      obs.complete();
    });
  }

}
