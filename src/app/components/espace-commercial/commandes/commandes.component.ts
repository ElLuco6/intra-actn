import {Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {CommandesService} from "@services/commandes.service";
import {AuthenticationService} from "@services/authentication.service";
import {environment} from "@env/environment";
import {FormBuilder} from "@angular/forms";
import {SortAndFilterService} from "@services/sort-and-filter.service";
import {BehaviorSubject, Observable, Subject} from "rxjs";
import {CommandeCommercial} from "@models/commandeCommercial";
import {LogClientService, PredictionResultsClient} from "@services/log-client.service";
import {takeUntil} from "rxjs/operators";
import {MatAutocompleteTrigger} from "@angular/material/autocomplete";
import {MatTableDataSource} from "@angular/material/table";
import {MatPaginator} from "@angular/material/paginator";
import {MatSort} from "@angular/material/sort";
import {Router} from "@angular/router";
import {SelectionModel} from "@angular/cdk/collections";
import {Client} from "@/models";
import {ExportToXslService} from "@services/export-to-xsl.service";
import {CampagnesService} from "@services/campagnes.service";

@Component({
  selector: 'app-commandes',
  templateUrl: './commandes.component.html',
  styleUrls: ['./commandes.component.scss']
})
export class CommandesComponent implements OnInit, OnDestroy {

  displayedColumns: string[] = [
    'select',
    'numClient',
    'nom',
    'numCde',
    'refCde',
    'numBl',
    'numFacture',
    'dateCde',
    'departement',
    'montantHt'];
  dataSource = new MatTableDataSource<CommandeCommercial>();
  @ViewChild(MatPaginator) paginatore: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  environment = environment;

  autoCompleteOptions$: Observable<PredictionResultsClient>;

  @Input() toDisplay: number = 10;
  commandesList: Array<any> = [];
  processedCommande$ = new BehaviorSubject<Array<CommandeCommercial>>([]);
  @Output() hasFocusedInputChange = new EventEmitter<boolean>();
  @ViewChild(MatAutocompleteTrigger) autocomplete: MatAutocompleteTrigger;
  filtresForm = this.fb.group({
    numclient: '',
    nom: '',
    refCde: '',
    numCde: '',
    numBl: '',
    numFacture: '',
    dateCde: '',
    departement: '',
    marque: '',
    montantHt: '',
    produit: '',
    region: ''
  });

  depSelected: Array<string> = [];
  regionSelected: Array<string> = [];
  searching: string;
  private _destroy$ = new Subject<void>();
  selection = new SelectionModel<CommandeCommercial>(true, []);

  marquesSelected: Array<string> = [];
  proccessedMarque$ = new BehaviorSubject<Array<string>>([]);

  constructor(
    private http: HttpClient,
    private commandesService: CommandesService,
    private authService: AuthenticationService,
    private fb: FormBuilder,
    public saf: SortAndFilterService,
    private predictionService: LogClientService,
    private router: Router,
    protected exportXls: ExportToXslService,
    protected campagnesService: CampagnesService

  ) { }

  ngOnInit(): void
  {
    this.http.get<Array<any>>(`${environment.apiUrl}/RegionCommandes.php`, {
      withCredentials: true
    }).subscribe(
      (data) => {
        this.commandesList = data;
        this.commandesList.sort((a, b) => a['clientCde'].date - b['clientCde'].date);
        this.reformateArrayCde();
      }
    );
    this.filtresForm.get('numclient').valueChanges.subscribe(searchString => {
      this.searching = searchString;
      this.predictionService.searchString = searchString;
    });
    this.predictionService.searchString$.pipe(takeUntil(this._destroy$)).subscribe(value => {
      if(this.searching){
        if(this.searching !== value){
          this.filtresForm.get('numclient').setValue(value);
        }
        this.autoCompleteOptions$ = this.predictionService.getPredict(value);
        this.searching = value.toUpperCase();
      }
    });
  }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  toggleAllRows() {
    if (this.isAllSelected()) {
      this.selection.clear();
      return;
    }

    this.selection.select(...this.dataSource.filteredData);
  }

  checkboxLabel(row?: CommandeCommercial): string {
    if (!row) {
      return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'}`;
  }

  ngOnDestroy() {
    this._destroy$.next();
    this._destroy$.complete();
  }

  inputFocused() {
    this.hasFocusedInputChange.emit(true);
  }

  start(mot: string): string {
    // verification de la recherche présente dans le mot
    if (mot.includes(this.searching)) {
      // découpage du mot pour ne renvoyer que le début (avant l'occurence de la recherche)
      return mot.slice(0, mot.indexOf(this.searching, 0));
    }
    else {
      // si la recherche n'est pas dans le mot (cas possible que lors d'une recherche reference/deignation),
      // la fonction start renvoie le mot et la fonction end renvoie la chaine vide afin de ne pas avoir de modification du mot
      return mot;
    }
  }

  end(mot: string): string {
    if (mot.includes(this.searching)) {
      return mot.slice(mot.indexOf(this.searching, 0) + this.searching.length);
    }
    else {
      // si la recherche n'est pas dans le mot (cas possible que lors d'une recherche reference/deignation),
      // la fonction start renvoie le mot et la fonction end renvoie la chaine vide afin de ne pas avoir de modification du mot
      return '';
    }
  }

  test = null;
  sousTableau = [];
  tab = [];
  tabCde = [];
  tabCommandes: CommandeCommercial[] = [];

  reformateArrayCde(){
    this.commandesList.forEach((e) => {
      if(e['clientCde'].commande != this.test){
        this.sousTableau = [];
        this.tabCde = [];
        this.tabCde.push(e['clientCde']);
        this.sousTableau.push(e);
        this.sousTableau.push(this.tabCde);
        this.test = e['clientCde'].commande;
        if(this.sousTableau){
          this.tab.push(this.sousTableau);
        }
      }else{
        this.sousTableau[1].push(e['clientCde']);
      }
    });
    this.arrayConstructor();
  }

  marquesCommande = [];

  arrayConstructor(){
    this.tab.forEach((e) => {
      e[1].forEach((elem) => {
        this.marquesCommande.push(elem.marque);
      });
      this.tabCommandes.push({
        numclient: e[0].numclient,
        numClient: Number(e[0].numclient),
        nom: e[0].nom,
        numCde: e[1][0].commande.toString(),
        refCde: e[1][0].refclient,
        numBl: e[1][0].bl,
        numFacture: e[1][0].facture,
        dateCde: e[1][0].commandedate,
        departement: e[0].departementlib,
        montantHt: e[1][0].MtcdeHT,
        produits: e[1],
        region: e[0].region
      });
    });
    this.marquesCommande = this.marquesCommande.filter((x, i) => this.marquesCommande.indexOf(x) === i);
    this.instanceFilter();
  }

  instanceFilter(){
    this.proccessedMarque$.next(this.marquesCommande.sort());
    this.depSelected = this.saf.getFiltre('commande', 'departementlib', 'includes') as Array<string> || [];
    this.regionSelected = this.saf.getFiltre('commande', 'region', 'includes') as Array<string> || [];
    this.marquesSelected = this.saf.getFiltre('commande', 'produits.marque', 'includes') as Array<string> || [];
    this.processedCommande$.next(this.saf.filtrer('commande', this.tabCommandes));
    this.processedCommande$.subscribe((d) => {
      this.dataSource.data = d;
    })
    this.dataSource.paginator = this.paginatore;
    this.dataSource.sort = this.sort;
  }

  filtreMarqueToggle(marque: string): void {
    if (this.marquesSelected.includes(marque)) {
      this.marquesSelected.splice(this.marquesSelected.findIndex(ms => ms === marque));
    } else {
      this.marquesSelected.push(marque);
    }
    this.marquesSelected = [].concat(this.marquesSelected);
    setTimeout(() => this.processedCommande$.next(this.saf.onFiltre('commande', 'produits.marque', 'array', 'includes', this.marquesSelected, this.tabCommandes)), 1);
  }

  get departement(): Array<any>{
    let listeDep = [];
    this.commandesList.forEach((e) => {
      if(e.departementlib != ''){
        listeDep.push(e.departementlib);
      }
    });
    listeDep = listeDep.filter((x, i) => listeDep.indexOf(x) === i);
    listeDep.sort();
    return listeDep;
  }

  get region(): Array<any> {
    let region = [];
    this.commandesList.forEach((e) => {
      region.push(e.region);
    });
    region = region.filter((x, i) => region.indexOf(x) === i);
    return region;
  }

  get marque(): Array<any> {
    let marque = [];
    this.tabCommandes.forEach((e) => {
      e.produits.forEach((p) => {
        marque.push(p.marque);
      })
    });
    marque = marque.filter((x, i) => marque.indexOf(x) === i);
    return marque.sort();
  }

  selectOnPredict(event){
    let eventArr = {target: {value: event.value}};
    this.onSearch('numclient', 'string', 'includes', eventArr)
  }

  onSearch(target: string, type: string, method: string, event, values?: string): void{
    if (values) {
      setTimeout(() => this.processedCommande$.next(this.saf.onFiltre('commande', target, type, method, this[values], this.tabCommandes)), 1);
    } else {
      setTimeout(() => this.processedCommande$.next(this.saf.onFiltre('commande', target, type, method, event['target'].value != null ? event['target'].value : event['target'].innerText, this.tabCommandes)), 1);
    }
  }

  resetOneFilters(filter: string) {
    // RESET ONE FILTERS
    this.filtresForm.get(filter).setValue('');
    this.saf.resetFiltre('commande', filter + 'includes');
    this.processedCommande$.next(this.saf.filtrer('commande', this.tabCommandes));
  }

  resetFilters() {
    // RESET FILTERS
    this.filtresForm.setValue({
      numclient: '',
      nom: '',
      refCde: '',
      numCde: '',
      numBl: '',
      numFacture: '',
      dateCde: '',
      departement: '',
      region: '',
      marque: '',
      montantHt: '',
      produit: ''
    });
    this.saf.resetFiltre('commande', 'numclientincludes');
    this.saf.resetFiltre('commande', 'nomincludes');
    this.saf.resetFiltre('commande', 'refCdeincludes');
    this.saf.resetFiltre('commande', 'numCdeincludes');
    this.saf.resetFiltre('commande', 'numBlincludes');
    this.saf.resetFiltre('commande', 'numFactureincludes');
    this.saf.resetFiltre('commande', 'dateCdeincludes');
    this.saf.resetFiltre('commande', 'depincludes');
    this.saf.resetFiltre('commande', 'regionincludes');
    this.saf.resetFiltre('commande', 'marqueincludes');
    this.saf.resetFiltre('commande', 'montantHtincludes');
    this.saf.resetFiltre('commande', 'produitincludes');
    this.processedCommande$.next(this.saf.filtrer('commande', this.tabCommandes));
  }

  openInNewWindow(client){
    const url = this.router.serializeUrl(
      this.router.createUrlTree(['/client-detail/' + client])
    );
    window.open(decodeURIComponent(url), '_blank');
  }

  exportToExcel() {
    this.exportXls.exportToXls(this.selection.selected.map(({numCde,
      refCde,
      numBl,
      numFacture,
      dateCde,
      departement,
      montantHt,
      produits,
      ...rest}) => rest), 'commandes');
  }

}
