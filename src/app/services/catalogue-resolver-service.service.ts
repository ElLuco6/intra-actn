import { Injectable } from '@angular/core';
import { CatalogueService } from './catalogue.service';
import {
  Router,
  Resolve,
  ActivatedRouteSnapshot,
  RouterStateSnapshot
} from '@angular/router';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { CatalogueSample} from "@/models";
import { ProduitService } from './produit.service';
import {LogClientService} from "@services/log-client.service";

/**
 * Résout les produits et filtres disponibles pour une certaine position dans le catalogue
 * avec ou non un filtre par mots clés ou par marque.
 */
@Injectable({
  providedIn: 'root'
})
export class CatalogueResolverService {

  // IL EST IMPOSSIBLE DE SUBSCRIBE DANS UN RESOLVER

  constructor(
    private catalogueService: CatalogueService,
    private router: Router,
    private produitService: ProduitService,
    private authClient: LogClientService
  ) { }

  /**
   * Résout les produits et filtres disponibles pour une certaine position dans le catalogue
   */
  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<CatalogueSample> { // le resolver se lance avec les arguments de la route
    // console.warn("resolving...");
    const decodeIfNotNull = (str: string) => {
      return str != null ? decodeURI(str) : str;
    };
    // Récupérer le filtre par mots clés
    const search = decodeIfNotNull(route.queryParamMap.get('search'));
    // Récupérer le filtre par marque
    const marque = decodeIfNotNull(route.queryParamMap.get('marque'));
    const niveau1 = decodeIfNotNull(route.queryParamMap.get('niv1'));
    const similaire = decodeIfNotNull(route.queryParamMap.get('similaire'));

    return this.catalogueService.generateStructure().pipe(take(1), map(v => { // récupération de la liste des catégories en Map (ON UTILISE PAS LA MAP, on se fait que la récupérer dans le localStorage pour plus tard) L'ETAPE EST NECESSAIRE (même si on utilise pas 'v')
      let ids = [];
      let niv1 = decodeIfNotNull(route.queryParamMap.get('niv1')); // on récupère les paramètres de la route (niv1?, niv2?, niv3?)
      if (niv1 == null) {
        niv1 = decodeIfNotNull(route.paramMap.get('niv1'));
        const niv2 = decodeIfNotNull(route.paramMap.get('niv2'));
        const niv3 = decodeIfNotNull(route.paramMap.get('niv3'));
        const labels = [].concat(niv1 ?? []).concat(niv2 ?? []).concat(niv3 ?? []);
        ids = this.catalogueService.findIds(labels);
      } else {
        ids = [
          niv1,
          decodeIfNotNull(route.queryParamMap.get('niv2')),
          decodeIfNotNull(route.queryParamMap.get('niv3'))
        ];
      }
      return { category: niveau1 ? niveau1 : ids?.[0] ?? '', subCategory: ids?.[1] ?? '', subSubCategory: ids?.[2] ?? '' }; // renvoi un objet contenant les parametres de la route / du catalogue (niv1?, niv2?, niv3?)
    })).pipe(take(1), map(position => {

        return {
          filtres$: this.catalogueService.getFiltres(position, search, marque),
          produits$: this.produitService.getProduits(position, search, marque, this.authClient.currentClient ? this.authClient.currentClient.id : ''),
          clients$: this.catalogueService.getClients(position, search, marque),
          prospects$: this.catalogueService.getProspects(position, search, marque)
        };
    }));
  }
}
