import { Injectable } from '@angular/core';
import { ProduitService } from "./produit.service";
import { Observable, Subject } from 'rxjs';
import { CatalogueSample, Filtre} from "../models/catalogue";
import { shareReplay } from 'rxjs/operators';

/** Service Resolver récupérant les nouveaux produits  */
@Injectable({
  providedIn: 'root'
})
export class NouveautesResolverService {

  constructor(private produitService: ProduitService) { }

  /**
   * Récupère la liste des Produits en promos Nouveauté
   * Depuis de 'ProduitService'
   */
  resolve(): Observable<CatalogueSample> {
    const filtres$ = new Subject<Array<Filtre>>();
    const produits$ = this.produitService.getPromos("N").pipe(shareReplay(1));
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
