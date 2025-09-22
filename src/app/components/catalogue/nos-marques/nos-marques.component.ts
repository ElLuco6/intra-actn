import {Component, ElementRef, NgZone, OnDestroy, OnInit, QueryList, ViewChild, ViewChildren} from '@angular/core';
import {environment} from "@env/environment";
import {WindowService} from "@services/window.service";
import {CatalogueService} from "@services/catalogue.service";

import {take, takeUntil} from 'rxjs/operators';
import {Subject} from 'rxjs';
import {BreakpointObserver} from '@angular/cdk/layout';
import {BanniereComponent} from "../../banniere/banniere.component";
import {Router} from '@angular/router';

@Component({
    selector: 'app-nos-marques',
    templateUrl: './nos-marques.component.html',
    styleUrls: ['./nos-marques.component.scss']
})
export class NosMarquesComponent implements OnInit, OnDestroy {

  @ViewChild('marqueSelected') marqueSelectedElement: ElementRef;
  //@ViewChildren(BanniereComponent) bannieres: QueryList<BanniereComponent>;

  /** Variable contenant un regroupement de variables d'environement vitales au site */
  environment = environment;
  /** Listes de toutes les marques récupérée */
  marques: Array<[string, string]>;

  /** Listes map de toutes les marques */
  private _marques = new Map<string, string>();
  /** Observable de nettoyage, déclanchée à la destruction du composant */
  private _destroy$ = new Subject<void>();
  private _loop = -1;
  private _timeout = -1;

  /** Tableau de toute les marques pour pouvoir revnir en arrière sur les filtre */
  fullMarques: Array<[string,string]>;

  /** Marque selectionnée */
  marquePicked = '';
  /**
   * Index de la marque selectionnée
   * initialisé à -1 quand aucune marque n'est selectionnée
   */
  indexMarquePicked = -1;
  /** Tableau "à étages" contenant les unes dans les autres, les catégories et sous catégories des marques
   * @example
   *  [{
            "marque": "DRAK",
            "marquelib": "DRAKA",
            "sub": [{
                "id": "CAB",
                "label": "Câblage",
                "photo": "60039572",
                "sub": [
                    { "id": "CBL",
                    "label": "Câbles",
                    "photo": "60039572" },
                    { "id": "FO",
                    "label": "Fibre Optique",
                    "photo": "60018767",
                    "sub": [{ "id": "CAB", "label": "Câbles FO", "photo": "60018767" }] }
                ]
            }]
        }, {}, {}, ...]
   */
  categoriesParMarques: [] = [];
  /** Nombre de case de marque par ligne */
  nbMarqueParLigne = 8;
  /** Nombre de colones de catégories et sous-catégories max */
  colonnesMax = 5;
  /** Liste des premières lettres de chaque marque
   * Utilisée ensuite pour créer une barre de sauts à chaques lettres */
  firstLetters: Map<string, string> = null;

  btnVoir = false;
  hideBtn = true
  constructor(
    private catalogueService: CatalogueService,
    private breakpointObserver: BreakpointObserver,
    private ngZone: NgZone,
    private window: WindowService,
    private router: Router
  ) { }

  /** Initialisation de NosMarquesComponent */
  ngOnInit(): void
  {
    this.breakpointObserver
      .observe(['(min-width: 1650px)', '(min-width: 900px) and (max-width: 1300px)', '(max-width: 900px)'])
      .pipe(takeUntil(this._destroy$))
      .subscribe(breakpoints => {
        if (breakpoints.breakpoints['(min-width: 1650px)']) {
          this.nbMarqueParLigne = 8;
          this.colonnesMax = 5;
        } else if (breakpoints.breakpoints['(min-width: 900px) and (max-width: 1300px)']) {
          this.nbMarqueParLigne = 6;
          this.colonnesMax = 3;
        } else if (breakpoints.breakpoints['(max-width: 900px)']) {
          this.nbMarqueParLigne = 5;
          this.colonnesMax = 2;
        } else {
          this.nbMarqueParLigne = 7;
          this.colonnesMax = 4;
        }
        this.window.setTimeout(() => this.onResize());
      });

    this.catalogueService.setFilArianne(false);

    this.catalogueService.getCategoriesByMarques()
      .pipe(take(1))
      .subscribe(
        (ret) => {


          Object.values(ret).forEach(marque => {


            if (marque['marque']) {
              this._marques.set(marque['marquelib'], marque['marque']);
            }

          });
          this.categoriesParMarques = ret;
          this.window.setTimeout(
            () =>
            {
              this.marques = Array.from(this._marques).sort((m1, m2) => m1[0].localeCompare(m2[0]))
              // liste des premières lettres des marques et premières marque par lettre
              let firstCharsSet: Map<string, string> = new Map<string, string>();
              this.marques.forEach(marque => {
                if (marque[0] && (!firstCharsSet.get(marque[0][0])) ) {
                  firstCharsSet.set(marque[0][0], marque[0].replace(/\s/g, ''));
                }
              });

              this.firstLetters = firstCharsSet;
              this.fullMarques = this.marques;
              this.hideBtn = false
            }
          );
        },
        (error) => {
          console.error('Erreur dans NosMarques.component, sur la requete \'ListeCategorieMarque.php\' :', error);
        }
      );

  }

  /*function de rediction a appeler si l'url de la marque n'est pas vide  */
  redirect(url){
    window.open(url, '_blank');
  }


  /** Destruction de NosMarquesComponent */
  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
    this.catalogueService.setFilArianne(true);
  }

  /** Active/désactive la séléction d'une marque et ferme/ouvre ses catégories */
  toggleMarquePicked(marque: string, index: number): void {

    if (this.marquePicked === marque) {


      this.closeMarque();
    } else {
      this.closeMarque();
      this.marquePicked = marque;
      this.indexMarquePicked = index;
      this.window.setTimeout(() => this.adjustCategoriesMarqueTop(index));
    }
  }

  /** Ferme les div des catégories des marques */
  closeMarque(): void {
    this.window.clearInterval(this._loop);
    this.window.clearTimeout(this._timeout);
    const categories = document.querySelector('.categoriesMarque.show') as HTMLElement;
    categories?.style.setProperty('max-height', `0px`);
    this.marquePicked = '';
    this.indexMarquePicked = -1;
  }

  adjustCategoriesMarqueTop(index: number): void {
    this.ngZone.runOutsideAngular(() => {
      const marque = document.querySelector('.marqueSelected') as HTMLElement;
      const categories = document.querySelector('.categoriesMarque.show') as HTMLElement;


      /*if (this.bannieres.find(banniere => banniere.marques.includes(this.marquePicked)).affichage) {
        categories.style.setProperty('max-height', `550px`);
      } else {
        categories.style.setProperty('max-height', `400px`);
      }*/
      categories.style.setProperty('top', `${110 * (Math.floor(index / this.nbMarqueParLigne) + 1) + Math.floor(index / this.nbMarqueParLigne) * 20}px`);
      this._loop = this.window.setInterval(() => {
        marque.style.setProperty('max-height', `${110 + categories.getClientRects()[0].top}px`);
        marque.style.setProperty('height', `${110 + categories.getClientRects()[0].top}px`);
      });
      this._timeout = this.window.setTimeout(() => {
        this.window.clearInterval(this._loop);
        marque.style.setProperty('max-height', `${110 + categories.getClientRects()[0].top}px`);
        categories.style.setProperty('max-height', `${categories.getClientRects()[0].top}px`);
        marque.style.setProperty('height', `${110 + categories.getClientRects()[0].top}px`);
      }, 1);


    });
  }

  /** Réajuste le DOM quand on resize la page */
  onResize(): void {
    this.ngZone.runOutsideAngular(() => {
      if (this.indexMarquePicked !== -1) {
        const categories = document.querySelector('.categoriesMarque.show') as HTMLElement;
        categories.style.setProperty('top', `${110 * (Math.floor(this.indexMarquePicked / this.nbMarqueParLigne) + 1) + Math.floor(this.indexMarquePicked / this.nbMarqueParLigne) * 20}px`);
      }
    });
  }

  /** Renvois l'index de la marque selectionnée
   * @param marqueStr Nom de la marque selectionnée
   * @returns Renvois l'index dans de la marque selectionnée
   */
  indexOfMarquePicked(marqueStr: string): number {
    const parseArr = Object.keys(this.categoriesParMarques);
    parseArr.splice(0, 1);
    for (let i = parseArr.length - 1; i >= 0; i--) {
      if (parseArr[i] == marqueStr) { return (i); }
    }
    return (-1);
  }

  /** Calcule un nombre de colonnes d'affichage pour une marque */
  getNbColonnesPourMarque(marque: string): string {
    const rec = (niveau, level) => {
      if (niveau.sub) {
        const s = Object.values(niveau.sub) as Array<any>;
        return s.length * level + s.reduce((acc, cur) => acc + rec(cur, level - 1), 0);
      } else {
        return 0;
      }
    };
    const nbColonnes = Math.ceil(rec(this.getCategoriesParMarques(marque), 3) / 18);
    return `${nbColonnes > this.colonnesMax ? this.colonnesMax : nbColonnes}`;
  }

  /**
   * @param marque Nom de la marque pour laquelle renvoyer ses catégories et sous-catégories
   */
  getCategoriesParMarques(marque: string): Array<unknown> {
    return this.categoriesParMarques[marque];
  }

  /**
   * Déplace la vue jusqu'à l'élément souhaité.
   * @param anchor Le nom de la vue vers laquelle se déplacer
   */
  jumpToAnchor(anchor: string): void
  {
    anchor = anchor.replace(/\s/g, '');
    let targetDiv = document.querySelector('#' + anchor);
    if (targetDiv) {
      window.scrollTo({ behavior: 'smooth', top: window.scrollY + document.querySelector('#' + anchor).getBoundingClientRect().top - 45 }); // offset of 45px towards top
    }
  }

  removeSpaces(str): string
  {
    return (str.replace(/\s/g, ''));
  }

  resetMarque(){
    this.btnVoir = false
    this.marques = this.fullMarques
  }


  removeMarque( letre:string){
    this.resetMarque()

    let nLetre=  letre.toUpperCase()
    this.marques = this.marques.filter((obj) => {
      return obj[0][0] === nLetre
    });
    this.btnVoir = true

  }

  openBlank(marque){
    const url = this.router.serializeUrl(
      this.router.createUrlTree([`/grille-tarif/`, marque])
    );

    window.open(decodeURIComponent(url), '_blank');
  }

}
