import {Component, HostListener, OnInit, ViewEncapsulation} from '@angular/core';
import {FormBuilder, FormControl} from "@angular/forms";
import {takeUntil, tap} from "rxjs/operators";
import {WindowService} from "@services/window.service";
import {Router} from "@angular/router";
import {Observable, Subject} from "rxjs";
import {PageEvent} from "@angular/material/paginator";
import {RmaService} from "@services/rma.service";
import {Filtre} from "@/models";
import {environment} from "@env/environment";

interface PageObject {
  length: number;
  pageIndex: number;
  pageSize: number;
  previousPageIndex: number;
}

@Component({
  encapsulation: ViewEncapsulation.None,
  selector: 'app-retour',
  templateUrl: './retour.component.html',
  styleUrls: ['./retour.component.scss']
})
export class RetourComponent implements OnInit {

  quant: number;

  // liste des période permettant le tri
  historiqueList = ['sur tout l\'historique', 'dans les 6 derniers mois'];

  // variable de recupération des annees des pdifférentes commandes
  anneeHistorique = new Set();

  // par défaut, on selectionne 'dans les 6 derniers mois'
  selectedHisto = this.historiqueList[0];

  // liste des marques dont ACTN ne gère pas le RMA
  listMarque = ['D-LINK', 'NITRAM', 'SEAGATE', 'SOPHOS', 'SONICWALL', 'WESTERN-DIGITAL', 'ZYXEL'];

  /*
    produitsList -> totalité des produits
    produitsListTemps -> produits filtré par période
    produitsListAffich -> produits filtré par les autres filtres
    nbProduitsTemp -> nombre de produits dans la list temp
    nbProduitsAffiche -> nombre de produits dans la list affiche
  */
  produitsList = [];
  produitsListTemp = [];
  produitsListAffich = [];
  nbProduitsTemp = 0;
  nbProduitsAffich = 0;

  /*
    disableList -> gère l'etat (actif ou non) des checkboxes
    checkList -> gère l'etat (coché ou non) des checkboxes
    numberList -> active la position du bouton de retour
    cadreDetails -> active l'affichage des détails des produits
  */
  disableList: Array<boolean>;
  checkList: Array<boolean>;
  numberList: Array<boolean>;
  cadreDetails: Array<boolean>;

  /*
    noserieActive -> position du bouton quand il y a plusieurs numéros de série
    indexActif -> index du produit selectionné (presence d'un bouton retour à cet index)
    serieList -> liste des numéros de série choisis par l'utilisateur
  */
  noserieActive: string;
  indexActif = 3000;
  serieList: Array<string> = [];

  /*
    textBtn -> text présent dans le bouton
    showFiltres -> active l'affichage des filtres
    environment -> acces aux variables d'environnement
  */
  textBtn = 'Retourner le produit';
  showFiltres = true;
  environment = environment;
  windowScrolled = false;
  windowScrolledHisto: boolean;

  /*
    filtres$ -> observable des filtres récupérés dans le service
    filtreMarque -> filtre de marque
    filtresForm -> form builder gérant les form field des filtres
    filtreRef, filtreNoSerie, filtreEAN -> chaine de caractère tapée par l'utilisateur dans le champ filtre correspondant
  */
  filtres$: Observable<Array<Filtre>>;
  filtreMarque: Filtre;
  filtresForm = this.fb.group({});
  filtreRef: string;
  filtreNoSerie = '';
  filtreEAN: string;

  /*
    aideProduitRef -> chaine de caractère qui contient l'aide pour les références produits
    aideNoSerie -> chaine de caractère qui contient l'aide pour les numéros de série
    aideEAN -> chaine de caractère qui contient l'aide pour les numéros EAN
    aideProduitNonValide -> chaine de caractère qui contient l'aide pour les produits non valide
  */
  aideProduitRef = '';
  aideNoSerie = '';
  aideEAN = '';
  aideProduitNonValide = '';

  selectedTri: [string, string] = ['N° de BL', 'desc'];

  // MatPaginator Inputs
  pageSize = 50;
  pageSizeOptions: number[] = [30, 50, 100];
  pageIndex = 0;
  trouvSerie = false;

  // MatPaginator Output
  pageEvent: PageEvent;

  private _destroy$ = new Subject<void>(); // permet d'unsubscribe tout le monde

  /*
    _filtreRef$, _filtreNoSerie$, _filtreEAN$ -> averti l'observable lors d'un changement de valeur dans le champ filtre correspondant
  */
  private _filtreRef$ = new Subject<string>();
  private _filtreNoSerie$ = new Subject<string>();
  private _filtreEAN$ = new Subject<string>();

  private _curPageObj: PageObject = {
    length: 0,
    pageIndex: 0,
    pageSize: 0,
    previousPageIndex: 0
  };

  constructor(
    private router: Router,
    private rmaService: RmaService,
    private fb: FormBuilder,
    private window: WindowService
  ) { }

  ngOnInit(): void {
    this.rmaService.clearForm();
    this.getServerData(null);
    this.rmaService.switchPag(this._curPageObj);

    if (!this.rmaService.getID()) {
      this.rmaService.chargerProduits().asObservable()
        .pipe(takeUntil(this._destroy$)).subscribe(() => {
        this.produitsList = this.rmaService.getProduitList();
        this.produitsList.forEach(element => {
          this.anneeHistorique.add(element.datecommande.slice(6));
        });
        this.anneeHistorique.forEach(element => this.historiqueList.push('en 20' + element));
        this.filter(this.historiqueList[0]);

        // affichage des produits renvoyé par la fonction filter dès le premier chargement de la page
        this.produitsListAffich = this.produitsListTemp;

        // initialisation des différentes listes suivant la taille dela liste des produits
        this.cadreDetails = new Array(this.produitsListTemp.length);
        this.numberList = new Array(this.produitsListTemp.length);
        this.checkList = new Array(this.produitsListTemp.length);
        this.disableList = new Array(this.produitsListTemp.length);
        this.quant = 1;
      });
    } else {
      this.produitsList = this.rmaService.getProduitList();
      this.produitsList.forEach(element => {
        this.anneeHistorique.add(element.datecommande.slice(6));
      });
      this.anneeHistorique.forEach(element => this.historiqueList.push('en 20' + element));
      this.filter(this.historiqueList[0]);

      // affichage des produits renvoyé par la fonction filter dès le premier chargement de la page
      this.produitsListAffich = this.produitsListTemp;

      // initialisation des différentes listes suivant la taille dela liste des produits
      this.cadreDetails = new Array(this.produitsListTemp.length);
      this.numberList = new Array(this.produitsListTemp.length);
      this.checkList = new Array(this.produitsListTemp.length);
      this.disableList = new Array(this.produitsListTemp.length);
      this.quant = 1;
    }

    this.chargerAide(); // appelle la fonction qui fait le lien avec les autres fonctions d'aide

    // création des 3 observables de filtres
    this._filtreRef$.asObservable()
      .pipe(takeUntil(this._destroy$))
      .subscribe(ref => {
        this.filtreRef = ref;
        this.filtrerProduits();
      });

    this._filtreNoSerie$.asObservable()
      .pipe(takeUntil(this._destroy$))
      .subscribe(noSerie => {
        this.filtreNoSerie = noSerie;
        this.scrollSerie();
      });

    this._filtreEAN$.asObservable()
      .pipe(takeUntil(this._destroy$))
      .subscribe(ean => {
        this.filtreEAN = ean;
        this.filtrerProduits();
      });
  }

  // implémentation du ngOnDestroy pour unsubscribe et detruire les listes de produits
  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
    this.produitsList = [];
    this.produitsListTemp = [];
    this.produitsListAffich = [];
  }

  // appelle les fonctions qui font le lien avec le php
  chargerAide(): void {
    this.rmaService.chargerAideProduitRef().subscribe(data => { this.aideProduitRef = data; });
    this.rmaService.chargerAideNoSerie().subscribe(data => { this.aideNoSerie = data; });
    this.rmaService.chargerAideEAN().subscribe(data => { this.aideEAN = data; });
    this.rmaService.chargerAideProduitNonValide().subscribe(data => { this.aideProduitNonValide = data; });
  }

  // appelé uniquement par la fonction filter, elle definit les filtres et leurs options
  majFiltres(): void {
    this.filtres$ = this.rmaService.getFiltres()
      .pipe(takeUntil(this._destroy$),
        tap((filtres: Array<Filtre>) => {
          this.filtreMarque = filtres.find((filtre: Filtre) => filtre.target === 'marque');
          filtres.forEach((filtre: Filtre) => {
            this.filtresForm.addControl(filtre.target as string, new FormControl(''));
            const dernierFiltre = this.filtresForm.get(filtre.target as string);
            dernierFiltre.setValue([]);
            dernierFiltre.valueChanges.pipe(takeUntil(this._destroy$)).subscribe(() => this.filtrerProduits());
          });
        }));
  }

  // affichage des détails produits lors du clic sur la div détails
  montrerDetails(index: number): void {
    this.cadreDetails[index] = !this.cadreDetails[index];
  }

  // fonction qui deselectionne les checkbox et rend la selection des autres possible lors du clic sur le bouton 'Tout deselectionner'
  deselectionner(): void {
    this.checkList.fill(false);
    this.disableList = new Array(this.produitsListTemp.length);
    this.indexActif = 3000;
    this.serieList = [];
    this.numberList = new Array(this.produitsListTemp.length);
    this.noserieActive = '1';
    this.textBtn = 'Retourner le produit';
    this.quant = 1;
  }

  quantChange(event) {
    this.quant = parseInt(event);
  }

  /*
    fonction qui deselectionne les checkbox et rend la selection des autres possible lors du clic
    sur une checkbox dejà checké ou lors de la non selection de numéros de série sur un type de produit possédant plusieurs numéros de série
   */
  deselectionner2(index: number): void {
    this.checkList.fill(false, 0, index);
    this.checkList.fill(false, index + 1);
    this.disableList = new Array(this.produitsListTemp.length);
    this.indexActif = 3000;
    this.serieList = [];
    this.numberList[index] = false;
    this.noserieActive = '1';
    this.quant = 1;
    this.textBtn = 'Retourner le produit';
  }

  /*
    selectionne le produit, desactive la selection des autres produits et affiche le bouton de retour lors de la selection
    d'un type de produit avec 1 ou 0 numéro de série
  */
  selectionner(index: number, quantite: number): void {
    if (!this.disableList[index]) {
      if (index === this.indexActif) {
        this.deselectionner2(index);
      } else {
        this.quant = quantite;
        this.numberList[index] = true;
        this.indexActif = index;
        this.checkList = new Array(this.produitsListTemp.length);
        this.disableList.fill(true);
        this.disableList[index] = false;
      }
    }
  }

  /*
    selectionne le numéro de série, desactive la selection des autres produits et affiche le bouton de retour lors de la selection
    d'un type de produit avec plusieurs numéros de série
  */
  selectionner2(index: number, serie: string): void {
    if (!this.disableList[index]) {
      if (index === this.indexActif) {
        // si c'est le dernier numéro de série, on deselectionne le produit actif
        if (this.serieList.length === 1 && this.serieList[0] === serie) {
          this.deselectionner2(index);
          // si le numéro de série est déjà selectionné, on le deselectionne sans deselectionner le produit
        } else if (this.serieList.includes(serie)) {
          const indexTemp = this.serieList.indexOf(serie);
          if (indexTemp > -1) {
            this.serieList.splice(indexTemp, 1);
            if (this.serieList.length > 1) {
              this.textBtn = 'Retourner les produits';
            } else {
              this.textBtn = 'Retourner le produit';
            }
          }
          if (serie === this.noserieActive) {
            this.noserieActive = this.serieList[0];
          }
          // sinon on ajoute le numéro de série à la liste
        } else {
          this.serieList.push(serie);
          if (this.serieList.length > 1) {
            this.textBtn = 'Retourner les produits';
          } else {
            this.textBtn = 'Retourner le produit';
          }
        }
        // selection du produit et affichage du bouton
      } else {
        this.noserieActive = serie;
        this.numberList[index] = true;
        this.indexActif = index;
        this.checkList = new Array(this.produitsListTemp.length);
        this.disableList.fill(true);
        this.disableList[index] = false;
        this.serieList.push(serie);
      }
    }
  }

  // vérifie que le produit peut être encore retourné
  valideRMA(produit: any): boolean {
    return (produit.autorma === 'O');
  }

  // changement de page lors du clic sur le bouton "retourner le produit"
  selectProduit(produit: any): void {
    if (produit.quantite >= this.serieList.length && produit.quantite >= this.quant) {
      this.rmaService.setProduit(produit, this.serieList, this.quant);
      this.router.navigate(['/espace-client/confirmation-retour']);
    }
  }

  // permet de cacher les filtres au clic sur le bouton filtre
  onFiltresTogglePressed(event: any): void {
    if (!event.srcEvent) {
      this.showFiltres = !this.showFiltres;
    }
  }

  // fonction qui gère le filtre de période et qui appelle les autres filtres
  filter(histo: string): void {
    this.nbProduitsTemp = 0;
    this.produitsList = this.rmaService.getProduitList();
    if (histo === 'dans les 6 derniers mois') { // commande des 6 derniers mois
      const today = new Date();
      const month = this.mod((today.getMonth() - 5), 12); // utilisation de la fonction modulo
      const day = today.getDate();
      let year: string | number;
      if (today.getMonth() - 5 > 0) {
        year = today.getFullYear();
      } else {
        year = today.getUTCFullYear() - 1;
      }
      const past = new Date(month + '/' + day + '/' + year);
      this.produitsListTemp = this.produitsList.filter(element => new Date(this.rmaService.formatageDate(element.datecommande)) > past);
    } else if (histo === 'sur tout l\'historique') {
      this.produitsListTemp = this.produitsList;
    } else {
      this.produitsListTemp = this.produitsList.filter(element =>
        new Date(this.rmaService.formatageDate(element.datecommande)) > new Date('01/01/' + histo.slice(3)) &&
        new Date(this.rmaService.formatageDate(element.datecommande)) < new Date('01/01/' + this.anneePlusUn(histo.slice(3))));
    }
    this.produitsListTemp.forEach(element => this.nbProduitsTemp += parseInt(element.quantite));
    this.nbProduitsAffich = this.nbProduitsTemp;
    this.rmaService.chargerMarques(this.produitsListTemp); // rempli les options de marques
    this.majFiltres(); // filtre les produits (autres filtres que période)
  }

  // fonction qui permet de renvoyer l'année suivante de celle donnée en paramètre
  anneePlusUn(annee: string): string {
    const entier = parseInt(annee) + 1;
    return entier.toString();
  }

  // fonction qui permet de calculer le module
  mod(chiffre: number, n: number): number {
    return ((chiffre % n) + n) % n;
  }

  // ajoute un a la quantité
  plusUn(quantite: number): void {
    if (this.quant < quantite) {
      this.quant += 1;
    }
  }

  // retire un a la quantité
  moinsUn(): void {
    if (this.quant > 1) {
      this.quant -= 1;
    }
  }

  // renvoie la taille approprié à l'option de la période
  getWidth(): string {
    if (this.selectedHisto === 'dans les 6 derniers mois') {
      return '200px';
    } else if (this.selectedHisto === 'sur tout l\'historique') {
      return '140px';
    } else {
      return '85px';
    }
  }

  /**
   * indique si un produit doit être filtré selon la référence produit à rechercher
   * ET sa désignation
   */
  filtrerRef(produit: any): boolean {
    if (!!this.filtreRef) {
      return produit.produit.toUpperCase().includes(this.filtreRef.toUpperCase())
        || produit.designation.toUpperCase().includes(this.filtreRef.toUpperCase());
    }
    return true;
  }

  // fonctions qui retourne la chaine de caractère contenant l'aide correspondante
  chargerAideProduitRef(): string {
    return this.aideProduitRef;
  }

  chargerAideNoSerie(): string {
    return this.aideNoSerie;
  }

  chargerAideEAN(): string {
    return this.aideEAN;
  }

  chargerAideProduitNonValide(): string {
    return this.aideProduitNonValide;
  }

  // indique si un produit doit être filtré selon le numéro de série à rechercher
  filtrerNoSerie(): string {
    this.trouvSerie = false;
    let id = '';
    for (const produit of this.produitsListAffich) {
      if (!!this.filtreNoSerie) {
        if (produit.noserie && produit.quantite > 1) {
          for (const noserie of produit.noserie) {
            if (noserie.toUpperCase().includes(this.filtreNoSerie.toUpperCase())) {
              if (this.pageIndex !== Math.trunc(this.produitsListAffich.indexOf(produit) / this.pageSize)) {
                this.deselectionner();
              }
              const page: PageObject = {
                length: this.produitsListAffich.length,
                pageIndex: Math.trunc(this.produitsListAffich.indexOf(produit) / this.pageSize),
                pageSize: this.pageSize,
                previousPageIndex: this.pageIndex
              };
              this.rmaService.switchPag(page);
              this.pageIndex = Math.trunc(this.produitsListAffich.indexOf(produit) / this.pageSize);
              return id = (this.produitsListAffich.indexOf(produit) % this.pageSize) + ':' + produit.noserie.indexOf(noserie);
            }
          }
        } else {
          if (produit.noserie.toUpperCase().includes(this.filtreNoSerie.toUpperCase())) {
            if (this.pageIndex !== Math.trunc(this.produitsListAffich.indexOf(produit) / this.pageSize)) {
              this.deselectionner();
            }
            const page: PageObject = {
              length: this.produitsListAffich.length,
              pageIndex: Math.trunc(this.produitsListAffich.indexOf(produit) / this.pageSize),
              pageSize: this.pageSize,
              previousPageIndex: this.pageIndex
            };
            this.rmaService.switchPag(page);
            this.pageIndex = Math.trunc(this.produitsListAffich.indexOf(produit) / this.pageSize);
            return id = (this.produitsListAffich.indexOf(produit) % this.pageSize) + ':0';
          }
        }
      }
    }
    if (!!this.filtreNoSerie) {
      this.trouvSerie = true;
    }
    return id;
  }

  scrollSerie() {
    const id = this.filtrerNoSerie();
    if (id !== '') {
      setTimeout(
        () => {

        }, 0);
    }
  }

  // indique si un produit doit être filtré selon le numéro EAN à rechercher
  filtrerEAN(produit: any): boolean {
    if (!!this.filtreEAN) {
      return produit.produit.toUpperCase().includes(this.filtreEAN.toUpperCase());
    }
    return true;
  }

  // fonction appelé par le html qui déclenche les autres fonction permettant le filtre sur la référence
  rechercheRef(event: any): void {
    this._filtreRef$.next(event);
  }

  // fonction appelé par le html qui déclenche les autres fonction permettant le filtre sur le numéro de série
  rechercheNoSerie(event: any): void {
    this._filtreNoSerie$.next(event);
  }

  // fonction appelé par le html qui déclenche les autres fonction permettant le filtre sur le numéro EAN
  rechercheEAN(event: any): void {
    this._filtreEAN$.next(event);
  }

  resetFiltersRef(): void {
    this.filtreRef = '';
    this.rechercheRef('');
  }

  resetFiltersSerie(): void {
    this.filtreNoSerie = '';
    this.rechercheNoSerie('');
  }

  resetFilters(target: string): void {
    this.filtresForm.controls[target].setValue([]);
  }

  resetAllFilters(): void {
    this.resetFiltersRef();
    this.resetFiltersSerie();
    this.resetFilters('marque');
  }

  // fonction permettant de renvoyer le début du mot avant l'apparition de la recherche
  start(mot: string) {
    // verification de la recherche présente dans le mot
    if (mot.includes(this.filtreNoSerie.toUpperCase())) {
      // découpage du mot pour ne renvoyer que le début (avant l'occurence de la recherche)
      return mot.slice(0, mot.indexOf(this.filtreNoSerie.toUpperCase(), 0));
    }
    else {
      // si la recherche n'est pas dans le mot (cas possible que lors d'une recherche reference/deignation),
      // la fonction start renvoie le mot et la fonction end renvoie la chaine vide afin de ne pas avoir de modification du mot
      return mot;
    }
  }

  // meme fonction qui permet de renvoyer la fin du mot
  end(mot: string) {
    if (mot.includes(this.filtreNoSerie.toUpperCase())) {
      return mot.slice(mot.indexOf(this.filtreNoSerie.toUpperCase(), 0) + this.filtreNoSerie.length);
    }
    else {
      // si la recherche n'est pas dans le mot (cas possible que lors d'une recherche reference/deignation),
      // la fonction start renvoie le mot et la fonction end renvoie la chaine vide afin de ne pas avoir de modification du mot
      return '';
    }
  }

  // fonction appelé lors du clic sur un logo de marque et qui permet le filtre de cette marque
  filtreMarqueToggle(option: string): void {
    const filtreMarque = this.filtresForm.get(['marque']);
    if (!filtreMarque.value.find((_option: string) => _option === option)) {
      filtreMarque.setValue(filtreMarque.value.filter((v: string) => v !== option));
    } else {
      filtreMarque.setValue(filtreMarque.value.concat(option));
    }
  }

  /*
    fonction principale des filtres qui appelle les validators et autre fonction de filtre
    et renvoie la liste de produits filtrés à afficher
  */
  filtrerProduits(): void {
    setTimeout(() => {
      this.deselectionner();
      this.cadreDetails = new Array(this.produitsListTemp.length);
      this.nbProduitsAffich = 0;
      this.produitsListAffich = this.produitsListTemp;
      for (const filtreName of Object.keys(this.filtresForm.controls)) {
        const filtreForm = this.filtresForm.get(filtreName);
        if (filtreForm.value.length > 0) {
          this.produitsListAffich = this.produitsListAffich.filter(produit => {
            return filtreForm.value.includes(produit[filtreName]);
          });
        }
      }
      const page: PageObject = {
        length: this.produitsListAffich.length,
        pageIndex: 0,
        pageSize: this.pageSize,
        previousPageIndex: this.pageIndex
      };
      this.pageIndex = 0;
      this.rmaService.switchPag(page);
      this.produitsListAffich = this.trierProduits(this.produitsListAffich.filter(produit =>
        this.filtrerRef(produit) && this.filtrerEAN(produit)));
      this.produitsListAffich.forEach(element => this.nbProduitsAffich += parseInt(element.quantite));
    }, 0);
  }

  /**
   * Trie les produits selon l'état du bandeau.
   */
  trierProduits(produits: Array<any>): Array<any> {
    switch (this.selectedTri[0]) {
      case 'Marque':
        produits = this.tri(produits, 'marque');
        break;
      case 'Réf. produit':
        produits = this.tri(produits, 'produit');
        break;
      case 'N° de BL':
        produits = this.tri(produits, 'numbl');
        break;
      case 'N° de série':
        produits = this.tri(produits, 'noserie');
        break;
      case 'Fin de garantie':
        produits = this.tri(produits, 'garantiedatefin');
        break;
      case 'Qte':
        produits = this.tri(produits, 'quantite');
        break;
    }
    return produits;
  }

  /**
   * Tri les produits selon un attribut
   * @param produits La liste des produits à trier
   * @param target L'attribut sur lequel on veut trier
   */
  tri(produits: Array<any>, target: string): Array<any> {
    if (produits.length <= 1) {
      return produits;
    }
    else if (typeof produits[0][target] === 'string') {
      switch (this.selectedTri[1]) {
        case 'asc':
          return produits.sort((l1, l2) => l1[target].localeCompare(l2[target]));
        case 'desc':
          return produits.sort((l1, l2) => -l1[target].localeCompare(l2[target]));
        case 'off':
          return produits;
      }
      return [];
    } else {
      switch (this.selectedTri[1]) {
        case 'asc':
          return produits.sort((l1, l2) => l1[target].valueOf() === l2[target].valueOf() ? 0 : l1[target] > l2[target] ? 1 : -1);
        case 'desc':
          return produits.sort((l1, l2) => l1[target].valueOf() === l2[target].valueOf() ? 0 : l1[target] < l2[target] ? 1 : -1);
        case 'off':
          return produits;
      }
      return [];
    }
  }

  /**
   * Déclenche le tri des éléments quand un des éléments du bandeau est cliqué.
   * @param event L'élément du bandeau qui a été cliqué
   */
  onTri(s: string): void {
    if (s === this.selectedTri[0]) {
      switch (this.selectedTri[1]) {
        case 'off':
          this.selectedTri[1] = 'asc';
          break;
        case 'asc':
          this.selectedTri[1] = 'desc';
          break;
        case 'desc':
          this.selectedTri[1] = 'asc';
          break;
        default:
          this.selectedTri[1] = 'off';
          break;
      }
    } else {
      this.selectedTri[0] = s;
      this.selectedTri[1] = 'asc';
    }
    this.filtrerProduits();
  }

  selected(s: string): string {
    return this.selectedTri[0] === s ? this.selectedTri[1] : 'off';
  }

  getServerData(event?: PageEvent) {
    if (event) {
      this.pageIndex = event.pageIndex;
      this.pageSize = event.pageSize;
      this.deselectionner();
      this.scrollToTop();
      this.rmaService.switchPag(event);
    }
    return event;
  }

  @HostListener("window:scroll", [])
  onWindowScroll() {
    if (this.window.pageYOffset > 230) {
      this.windowScrolledHisto = this.windowScrolled;
      //  this.windowScrolled = true;
    }else if(this.window.pageYOffset < 230){
      this.windowScrolledHisto = this.windowScrolled;
      //this.windowScrolled = false
    }
  }




  scrollToTop() {


    const start = Date.now();
    this.windowScrolled = null;
    const animation = setInterval(() => {
      const timePassed = Date.now() - start;
      if (timePassed >= 500) {

        this.window.scrollTo(0, 0);
        this.windowScrolled = null
        clearInterval(animation);
      } else {


        const currentScroll = this.window.scrollY;
        this.window.scrollTo(0, currentScroll - (currentScroll * (timePassed / 500)));
      }
    }, 16.6);
  }

}
