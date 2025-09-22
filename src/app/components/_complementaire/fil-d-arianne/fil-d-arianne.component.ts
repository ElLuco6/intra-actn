import {Component, OnInit} from '@angular/core';
import {
  ActivatedRoute,
  Router,
  NavigationEnd,
  ActivatedRouteSnapshot
} from '@angular/router';
import { filter } from 'rxjs/operators';
import { FilDArianneItem } from "@/models";
import {AuthenticationService} from "@services/authentication.service";
import {CatalogueService} from "@services/catalogue.service";
import {TitleService} from "@services/title.service";
import { ProduitService } from "@services/produit.service";
import { ComponentsInteractionService } from "@services/components-interaction.service";
import {faChevronRight, faHome} from "@fortawesome/free-solid-svg-icons";

/**
 * Composant représentant le fil d'arianne.
 */
@Component({
  selector: 'app-fil-d-arianne',
  templateUrl: './fil-d-arianne.component.html',
  styleUrls: ['./fil-d-arianne.component.scss']
})
export class FilDArianneComponent implements OnInit
{
  /**
   * Contient le fil d'arianne courant.
   */
  public filDArianne: FilDArianneItem[];
  showList = false;
  listCatDyn = [];
  chemin: string[];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    public catalogueService: CatalogueService,
    private title: TitleService
  ) { }

  ngOnInit()
  {
    this.catalogueService.generateStructure();

    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.title.resetTitle();
        this.filDArianne = this.getFil(this.router.routerState.snapshot.root);
        let newSearch: string = this.route.snapshot.queryParams?.['search'];
        if (!!newSearch) {
          this.filDArianne[this.filDArianne.length - 1].label = "Recherche \"" + newSearch + "\"";
        }
      });
  }

  /**
   * Méthode récursive construisant le fil d'arianne
   * @param route La section de la route (URL) étudiée.
   * @param url L'URL représentant la concaténation des sections précédentes.
   * Permet d'associer son URL complet à chaque partie du fil d'arianne.
   * @param filDArianne Tableau contenant les différentes parties du fil d'arianne.
   */
  private getFil(
    route: ActivatedRouteSnapshot,
    url: string = '',
    filDArianne: FilDArianneItem[] = []
  ): FilDArianneItem[]
  {
    const ROUTE_DATA_FIL = 'filDArianne';
    const children: ActivatedRouteSnapshot[] = route.children;

    if (children.length === 0) {
      return filDArianne;
    }

    for (const child of children) {
      if (!child.data.hasOwnProperty(ROUTE_DATA_FIL)) {
        // recursif
        return this.getFil(child, url, filDArianne);
      }
      for (const fil of child.data[ROUTE_DATA_FIL]) {
        let append = true;
        if (!!fil.url) {
         if (fil.url.includes(':') || fil.url.includes('?')) {
            fil.url.split('/').forEach((part) => {
              if (part.startsWith(':')) {
                url += `/${decodeURIComponent(child.paramMap.get(part.slice(1)))}`;
                fil.label = decodeURIComponent(child.paramMap.get(part.slice(1)));
              } else if (part.startsWith('?')) {
                const queryParam = child.queryParamMap.get(part.slice(1));
                if (!queryParam) {
                  append = false;
                } else {
                  fil.label = fil.label.replace('?', queryParam);
                }
              } else {
                url += `/${part}`;
              }
            })
          }else {
            url += `/${fil.url}`;
          }
        }

        if (append) {
          this.title.addTitle(fil.label);
          filDArianne.push({
            label: fil.label,
            url: fil.guarded ? null : url
          });
        }
      }

      return this.getFil(child, url, filDArianne);
    }
    return filDArianne;
  }

  // Remplissage de la liste des Categories a afficher en hover du fil d'arianne

  enterItem(url) {
    if (url != null) {
      this.showList = true;
      this.chemin = url.slice(1).split('/');
      if(this.chemin[0] === 'catalogue'){
        const niveau = this.chemin.length;
        this.listCatDyn = [];
        if (niveau === 1) {
          this.listCatDyn = [];
          this.catalogueService.listCat.forEach((value, key: string[]) => {
            this.listCatDyn.push(key);
          });
        }
        if (niveau === 2) {
          this.listCatDyn = [];
          this.catalogueService.listCat.forEach((value, key: string[]) => {
            if (key[1] === this.chemin[1]) {
              value.forEach((value, key: string) => {
                this.listCatDyn.push(key);
              });
            }
          });
        }
        if (niveau === 3) {
          this.listCatDyn = [];
          this.catalogueService.listCat.forEach((value, key: string[]) => {
            if (key[1] === this.chemin[1]) {
              value.forEach((value, key) => {
                if (key[1] === this.chemin[2]) {
                  value.forEach((value, key: string) => {
                    this.listCatDyn.push(key);
                  });
                }
              });
            }
          });
        }
      }
    }
  }

  unique(url) {
    const chemin = url.slice(1).split('/');
    const niveau = chemin.length;
    if (this.catalogueService.listCat.get(chemin[1]) != null && niveau === 3) {
      return this.catalogueService.listCat.get(chemin[1]).get(chemin[2]).length === 0;
    } else {
      return false;
    }
  }

  protected readonly faHome = faHome;
  protected readonly faChevronRight = faChevronRight;
}
