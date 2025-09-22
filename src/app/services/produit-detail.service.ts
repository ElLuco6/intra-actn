import {Injectable} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {ProduitWithDescription} from '@components/catalogue/produit-cat/produit-resolver.service';
import {take} from 'rxjs/operators';
import {environment} from '@env/environment';
import {Produit} from '@/models';
import {GrilleTarifaire} from "@models/grilleTarifaire";
import {Horizon} from "@models/horizon";

@Injectable({
  providedIn: 'root'
})
export class ProduitDetailService {

  constructor(private route: ActivatedRoute, private router: Router) {
  }

  getProduit(callback: (produit: Produit, imgUrl: string, cotations: any, descriptionMap: Map<string, Array<string>>, produitsRemplacement: Array<Produit>, produitsRenouvellement: Array<Produit>, produitsSimilaires: Array<Produit>, produitsAssocies: Array<Produit>, grilleTarif: Array<GrilleTarifaire>, horizonCmd: Array<Horizon>) => void): void {
    this.route.data
      .subscribe((data: { produit: ProduitWithDescription }) => {
        const produit = data.produit.produit$;
        const cotations = data.produit.cotations$;
        const description = data.produit.description$;
        const produitsRemplacement = data.produit.produitsRemplacement$;
        const produitsRenouvellement = data.produit.produitsRenouvellement$;
        const produitsSimilaires = data.produit.produitsSimilaires$;
        const produitsAssocies = data.produit.produitsAssocies$;
        const grilleTarif = data.produit.grilleTarif$;
        const horizonCmd = data.produit.horizonCmd$;

        produit.pipe(take(1)).subscribe(produitData => {
          const imgUrl = environment.photoReel + this._urlImage(produitData.photo);
          cotations.pipe(take(1)).subscribe(cotationsData => {
            description.subscribe(descriptionData => {
              const descriptionMap = new Map<string, Array<string>>();
              descriptionData.forEach(desc => {
                if (!descriptionMap.get(desc.type)) {
                  descriptionMap.set(desc.type, []);
                }
                descriptionMap.get(desc.type).push(desc.description);
              });
              produitsRemplacement.pipe(take(1)).subscribe(produitsRemplacementData => {
                produitsRenouvellement.pipe(take(1)).subscribe(produitsRenouvellementData => {
                  produitsSimilaires.pipe(take(1)).subscribe(produitsSimilairesData => {
                    produitsAssocies.pipe(take(1)).subscribe(produitsAssociesData => {
                      grilleTarif.pipe(take(1)).subscribe(grilleTarifData => {
                        horizonCmd.pipe(take(1)).subscribe(horizonCmd => {
                          callback(produitData, imgUrl, cotationsData.length >= 1 ? cotationsData : null, descriptionMap, produitsRemplacementData, produitsRenouvellementData, produitsSimilairesData, produitsAssociesData, grilleTarifData, horizonCmd);
                        });
                      });
                    });
                  });
                });
              });
            });
          });
        });
      });
  }

  private

  _urlImage(photo
            :
            string, index
            :
            number = 0
  ):
    string {
    let url = photo.endsWith('.jpg') ? photo.substring(0, photo.length - 4) : photo;
    if (index) {
      url += `_${index}`;
    }
    return `${url}.webp`;
  }

  formatWeb(web
            :
            string
  ):
    string[] {
    return web.split(/:(.+)/).map(w => w.trim());
  }

  formatProduitPoids(produit
                     :
                     Produit
  ):
    string {
    return produit.poidsbrut >= 1 ? `${produit.poidsbrut} kg` : `${produit.poidsbrut * 1000} g`;
  }

  isPhoto(ref
          :
          string
  ):
    boolean {
    return /.*\.(jpg|png|jpeg)$/gi.test(ref);
  }

  shouldFormat(strings
               :
               Array<string>
  ):
    boolean {
    return strings.some(string => string.includes('§'));
  }

  navigateToSimilar(produit
                    :
                    Produit
  ):
    void {
    const path = ['/catalogue', produit.niveaulibelle1, produit.niveaulibelle2 || 'unique', produit.niveaulibelle3 || 'unique'].filter(Boolean);
    const params = produit.crits.reduce((acc, crit) => {
      if (crit.value && crit.name !== 'Garantie' && crit.name !== 'Location') {
        acc[crit.name] = crit.value;
      }
      return acc;
    }, {});
    this.router.navigate(path, {queryParams: params});
  }

  fullString(strings
             :
             Array<string>
  ):
    string {
    const trimedStrings = strings.map((element) => element.trim());
    return trimedStrings.join(' ').replace(/(?!^ *§)* *§ */g, '\n●\t').replace(/^\n/g, '').replace(/£/g, '\n\n').trim();
  }

  errorImg(produit
           :
           Produit
  ):
    string {
    return produit.gabarit === 'V' ? environment.produitVirtuelDefautImgUrl : environment.produitDefautImgUrl;
  }

  urlImage(produit
           :
           Produit, index
           :
           number = 0
  ):
    string {
    const baseUrl = produit.photo.endsWith('.jpg') ? produit.photo.slice(0, -4) : produit.photo;
    return `${baseUrl}_${index}.webp`;
  }
}
