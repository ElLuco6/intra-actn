import {Component, ElementRef, Input, OnInit, Renderer2, ViewChild} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {environment} from "@env/environment";
import {take} from "rxjs/operators";
import {ProduitService} from "@services/produit.service";
import {CurrencyPipe} from "@angular/common";
import {animate, state, style, transition, trigger} from "@angular/animations";
import {faTable} from "@fortawesome/free-solid-svg-icons";
import {faChartPie} from "@fortawesome/free-solid-svg-icons";
import {
	ChartComponent,
	ApexAxisChartSeries,
	ApexChart,
	ApexXAxis,
	ApexDataLabels,
	ApexTitleSubtitle,
	ApexStroke,
	ApexGrid
  } from "ng-apexcharts";
import { LogClientService } from '@/services/log-client.service';
import { ActivatedRoute, Router } from '@angular/router';

export type ChartOptions = {
	series: ApexAxisChartSeries;
	chart: ApexChart;
	xaxis: ApexXAxis;
	dataLabels: ApexDataLabels;
	grid: ApexGrid;
	stroke: ApexStroke;
	title: ApexTitleSubtitle;
  };
@Component({
  selector: 'app-stats',
  templateUrl: './stats.component.html',
  styleUrls: ['./stats.component.scss'],
  providers: [
    CurrencyPipe
  ],
  animations: [
    /**
     * Animation sur la hauteur de l'élément, alterne entre 0 et sa hauteur par défaut.
     * ! Ajouter directement overflow: hidden sur l'élément concerné si besoin de masquer son contenu.
     * L'ajout de cet attribut par l'animation ne fonctionne pas sur Safari !
     */
    trigger('expandVertical', [
      state(
        'open',
        style({
          height: '*'
        })
      ),
      state(
        'closed',
        style({
          height: '0'
        })
      ),
      transition('open => closed', animate('300ms ease-in-out')),
      transition('closed => open', animate('300ms ease-in-out'))
    ])
  ]
})
export class StatsComponent implements OnInit {
  @ViewChild("chart") chart: ChartComponent;
	public chartOptions: Partial<ChartOptions>;

  @ViewChild('graphX') private graphX: ElementRef<HTMLElement>;
  @ViewChild('graphY') private graphY: ElementRef<HTMLElement>;
  @ViewChild('graph') private graph: ElementRef<HTMLElement>;
  @ViewChild('legende') private legende: ElementRef<HTMLElement>;
  @Input() client = 0;

  environment = environment;

  clientCA = null;
  caYearArray: string[] = [];
  caBrandArray: string[] = [];

  clientCAcategorie = null;
  caCategorieYearArray: string[] = [];
  caCategorieCategorieArray: string[] = [];

  collapsedIdsArray: string[] = [];


  clientCAmois: any[] = [];
  camoisYearArray: string[] = [];
  camoisMonthArray: string[] = [];
  camoisYearMonthArray: string[] = [];
  teste: string[] = [];

  camoisCategorieArray: string[] = [];


  color = ['#871C1C', '#F06292', '#9575CD', '#1E88E5', '#009688', '#2E7D32', '#E65100', '#795548'];
  tab = [];
  lst = [];

  elements: string[] = [];
  resCa: string[] = [];
  resNombre: string[] = [];
  resQuantite: string[] = [];
	fondBleu = true;
	fondBleu2 =false;
	fondBleu3 =false;

  showDelay = 100;
  hideDelay = 0;
  matToolTipText = 'placeholder';
  matToolTipPosition = 'above';

  categoriesSuiviPizzaCharts: Array<PizzaChart> = [];
  marquesSuiviPizzaCharts: Array<PizzaChart> = [];

  suiviCategorieFormat: Array<string> = [ "array", "pizzas" ];
  suiviMarqueFormat: Array<string> = [ "array" ];

  tooltipTableauLogo: string = "Affichage des données en tableau";
  tooltipDiagrameCirculaireLogo: string = "Affichage des données en diagrammes circulaires";
  tooltipPosition: string = "left";
  tooltipShowDelay: number = 0;
  tooltipHideDelay: number = 0;

  constructor(
    private http: HttpClient,
    private renderer2: Renderer2,
    public produitService: ProduitService,
    private currencyPipe: CurrencyPipe,
    public logClient: LogClientService,
    public route: ActivatedRoute
  ) { }

  ngOnInit(): void {

    //Dans le cas ou on est pas dans client détails on chope ID par url, logClient.currentClient.id marche mais fait crash la page si on reload
    if(this.client === 0){
      this.client = Number(this.route.snapshot.paramMap.get('id'));
    }

    this.collapsedIdsArray.push('graph-mensuel');
    this.clientCAPHP();
    this.clientCACategoriePHP();
    this.produitPHP();
    this.clientGraphMoisPHP();
  }

  /**
   * Launch request to "ClientCA.php" and subsequent functions
   */
  clientCAPHP(): void {
    this.http.get<any>(`${environment.apiUrl}/ClientCA.php`,
      {
        withCredentials: true,
        params: {
          client: this.client
        }
      })
      .pipe(take(1))
      .subscribe(
        (ret) => {
          if (ret && ret.length > 0)
          {
            this.clientCA = ret.reduce(this.reduceAndSortClientCA, {});
            this.caYearArray.sort();
            this.caBrandArray.sort();
            this.marquesSuiviPizzaCharts = this.buildPizzaCharts(this.caYearArray, this.caBrandArray, this.clientCA, true);
          }
        },
        (error) => {
          console.error('Erreur dans la requete PHP \'ClientCA.php\' du component \'SuiviActiviteComponent\' :', error);
        }
      );
  }

  clientCACategoriePHP(): void {
    this.http.get<any>(`${environment.apiUrl}/ClientCAcategorie.php`,
      {
        withCredentials: true,
        params: {
          client: this.client
        }
      })
      .pipe(take(1))
      .subscribe(
        (ret) => {
          if (ret && ret.length > 0)
          {
            this.clientCAcategorie = ret.reduce(this.reduceAndSortClientCAcategorie, {});
            this.caCategorieYearArray.sort();
            this.caCategorieCategorieArray.sort();
            // Append TOTAL at the end of the array
            this.caCategorieCategorieArray.push(
              this.caCategorieCategorieArray.splice(
                this.caCategorieCategorieArray.indexOf("TOTAL"),
                1
              )[0]
            );

            this.categoriesSuiviPizzaCharts = this.buildPizzaCharts(this.caCategorieYearArray, this.caCategorieCategorieArray, this.clientCAcategorie, false);
            /*this.buildGraphX();
            this.buildGraphY();
            this.buildGraph();
            this.buildLegende();*/
          }
        },
        (error) => {
          console.error('Erreur dans la requete PHP \'ClientCAcategorie.php\' du component \'SuiviActiviteComponent\' :', error);
        }
      );
  }

  contruireUnGraphiqueCommeUnVraiHomme(ret:any[]){


    const tableauDeTableaux = ret.reduce((acc, obj) => {
      // Vérifier si la catégorie existe déjà dans l'accumulateur
      const existingCategory = acc.find(item => item[0].categorie === obj.categorie);

      if (existingCategory) {
        // Si la catégorie existe déjà, ajouter l'objet à son tableau correspondant
        existingCategory.push(obj);
        existingCategory.sort((a, b) => a.anmois.localeCompare(b.anmois));
      } else {
        // Si la catégorie n'existe pas encore, ajouter un nouveau tableau avec cet objet
        acc.push([obj]);
      }

      return acc;
    }, []);

    const series = tableauDeTableaux.map(tableau => {
      const categorie = tableau[0].categorie;
      const data = tableau.map(obj => parseFloat(obj.ca)); // Remplacer "ca" par le nom de votre champ de données
      return { name: categorie, data: data };
    });
    const tableauAvecPlusGrandeTaille = tableauDeTableaux.reduce((acc, tableau) => {
      return tableau.length > acc.length ? tableau : acc;
    }, []);
    const mois = tableauAvecPlusGrandeTaille.map(obj => {
      // Le champ "anmois" est supposé être dans le format "YYYY-MM", donc nous devons extraire les deux derniers caractères pour obtenir le mois
      return obj.anmois
       // Extrait les deux derniers caractères
    });



      this.chartOptions = {
        series: series
        ,
        chart: {
          height: 350,
          type: "line",
          zoom: {
          enabled: false
          }
        },
        dataLabels: {
          enabled: false
        },
        stroke: {
          curve: "straight"
        },

        grid: {
          row: {
          colors: ["#f3f3f3", "transparent"], // takes an array which will be repeated on columns
          opacity: 0.5
          }
        },
        xaxis: {
          categories: mois
        }
        };

    }


  clientGraphMoisPHP() {
    this.http.get<any[]>(`${environment.apiUrl}/ClientCAmois.php`,
      {
        withCredentials: true,
        params: {
          client: this.client
        }
      })
      .pipe(take(1))
      .subscribe(
        (ret:any) => {
          if (ret && ret.length > 0)
          {

          //  ret = this.contruireUnGraphiqueCommeUnVraiHomme(ret)
           /*

            ret.reduce(this.reduceAndSortClientCAmois, {});
            ret.forEach(e => this.clientCAmois.push(e));
            // this.clientCAmois = ret;
            this.camoisYearArray.sort();
            this.camoisMonthArray.sort();
            this.camoisCategorieArray.sort();
            // Append TOTAL at the end of the array
            this.camoisCategorieArray.push(
              this.camoisCategorieArray.splice(
                this.camoisCategorieArray.indexOf("TOTAL"),
                1
              )[0]
            );

            this.ordonnnerListeMonth();
            this.supDoublon();
            this.buildGraphX();
            this.buildGraphY();
            this.buildGraph();
            this.buildLegende();
          } */
        }
      }
      );
  }

  buildGraphX(): void {
    let jump: Boolean = false;

    this.teste.forEach((mois, index) => {
      const ligne = this.renderer2.createElement('text', 'http://www.w3.org/2000/svg');
      this.renderer2.appendChild(ligne, this.renderer2.createText(mois));
      this.renderer2.setStyle(ligne, 'text-shadow', '2px 0 0 #fff, -2px 0 0 #fff, 0 2px 0 #fff, 0 -2px 0 #fff, 1px 1px #fff, -1px -1px 0 #fff, 1px -1px 0 #fff, -1px 1px 0 #fff');
      this.renderer2.setAttribute(ligne, 'x', (index * 980 / ((this.teste.length - 1)? (this.teste.length - 1) : 1) + 20).toString());
      if (jump) {
        this.renderer2.setAttribute(ligne, 'y', '375');
      } else {
        this.renderer2.setAttribute(ligne, 'y', '360');
      }
      jump = !jump;
      // this.renderer2.setAttribute(ligne, 'y', '360');
      this.renderer2.appendChild(this.graphX.nativeElement, ligne);

      this.renderer2.setStyle(ligne, 'font-size', '0.8em');
    })
  }

  buildGraphY(): void {
    let variable = this.max();
    const pas = Math.floor(variable / 5);
    let hauteur = 15;
    const min = this.min();
    const i = 0;
    // if block rajouté pour fix les valeurs extrèmes, peut éventuellement casser quelque chose d'autre
    if (pas > 0)
    {
      while (variable >=0) {
        const col = this.renderer2.createElement('text', 'http://www.w3.org/2000/svg');
        this.renderer2.appendChild(col, this.renderer2.createText((100 * Math.floor(variable / 100)).toString()));
        this.renderer2.setAttribute(col, 'x', '0');
        this.renderer2.setAttribute(col, 'y', hauteur.toString());
        this.renderer2.setStyle(col, 'font-size', '0.8em');
        this.renderer2.appendChild(this.graphY.nativeElement, col);
        hauteur = hauteur + Math.floor(325 / 5);
        variable = variable - pas;
      }
    }
    else
    {
      const col = this.renderer2.createElement('text', 'http://www.w3.org/2000/svg');
      this.renderer2.appendChild(col, this.renderer2.createText("0"));
      this.renderer2.setAttribute(col, 'x', '0');
      this.renderer2.setAttribute(col, 'y', hauteur.toString());
      this.renderer2.setStyle(col, 'font-size', '0.8em');
      this.renderer2.appendChild(this.graphY.nativeElement, col);
    }
  }

  buildGraph(): void {
    this.camoisCategorieArray.filter(x => x !== 'TOTAL').forEach((categorie, index) => {
      const ligne = this.renderer2.createElement('path', 'http://www.w3.org/2000/svg');
      let str = '';
      this.teste.forEach((anmois, j) => {
        const cercle = this.renderer2.createElement('circle', 'http://www.w3.org/2000/svg');
        const nb: number = +(this.clientCAmois.find(e => e.categorie === categorie && e.anmois === anmois)?.ca ?? 0);
        const x = (j * 1040 / (this.teste.length) + 50).toString();
        let y = this.produitencroix(nb).toString();
        // fix pour prévenir les valeurs extrèmes, peut éventuellement casser quelque chose d'autre
        if (+y < 0)
        { y = '335'; }
        //
        if (+y>335)
        { y = '395'; }
        const r = 2;
        this.tab.push({ x, y, valeur: nb ?? 0 });
        if (j === 0) {
          str += 'M ' + x + ' ' + y;
        } else {
          str += ' L ' + x + ' ' + y;
        }

        this.renderer2.setAttribute(cercle, 'cx', x);
        this.renderer2.setAttribute(cercle, 'cy', y);
        this.renderer2.setAttribute(cercle, 'r', r.toString());
        this.renderer2.setStyle(cercle, 'stroke', this.color[index]);
        this.renderer2.setStyle(cercle, 'fill', this.color[index]);
        this.renderer2.appendChild(this.graph.nativeElement, cercle);
      });

      this.renderer2.setAttribute(ligne, 'd', str);
      this.renderer2.setStyle(ligne, 'stroke', this.color[index]);
      this.renderer2.setStyle(ligne, 'stroke-width', '2px');
      this.renderer2.appendChild(this.graph.nativeElement, ligne);
    })
  }


  /*graphParAnnée(): void {
    this.caCategorieCategorieArray.filter(x => x !== 'TOTAL').forEach((category, index) => {
      const ligne = this.renderer2.createElement('path', 'http://www.w3.org/2000/svg');
      let str = '';

      this.caCategorieYearArray.forEach((annee, j) => {
        const cercle = this.renderer2.createElement('circle', 'http://www.w3.org/2000/svg');
        let nb: number = +this.clientCAcategorie[category][annee];
        const x = (j * 950 / (this.caCategorieYearArray.length - 1) + 50).toString();
        const y = this.produitencroix( nb || 0 ).toString();
        const r = 2;
        this.tab.push({ x, y, valeur: this.clientCAcategorie[category][annee] ?? 0 });

        if (j === 0) {
          str += 'M ' + x + ' ' + y;
        } else {
          str += ' L ' + x + ' ' + y;
        }

        this.renderer2.setAttribute(cercle, 'cx', x);
        this.renderer2.setAttribute(cercle, 'cy', y);
        this.renderer2.setAttribute(cercle, 'r', r.toString());
        this.renderer2.setStyle(cercle, 'stroke', this.color[index]);
        this.renderer2.setStyle(cercle, 'fill', this.color[index]);
        this.renderer2.appendChild(this.graph.nativeElement, cercle);
      });

      this.renderer2.setAttribute(ligne, 'd', str);
      this.renderer2.setStyle(ligne, 'stroke', this.color[index]);
      this.renderer2.setStyle(ligne, 'stroke-width', '2px');
      this.renderer2.appendChild(this.graph.nativeElement, ligne);
    })
  }*/

  mouvOnGraph(event: MouseEvent) {
    for (let i = 0; i < this.tab.length; i++) {
      const condition1 = ((event.offsetX > (Math.floor(this.tab[i].x)) - 5) && (event.offsetX < (Math.floor(this.tab[i].x)) + 5));
      const condition2 = ((event.offsetY > (Math.floor(this.tab[i].y)) - 5) && (event.offsetY < (Math.floor(this.tab[i].y)) + 5));

      if (condition1 && condition2) {
        this.lst[1] = this.renderer2.createElement('text', 'http://www.w3.org/2000/svg');
        this.renderer2.appendChild(this.lst[1], this.renderer2.createText(this.currencyPipe.transform(this.tab[i].valeur ?? 0, 'EUR', 'symbol', '1.0-0', 'fr')));
        const texteX = +this.tab[i].x + 5;
        const texteY = +this.tab[i].y + 5;
        this.renderer2.setAttribute(this.lst[1], 'x', texteX.toString());
        this.renderer2.setAttribute(this.lst[1], 'y', texteY.toString());
        this.renderer2.setStyle(this.lst[1], 'stroke', 'transparent');
        this.renderer2.setStyle(this.lst[1], 'fill', 'black');
        this.renderer2.setStyle(this.lst[1], 'text-shadow', '2px 0 0 #fff, -2px 0 0 #fff, 0 2px 0 #fff, 0 -2px 0 #fff, 1px 1px #fff, -1px -1px 0 #fff, 1px -1px 0 #fff, -1px 1px 0 #fff');
        this.renderer2.appendChild(this.graph.nativeElement, this.lst[1]);

        if (this.lst[0]) {
          this.renderer2.removeChild(this.graph.nativeElement, this.lst[0]);
        }
        this.lst[0] = this.lst[1];
      }
    }
  }

  buildLegende(): void {
    this.camoisCategorieArray.filter(x => x !== 'TOTAL').forEach((category, index) => {
      const legende = this.renderer2.createElement('text', 'http://www.w3.org/2000/svg');
      this.renderer2.appendChild(legende, this.renderer2.createText(category));

      this.renderer2.setStyle(legende, 'fill', this.color[index]);
      this.renderer2.setAttribute(legende, 'x','1050' );
      this.renderer2.setAttribute(legende, 'y',( ((index*200  / 6)+50).toString() ));
      this.renderer2.setStyle(legende, 'text-shadow', '2px 0 0 #fff, -2px 0 0 #fff, 0 2px 0 #fff, 0 -2px 0 #fff, 1px 1px #fff, -1px -1px 0 #fff, 1px -1px 0 #fff, -1px 1px 0 #fff');
      this.renderer2.appendChild(this.legende.nativeElement, legende);
    })
  }

  max(): number {
    let max: number = Number.MIN_VALUE;
    const arr1 = Object.values(this.clientCAmois);/*  clientCAcategorie */
    for (let i = 0; i < arr1.length - 1; i++) {
      const arr2 = Object.values(arr1[i]);
      for (let j = 0; j < arr2.length; j++) {
        if (max < +arr2[j]) {
          max = +arr2[j];
        }
      }
    }
    return max;
  }

  min(): number {
    let min: number = Number.MAX_VALUE;
    const arr1 = Object.values(this.clientCAmois);/*  clientCAcategorie */
    for (let i = 0; i < arr1.length; i++) {
      const arr2 = Object.values(arr1[i]);
      if (min > +arr2[4]) {
        min = +arr2[4];
      }
    }
    return min;
  }

  produitencroix(nb: number): number {
    const y: number = 325 - (((325 * nb) / this.max())) + 10;
    /*if( y < 0 ){
      y = 0;
    }*/
    return y;
  }


  /* met la liste des mois dans l'ordre */
  ordonnnerListeMonth(): void {
    const byValue = (a, b) => a - b;
    this.camoisMonthArray = [...this.camoisMonthArray].sort(byValue);
  }

  supDoublon(): void {
    function isUnique(item, position, array) {
      return array.indexOf(item) === position;
    }
    this.camoisYearMonthArray.sort();
    this.teste = this.camoisYearMonthArray.filter(isUnique);

  }

  /**{}
   * Reducer callback for sorting the return of ClientCA.php
   */
  reduceAndSortClientCA = (accumulator, currentValue, currentIndex, arrayInUse): any => {
    // marque is not already in 'caBrandArray'
    //  add it
    if (!this.caBrandArray.includes(currentValue.marque)) {
      this.caBrandArray.push(currentValue.marque);
      accumulator[currentValue.marque] = {};
    }
    // annee is not already in 'caYearArray'
    //  add it
    if (!this.caYearArray.includes(currentValue.annee)) {
      this.caYearArray.push(currentValue.annee);
    }

    // add to accumulator
    accumulator[currentValue.marque][currentValue.annee] = currentValue.ca;
    return (accumulator);
  }

  /**
   * Reducer callback for sorting the return of ClientCAcategorie.php
   */
  reduceAndSortClientCAcategorie = (accumulator, currentValue, currentIndex, arrayInUse): void => {
    // categorie is not already in 'caCategorieBrandArray'
    //  add it
    if (!this.caCategorieCategorieArray.includes(currentValue.categorie)) {
      this.caCategorieCategorieArray.push(currentValue.categorie);
      accumulator[currentValue.categorie] = {};
    }
    // annee is not already in 'caCategorieYearArray'
    //  add it
    if (!this.caCategorieYearArray.includes(currentValue.annee)) {
      this.caCategorieYearArray.push(currentValue.annee);
    }

    // add to accumulator
    accumulator[currentValue.categorie][currentValue.annee] = currentValue.ca;
    return (accumulator);
  }

  // ----------------------------------------------------------    Fonctions Hit parade ------------------------------------------------------

  produitPHP() {
    this.http.get<any>(`${environment.apiUrl}/ClientHitProduit.php`,
      {
        withCredentials: true,
        params: {
          client: this.client
        }
        // responseType: "json"
      })
      .pipe(take(1))
      .subscribe(
        (ret) => {
          if (ret && ret.length > 0)
          {
            this.resCa = this.classementCa(ret);
            this.resNombre = this.classementNombre(ret);
            this.resQuantite = this.classementQuantite(ret);
            this.affichageNombre();
          }
        },
        (error) => {
          console.error('Erreur dans la requete PHP \'ClientHitProduit.php\' du component \'SuiviProduitsComponent\' :', error);
        }
      );
  }

  classementCa(tab) {
		tab.sort((a, b) => b.nombre - a.nombre);
		tab.sort((a, b) => b.quantite - a.quantite);
		tab.sort((a, b) => b.ca - a.ca);
		return tab.slice(0, 20);
	}

	classementNombre(tab) {
		tab.sort((a, b) => b.ca - a.ca);
		tab.sort((a, b) => b.quantite - a.quantite);
		tab.sort((a, b) => b.nombre - a.nombre);
		return tab.slice(0, 20);
	}
	classementQuantite(tab) {
		tab.sort((a, b) => b.ca - a.ca);
		tab.sort((a, b) => b.nombre - a.nombre);
		tab.sort((a, b) => b.quantite - a.quantite);
		return tab.slice(0, 20);
	}

  affichageNombre() {
		this.elements = this.resNombre;
		this.fondBleu = true;
		this.fondBleu2 = false;
		this.fondBleu3 = false;
	}


	affichageCa() {
		this.elements = this.resCa;
		this.fondBleu = false;
		this.fondBleu2 = true; // Mettre à jour la variable fondVert
		this.fondBleu3 = false;
	}

	affichageQuantite() {
		this.elements = this.resQuantite;
		this.fondBleu = false;
		this.fondBleu2 = false; // Mettre à jour la variable fondVert
		this.fondBleu3 = true;
	}

  reduceAndSortClientCAmois = (accumulator, currentValue, currentIndex, arrayInUse) => {
    // categorie is not already in 'caCategorieBrandArray'
    //  add it
    if (!this.camoisCategorieArray.includes(currentValue.categorie)) {
      this.camoisCategorieArray.push(currentValue.categorie);
      accumulator[currentValue.categorie] = {};
    }
    // annee is not already in 'camomisYearArray'
    //  add it
    if (!this.camoisYearArray.includes(currentValue.annee)) {
      this.camoisYearArray.push(currentValue.annee);
    }

    // month is not already in 'camoisYearArray'
    //  add it
    if (!this.camoisMonthArray.includes(currentValue.mois)) {
      this.camoisMonthArray.push(currentValue.mois);
    }


    if (!this.camoisYearMonthArray.includes(currentValue.mois)) {
      this.camoisYearMonthArray.push(currentValue.anmois);
    }

    // add to accumulator
    accumulator[currentValue.categorie][currentValue.annee] = currentValue.ca;
    return (accumulator);
  }


  // SUIVI CATEGORIE FUNCTIONS
  toggleCategorieSuiviFormat(keyOfElement: string): void
  {
    let index = this.suiviCategorieFormat.indexOf(keyOfElement);

    if (index != -1) // keyOfElement est dans le tableau
    {
      this.suiviCategorieFormat.splice(index, 1);
    }
    else // keyOfElement n'est pas dans le tableau
    {
      this.suiviCategorieFormat.push(keyOfElement);
    }
  }
  // SUIVI CATEGORIE FUNCTIONS
  toggleMarqueSuiviFormat(keyOfElement: string): void
  {
    let index = this.suiviMarqueFormat.indexOf(keyOfElement);

    if (index != -1) // keyOfElement est dans le tableau
    {
      this.suiviMarqueFormat.splice(index, 1);
    }
    else // keyOfElement n'est pas dans le tableau
    {
      this.suiviMarqueFormat.push(keyOfElement);
    }
  }

  /**
   * Constuit les pizzaCharts de "Suivi d'activité par catégories"
   */
  buildPizzaCharts(annees: Array<string>, categories: Array<string>, categoriesAnneesAmount: Array<Array<string>>, bigCharts: Boolean = false): Array<PizzaChart>
  {
    let cookingPizzaChart: PizzaChart = null;
    let pizzaCharts: Array<PizzaChart> = [];

    annees.forEach((annee) =>
    {
      cookingPizzaChart = new PizzaChart();
      if (bigCharts) // agrandit les charts si 'bigCharts' est true
      {
        cookingPizzaChart.params.width = 500;
      }
      categories.forEach((categorie)=>
      {
        if (categorie && categorie != "TOTAL")
        {
          if (categoriesAnneesAmount[categorie][annee])
          {
            if(!bigCharts){
              cookingPizzaChart.colors.push(this.getColorBu(categorie))
            }
            if (categorie != "."){
              cookingPizzaChart.labels.push(categorie);
              cookingPizzaChart.values.push(Number(categoriesAnneesAmount[categorie][annee]));
            }else{
              cookingPizzaChart.labels.push("Autres");
              cookingPizzaChart.values.push(Number(categoriesAnneesAmount[categorie][annee]));
            }

          }
          /*else
          {
            cookingPizzaChart.values.push(0);
          }*/
        }
      });
      pizzaCharts.push(cookingPizzaChart);
      //cookingPizzaChart.labels.push(cookingPizzaChart.labels.splice(cookingPizzaChart.labels.indexOf('Autres'), 1)[0]);
    });
    return (pizzaCharts);
  }

  getColorBu(cat){

    let color: string;

    switch (cat) {
      case 'Câblage':
        color = '#008ffb';
        break;
      case 'Cybersécurité':
        color = '#00e396';
        break;
      case 'Formations':
        color = '#feb019';
        break;
      case 'Réseau':
        color = '#ff4560';
        break;
      case 'Sécurité':
        color = '#775dd0';
        break;
      case 'Télécom':
        color = '#6ebdec';
        break;
      case 'Vidéo':
        color = '#CBF340';
        break;
      case 'Services':
        color = '#d3860c';
        break;
      case 'Divers':
        color = '#fdc8c0';
        break;
      default :
        color = '#c54f6b';
    }

    return color;
  }

  /**
   * Ouvre ou ferme un élément.
   * @param event L'élément DOM déclencheur
   * @param id L'identifiant de l'élément
   */
  toggleCollapseDivById(event, id: string): void {
    // On vérifie que l'on a pas à faire à un sous-évenement pour ne pas déclencher plusieurs fois le handler.
    if (!event.srcEvent) {
      if (this.collapsedIdsArray.includes(id)) {
        this.collapsedIdsArray.splice(this.collapsedIdsArray.indexOf(id), 1); // retirer l'id de collapsedIdsArray
      }
      else {
        this.collapsedIdsArray.push(id); // ajouter l'id à collapsedIdsArray
      }
    }
  }

  marqueColors: Array<string> = [ "#008ffb", "#00e396", "#feb019", "#ff4560", "#775dd0", "#6ebdec", "#CBF340", "#d3860c", "#fdc8c0", "#c54f6b", "#009489",
    "#008ffb", "#00e396", "#feb019", "#ff4560", "#775dd0", "#6ebdec", "#CBF340", "#d3860c", "#fdc8c0", "#c54f6b", "#009489",
    "#008ffb", "#00e396", "#feb019", "#ff4560", "#775dd0", "#6ebdec", "#CBF340", "#d3860c", "#fdc8c0", "#c54f6b", "#009489" ]
  protected readonly faTable = faTable;
  protected readonly faChartPie = faChartPie;
}

class PizzaChart
{
  values: Array<any> = [];
  labels: Array<string> = [];
  colors: Array<string> = []
  params: { width: number, type: string } = { width: 380, type: "pie" };
  responsive: any = [
    {
      breakpoint: 480,
      options: {
        chart: {
          width: 200
        },
        legend: {
          position: "bottom"
        }
      }
    }
  ]
}
