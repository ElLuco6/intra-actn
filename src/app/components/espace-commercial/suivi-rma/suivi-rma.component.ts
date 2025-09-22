import {Component, EventEmitter, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import {environment} from "@env/environment";
import {HttpClient} from "@angular/common/http";
import {Rma} from "@models/rma";
import {animate, state, style, transition, trigger} from "@angular/animations";
import {MatSort} from "@angular/material/sort";
import {MatPaginator} from "@angular/material/paginator";
import {MatTableDataSource} from "@angular/material/table";
import {BehaviorSubject, Observable, Subject} from "rxjs";
import {SortAndFilterService} from "@services/sort-and-filter.service";
import {FormBuilder} from "@angular/forms";
import {MatAutocompleteTrigger} from "@angular/material/autocomplete";
import {LogClientService, PredictionResultsClient} from "@services/log-client.service";
import {takeUntil} from "rxjs/operators";
import {Router} from "@angular/router";
import {faFilePdf} from "@fortawesome/free-solid-svg-icons";

@Component({
  selector: 'app-suivi-rma',
  templateUrl: './suivi-rma.component.html',
  styleUrls: ['./suivi-rma.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class SuiviRmaComponent implements OnInit, OnDestroy {

  columnsToDisplay = ['client', 'raison','marque', 'numerodmd', 'produit', 'designation', 'numerorma', 'quantiteretourne', 'qtedemande', 'status'];
  test = ['N° Client', 'Raison', 'Marque', 'N° Demande', 'Réf. produit', 'Désignation', 'N° de RMA', 'Qte retour', 'Qte rec.', 'Statut'];
  columnsToDisplayWithExpand = [...this.columnsToDisplay, 'expand'];
  expandedElement: Rma | null;
  environment = environment;
  processedRma$ = new BehaviorSubject<Array<Rma>>([]);
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  dataSource = new MatTableDataSource<Rma>();
  @Output() hasFocusedInputChange = new EventEmitter<boolean>();
  @ViewChild(MatAutocompleteTrigger) autocomplete: MatAutocompleteTrigger;
  autoCompleteOptions$: Observable<PredictionResultsClient>;
  constructor(
    private http: HttpClient,
    public saf: SortAndFilterService,
    private fb: FormBuilder,
    private predictionService: LogClientService
  ) { }

  filtreForm = this.fb.group({
    client: '',
    region: '',
    status: ''
  })
  regionSelected: Array<string> = [];
  statusSelected: Array<string> = [];
  listRma: Array<Rma> = [];
  marquesRma: Array<string> = [];
  proccessedMarque$ = new BehaviorSubject<Array<string>>([]);
  marqueSelected: Array<string> = [];
  private _destroy$ = new Subject<void>();
  searching: string;

  ngOnInit(): void {
    this.http.get<Rma[]>(`${environment.apiUrl}/RmaStatusRegion.php`,{
      withCredentials: true
    }).subscribe(
      (data) => {
        this.listRma = data.slice(1);
        this.listRma.forEach((e) => {
          if(e.marque != ""){
            this.marquesRma.push(e.marque);
          }
        });
        this.marquesRma = this.marquesRma.filter((x, i) => this.marquesRma.indexOf(x) === i);
        this.proccessedMarque$.next(this.marquesRma);
        this.marqueSelected = this.saf.getFiltre('rma', 'marque', 'includes') as Array<string> || [];
        this.regionSelected = this.saf.getFiltre('rma', 'region', 'includes') as Array<string> || [];
        this.processedRma$.next(this.saf.filtrer('rma', this.listRma));
        this.processedRma$.subscribe((d) => {
          this.dataSource.data = d;
        });
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.filtreForm.get('status').setValue('');
        this.filtreForm.get('client').valueChanges.subscribe(searchString => {
          this.searching = searchString;
          this.predictionService.searchString = searchString;
        });
        this.predictionService.searchString$.pipe(takeUntil(this._destroy$)).subscribe(value => {
          if(this.searching !== value){
            this.filtreForm.get('client').setValue(value);
          }
          this.autoCompleteOptions$ = this.predictionService.getPredict(value);
          this.searching = value.toUpperCase();
        });
      },
      (error) => {
        console.log(error);
      });

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

  onSearch(target: string, type: string, method: string, event, values?: string): void{
    if (values) {
      setTimeout(() => this.processedRma$.next(this.saf.onFiltre('rma', target, type, method, this[values], this.listRma)), 1);
    } else {
      setTimeout(() => this.processedRma$.next(this.saf.onFiltre('rma', target, type, method, event['target'].value != null ? event['target'].value : event['target'].innerText, this.listRma)), 1);
    }
  }

  filtreMarqueToggle(marque: string): void {
    if (this.marqueSelected.includes(marque)) {
      this.marqueSelected.splice(this.marqueSelected.findIndex(ms => ms === marque));
    } else {
      this.marqueSelected.push(marque);
    }
    this.marqueSelected = [].concat(this.marqueSelected);
    setTimeout(() => this.processedRma$.next(this.saf.onFiltre('rma', 'marque', 'array', 'includes', this.marqueSelected, this.listRma)), 1);
  }

  get region(): Array<any> {
    let region = [];
    this.listRma.forEach((e) => {
      region.push(e.region);
    });
    region = region.filter((x, i) => region.indexOf(x) === i);
    return region;
  }

  get status(): Array<any> {
    let status = [];
    this.listRma.forEach((e) => {
      status.push(e.status);
    });
    status = status.filter((x, i) => status.indexOf(x) === i);
    return status;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  selectOnPredict(event){
    let eventArr = {target: {value: event.value}};
    this.onSearch('client', 'string', 'includes', eventArr)
  }

  resetOneFilters(filter: string) {
    // RESET ONE FILTERS
    this.filtreForm.get(filter).setValue('');
    this.saf.resetFiltre('rma', filter + 'includes');
    this.processedRma$.next(this.saf.filtrer('rma', this.listRma));
  }

  protected readonly faFilePdf = faFilePdf;
}
