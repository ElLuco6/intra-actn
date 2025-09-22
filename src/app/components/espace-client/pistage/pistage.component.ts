import { FinanceService } from '@/services/finance.service';
import { SortAndFilterService } from '@/services/sort-and-filter.service';
import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { environment } from '@env/environment';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-pistage',
  templateUrl: './pistage.component.html',
  styleUrls: ['./pistage.component.scss'],
})
export class PistageComponent implements OnInit {
  @ViewChild('input', { static: false }) inputElement: ElementRef;
  displayedColumnsLib: string[] = [
    'date',


   /*  'niveau1',
    'niveau2',
    'niveau3', */
    'nivlib1',
    'nivlib2',
    'nivlib3',

    'nbresultat'


  ];
  displayedColumnsRecherche: string[] = [
    'date',
    'nivlib1',
    'nivlib2',
    'nivlib3',
    'marque',
    'recherche',
    'nbresultat'

  ];



  campaignTwo = new FormGroup({
    start: new FormControl(''),
    end: new FormControl(''),
  });
  nivlib1Selected: Array<string> = [];
  nivlib2Selected: Array<string> = [];
  nivlib3Selected: Array<string> = [];
  rechercheSelected: Array<string> = [];
  marqueSelected: Array<string> = [];

  filtresForm: FormGroup;


  dataSource = new MatTableDataSource<PistageClient>();
  dataSourceRecherche = new MatTableDataSource<PistageClient>();
  @ViewChild(MatPaginator) paginator: MatPaginator;

  @ViewChild(MatSort) sort: MatSort;
  @Input() nclient: number;
  rechercheArray: any[] = [];
  clientArray: any[] =[];
  processedClient$ = new BehaviorSubject<Array<PistageClient>>([]);
  processedRecherche$ = new BehaviorSubject<Array<PistageClient>>([]);
  inputForm:FormGroup;
  collapsedIdsArray: string[] = [];
  rechercheValue: string ="";


  constructor(public http: HttpClient,
              public route: ActivatedRoute,
               public fb: FormBuilder,
               public _financeService: FinanceService,
               public saf: SortAndFilterService) {}

  ngOnInit(): void {
    this.filtresForm = this.fb.group({
      nivlib1: new FormControl<String[] | null>(null),
      nivlib2: new FormControl<any | null>(null),
      nivlib3: new FormControl<any | null>(null),
      recherche:new FormControl<String[] | null>(null),
      marque :new FormControl<String[] | null>(null),
    });
    this.instanceFilter()
   this.getClient(this.nclient);
  }

  instanceFilter(){
    //this.processedCdr$.next(this.marquesCommande.sort());
    this.nivlib1Selected = this.saf.getFiltre('cdr', 'nivlib1', 'includes') as Array<string> || [];
    this.nivlib2Selected = this.saf.getFiltre('cdr', 'nivlib2', 'includes') as Array<string> || [];
    this.nivlib3Selected = this.saf.getFiltre('cdr', 'nivlib3', 'includes') as Array<string> || [];
    this.rechercheSelected = this.saf.getFiltre('cdr', 'recherche', 'includes') as Array<string> || [];
    this.marqueSelected = this.saf.getFiltre('cdr', 'marque', 'includes') as Array<string> || [];

    this.processedClient$.next(this.saf.filtrer('cdr', this.clientArray));
    this.processedClient$.subscribe((d) => {
      this.dataSource.data = d.flat().reverse();
    })

    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }


  filtrer(event, type, champ){
    this._financeService.applyFilter(event, type, champ);
    this.reOpenDiv();
  }
  reOpenDiv(){
    this.collapsedIdsArray = [];
  }
  getClient(nclient:number) {

    this.nclient = nclient;
    this.http
      .get<any[]>(`${environment.apiUrl}/ListeRecherche.php`, {
        params: {
          client: nclient,
        },
        responseType: 'json',
      })
      .subscribe((data) => {
        this.clientArray = data

        this.processedClient$.next(data);
        this.processedClient$.subscribe((d) => {
          this.dataSource.data = d.reverse();
        });
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;

      /*   this.processedRecherche$.next(data[0]);
        this.processedRecherche$.subscribe((d) => {
          this.dataSourceRecherche.data = d;
        }); */


      });
  }


  test(){
    let t = []
    this.processedClient$.next(t)
  }



  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
  clearInput() {
    // Réinitialiser la valeur de l'input à une chaîne vide
    this.inputElement.nativeElement.value = '';
    const filterValue = "";
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  onSearch(target: string, type: string, method: string, event, values?: string): void{
    if (values) {

      setTimeout(() => this.processedClient$.next(this.saf.onFiltre('cdr', target, type, method, this[values], this.clientArray)), 1);

    } /* else {

      setTimeout(() => this.processedClient$.next(this.saf.onFiltre('cdr', target, type, method, event['target'].value != null ? event['target'].value : event['target'].innerText, this.clientArray)), 1);


    } */
  }
  resetOneFilters(filter: string) {
    // RESET ONE FILTERS
    this.filtresForm.get(filter).setValue('');
    this.saf.resetFiltre('cdr', filter + 'includes');
    this.processedClient$.next(this.saf.filtrer('cdr', this.clientArray));
  }


}


export class PistageClient {
  date: string;
  heure: string;
  nbresultat: string;
  nclient: string;
  niveau1: string;
  niveau2: string;
  niveau3: string;
  nivlib1: string;
  nivlib2: string;
  nivlib3: string;
  marque: string;
  recherche: string;

  constructor(  date: string,
    heure: string,
    nbresultat: string,
    nclient: string,
    niveau1: string,
    niveau2: string,
    niveau3: string,
    nivlib1: string,
    nivlib2: string,
    nivlib3: string,
    marque: string,
    recherche: string
  ){
    this.date = date;
    this.heure= heure;
    this.nbresultat = nbresultat;
    this.nclient = nclient;
    this.niveau1 = niveau1;
    this.niveau2 = niveau2;
    this.niveau3 = niveau3;
    this.nivlib1 = nivlib1;
    this.nivlib2 = nivlib2;
    this.nivlib3 = nivlib3;
    this.marque = marque;
    this.recherche = recherche
  }
}
