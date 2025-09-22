import {Component, Input, OnInit} from '@angular/core';
import {FormBuilder, FormControl} from "@angular/forms";
import {takeUntil, tap} from "rxjs/operators";
import {RmaService} from "@services/rma.service";
import {Observable, Subject} from "rxjs";
import {Filtre} from "@/models";
import {environment} from "@env/environment";
import {faFilePdf} from "@fortawesome/free-solid-svg-icons";
import {LogClientService} from "@services/log-client.service";

@Component({
  selector: 'app-suivi-retour',
  templateUrl: './suivi-retour.component.html',
  styleUrls: ['./suivi-retour.component.scss']
})
export class SuiviRetourComponent implements OnInit {
  @Input() numClient: number;

  historiqueList = [];

  // par défaut, on selectionne 'dans les 6 derniers mois'
  selectedHisto;

  // variable de recupération des annees des pdifférentes commandes
  anneeHistorique = new Set();

  /*
    suiviList -> totalité des suivi
    suiviListTemps -> suivi filtré par période
    suiviListAffich -> suivi filtré par les autres filtres
    nbSuiviTemp -> taille de la liste suiviListAffich
  */
  suiviList = [];
  suiviListTemp = [];
  suiviListAffich = [];
  nbSuiviTemp = 0;

  /*
    showFiltres -> active l'affichage des filtres
    environment -> acces aux variables d'environnement
  */
  showFiltres = true;
  environment = environment;

  /*
  aideProduitRef -> chaine de caractère qui contient l'aide pour les références produits
*/
  aideProduitRef = '';

  /*
    filtres$ -> observable des filtres récupérés dans le service
    filtreMarque -> filtre de marque
    filtresForm -> form builder gérant les form field des filtres
    filtreRef -> filtre sur les références
  */
  filtres$: Observable<Array<Filtre>>;
  filtreMarque: Filtre;
  filtresForm = this.fb.group({});
  filtreRef: string;
  cadreDetails: Array<boolean>;

  /*
  _filtreRef$ -> averti l'observable lors d'un changement de valeur dans le champ filtre correspondant
  */
  private _filtreRef$ = new Subject<string>();

  private _destroy$ = new Subject<void>(); // permet d'unsubscribe tout le monde

  constructor(
    private rmaService: RmaService,
    private fb: FormBuilder,
    protected authClient: LogClientService
  ) { }

  ngOnInit(): void {
    this.chargerSuivi().subscribe(() => {
      this.suiviList.forEach(element => this.anneeHistorique.add(element.daterma.slice(6)));
      this.anneeHistorique.forEach(element => this.historiqueList.push('en 20' + element));
      this.historiqueList.push('depuis la création du compte');
      this.selectedHisto = this.historiqueList[0];
      this.filter(this.historiqueList[0]);

      // affichage des suivi renvoyé par la fonction filter dès le premier chargement de la page
      this.suiviListAffich = this.suiviListTemp;
      this.cadreDetails = new Array(this.suiviList.length);
    });

    this.chargerAide(); // appelle la fonction qui fait le lien avec les autres fonctions d'aide

    // création de l'observable de filtre par reference
    this._filtreRef$.asObservable()
      .pipe(takeUntil(this._destroy$))
      .subscribe(ref => {
        this.filtreRef = ref;
        this.filtrerSuivi();
      });
  }

  // implémentation du ngOnDestroy pour unsubscribe et detruire les listes de suivi
  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
    this.suiviList = [];
    this.suiviListTemp = [];
    this.suiviListAffich = [];
    this.nbSuiviTemp = 0;
  }

  // permet de charger dans la liste les demande de rma
  chargerSuivi(): Subject<void> {
    const attente = new Subject<void>();
    this.rmaService.chargerSuivi().subscribe(
      data => {
        this.suiviList = data;
        this.suiviList = this.suiviList.filter(element => {
          return this.isValidSuivi(element);
        });
        this.suiviList.sort(this.compareDates);
        this.suiviList.forEach(element => element.marque);
        attente.next();
        attente.complete();
      },
      err => {
        console.log(err);
      },
      () => { }
    );
    return attente;
  }

  // appelle les fonctions qui font le lien avec le php
  chargerAide(): void {
    this.rmaService.chargerAideProduitRef().subscribe(data => { this.aideProduitRef = data; });
  }

  // fonctions qui retourne la chaine de caractère contenant l'aide correspondante
  chargerAideProduitRef(): string {
    return this.aideProduitRef;
  }

  // indique si un produit doit être filtré selon la référence produit à rechercher
  filtrerRef(produit: any): boolean {
    if (!!this.filtreRef) {
      return produit.produit.toUpperCase().includes(this.filtreRef.toUpperCase());
    }
    return true;
  }

  // vérifie la validité des informations envoyé par le php
  isValidSuivi(rma: any) {
    return (rma.daterma !== '' && rma.daterma !== '00/00/00');
  }

  // renvoie la taille approprié à l'option de la période
  getWidth(): string {
    if (this.selectedHisto === 'depuis la création du compte') {
      return '230px';
    } else {
      return '85px';
    }
  }

  // permet de cacher les filtres au clic sur le bouton filtre
  onFiltresTogglePressed(event: any): void {
    if (!event.srcEvent) {
      this.showFiltres = !this.showFiltres;
    }
  }

  // permet de comparer deux dates afin de les trier
  compareDates(a: any, b: any): number {
    const aFormat = a.daterma.split('/');
    const bFormat = b.daterma.split('/');
    const aBon = [aFormat[1], aFormat[0], aFormat[2]];
    const bBon = [bFormat[1], bFormat[0], bFormat[2]];
    const aOK = aBon.join('/');
    const bOK = bBon.join('/');
    const aDate = new Date(aOK);
    const bDate = new Date(bOK);
    if (aDate > bDate) {
      return -1;
    } else {
      return 1;
    }
  }

  // fonction qui gère le filtre de période et qui appelle les autres filtres
  filter(histo: string): void {
    if (histo === 'depuis la création du compte') {
      this.suiviListTemp = this.suiviList;
    } else {
      this.suiviListTemp = this.suiviList.filter(element =>
        new Date(this.rmaService.formatageDate(element.daterma)) > new Date('01/01/' + histo.slice(3)) &&
        new Date(this.rmaService.formatageDate(element.daterma)) < new Date('01/01/' + this.anneePlusUn(histo.slice(3))));
    }
    this.rmaService.chargerMarques(this.suiviListTemp); // rempli les options de marques
    this.majFiltres(); // filtre les suivi (autres filtres que période)
    this.nbSuiviTemp = this.suiviListTemp.length;
  }

  // fonction qui permet de calculer le module
  mod(chiffre: number, n: number): number {
    return ((chiffre % n) + n) % n;
  }

  // fonction qui permet de renvoyer l'année suivante de celle donnée en paramètre
  anneePlusUn(annee: string): string {
    const entier = parseInt(annee) + 1;
    return entier.toString();
  }

  // fonction appelé par le html qui déclenche les autres fonction permettant le filtre sur la référence
  rechercheRef(event: any): void {
    this._filtreRef$.next(event);
  }

  // appelé uniquement par la fonction filter, elle definit les filtres et leurs options
  majFiltres(): void {
    this.filtres$ = this.rmaService.getFiltresSuivi()
      .pipe(takeUntil(this._destroy$),
        tap((filtres: Array<Filtre>) => {
          this.filtreMarque = filtres.find((filtre: Filtre) => filtre.target === 'marque');
          filtres.forEach((filtre: Filtre) => {
            this.filtresForm.addControl(filtre.target as string, new FormControl(''));
            const dernierFiltre = this.filtresForm.get(filtre.target as string);
            dernierFiltre.setValue([]);
            dernierFiltre.valueChanges.pipe(takeUntil(this._destroy$)).subscribe(() => this.filtrerSuivi());
          });
        }));
  }

  // fonction appelé lors du clic sur un logo de marque et qui permet le filtre de cette marque
  filtreMarqueToggle(option: string): void {
    const filtreMarque = this.filtresForm.get(['marque']);
    if (!!filtreMarque.value.find((_option: string) => _option === option)) {
      filtreMarque.setValue(filtreMarque.value.filter((v: string) => v !== option));
    } else {
      filtreMarque.setValue(filtreMarque.value.concat(option));
    }
  }

  /*
  fonction principale des filtres qui appelle les validators et autre fonction de filtre
  et renvoie la liste de suivi filtrés à afficher
  */
  filtrerSuivi(): void {
    setTimeout(() => {
      this.suiviListAffich = this.suiviListTemp;
      for (const filtreName of Object.keys(this.filtresForm.controls)) {
        const filtreForm = this.filtresForm.get(filtreName);
        if (filtreForm.value.length > 0) {
          this.suiviListAffich = this.suiviListAffich.filter(suivi => {
            return filtreForm.value.includes(suivi[filtreName]);
          });
        }
      }
      this.suiviListAffich = this.suiviListAffich.filter(suivi =>
        this.filtrerRef(suivi));
    }, 0);
  }

  // affichage des détails produits lors du clic sur la div détails
  montrerDetails(index: number): void {
    this.cadreDetails[index] = !this.cadreDetails[index];
  }


  protected readonly faFilePdf = faFilePdf;
}
