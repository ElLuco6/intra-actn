import { Injectable } from '@angular/core';
import { Resolve, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Produit } from "@/models";
import { ProduitService } from "@services/produit.service";
import {forkJoin, Observable, of, Subject} from 'rxjs';
import { take, map, switchMap } from 'rxjs/operators';
import { Meta } from '@angular/platform-browser';
import { environment } from "@env/environment";
import { TitleService } from "@services/title.service";
import { CotationService } from '@services/cotation.service';
import {GrilleTarifaire} from "@models/grilleTarifaire";
import {Horizon} from "@models/horizon";

@Injectable({
  providedIn: 'root'
})
export class ProduitResolverService implements Resolve<ProduitWithDescription> {
  private loadingSubject = new Subject<boolean>();
  loading$ = this.loadingSubject.asObservable();

  constructor(
    private router: Router,
    private produitService: ProduitService,
    private title: TitleService,
    private metaService: Meta,
    private cotationService: CotationService
  ) { }

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<ProduitWithDescription> {
    this.loadingSubject.next(true);
    const produitId = route.paramMap.get('ref');
    return this.produitService.getProduitById(produitId).pipe(
      switchMap(produit => {
        return forkJoin({
          nbPhotos: this.produitService.getNombrePhotosProduitByID(produit.photo).pipe(take(1)),
          description: this.produitService.getProduitDescriptionById(produitId).pipe(take(1)),
          produitsAssocies: this.produitService.getProduitsAssociationVente(produitId).pipe(take(1)),
          produitsRemplacement: this.produitService.getProduitsRemplacement(produitId).pipe(take(1)),
          produitsRenouvellement: this.produitService.getProduitsRenouvellement(produitId).pipe(take(1)),
          produitsSimilaires: this.produitService.getProduitSimilaire(produitId).pipe(take(1)),
          cotations: this.cotationService.getProduitCotations(produit.reference).pipe(take(1)),
          grilleTarif: this.produitService.getproduitGrilleTarif(produit).pipe(take(1)),
          horizonCmd: this.produitService.getProduitHorizonCmd(produit).pipe(take(1)),
        }).pipe(
          map(({ nbPhotos, description, produitsAssocies, produitsRemplacement, produitsRenouvellement, produitsSimilaires, cotations, grilleTarif, horizonCmd}) => {
            produit.photos = nbPhotos;
            this.title.addTitle(produit.marquelib);
            this.metaService.updateTag({ name: 'description', content: `ACTN - ${produit.marquelib} - ${produit.reference} - ${produit.designation}` });
            this.metaService.updateTag({ name: 'keywords', content: `${produit.marquelib}, ${produit.reference}, ${produit.reffournisseur}, ${produit.niveaulibelle1}, ${produit.niveaulibelle2}, ${produit.niveaulibelle3}, ${produit.niveaulibelle4}` });
            this.metaService.updateTag({ property: 'og:title', content: `ACTN - ${produit.marquelib} - ${produit.reference}` });
            this.metaService.updateTag({ property: 'og:description', content: produit.designation });
            this.metaService.updateTag({ property: 'og:image', content: `${environment.photoReel}${produit.photo}.webp` });
            this.metaService.updateTag({ property: 'og:url', content: `https://www.actn.fr${this.router.url}` });
            this.loadingSubject.next(false);
            return {
              produit$: of(produit),
              description$: of(description),
              produitsAssocies$: of(produitsAssocies),
              produitsRemplacement$: of(produitsRemplacement),
              produitsRenouvellement$: of(produitsRenouvellement),
              produitsSimilaires$: of(produitsSimilaires),
              cotations$: of(cotations),
              grilleTarif$: of(grilleTarif),
              horizonCmd$: of(horizonCmd),
            } as ProduitWithDescription;
          })
        );
      })
    );
  }
}

export class ProduitWithDescription {
  produit$: Observable<Produit>;
  description$: Observable<any>;
  produitsAssocies$: Observable<Array<Produit>>;
  produitsRemplacement$: Observable<Array<Produit>>;
  produitsRenouvellement$: Observable<Array<Produit>>;
  produitsSimilaires$: Observable<Array<Produit>>;
  cotations$: Observable<any>;
  grilleTarif$: Observable<Array<GrilleTarifaire>>;
  horizonCmd$: Observable<Array<Horizon>>;
}
