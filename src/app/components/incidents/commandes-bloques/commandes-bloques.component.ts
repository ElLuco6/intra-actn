import {Component, OnInit, ViewChild} from '@angular/core';
import {environment} from "@env/environment";
import {HttpClient} from "@angular/common/http";
import {CdeBloque} from "@models/cdeBloque";
import {ActivatedRoute, Router} from "@angular/router";
import {animate, state, style, transition, trigger} from "@angular/animations";
import {BehaviorSubject} from "rxjs";
import {MatPaginator} from "@angular/material/paginator";
import {MatSort} from "@angular/material/sort";
import {MatTableDataSource} from "@angular/material/table";
import {FormBuilder} from "@angular/forms";
import {SortAndFilterService} from "@services/sort-and-filter.service";

@Component({
  selector: 'app-commandes-bloques',
  templateUrl: './commandes-bloques.component.html',
  styleUrls: ['./commandes-bloques.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ]
})
export class CommandesBloquesComponent implements OnInit {
  columnsToDisplay = ['numclient', 'nom', 'adresse1', 'telephone', 'risqueGlobal'];
  columsName = ['N° Client', 'Nom', 'Adresse', 'Telephone', 'Finance']
  columnsToDisplayWithExpand = [...this.columnsToDisplay, 'expand'];
  expandedElement: CdeBloque | null;
  cdeBloques: CdeBloque[] = [];
  type: string = '';
  filtreRegion: string = '';
  regionSelected: Array<string> = [];
  cdeBloques$ = new BehaviorSubject<Array<CdeBloque>>([]);
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  dataSource = new MatTableDataSource<CdeBloque>();
  formFiltre = this.fb.group({
    commande: '',
    region: ''
  })

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    public saf: SortAndFilterService
  ) {
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.type = params['type'];
      this.filtreRegion = params['region']
    });
    this.cdeBloques$.subscribe();
    if (this.type == 'cdeBloque') {
      this.getCdeBloquee();
    } else {
      this.getCdeRupture()
    }
  }

  getCdeBloquee() {
    return this.http.get<Array<CdeBloque>>(`${environment.apiUrl}/ListeCdeBloquees.php`, {
      params: {
        fitreregion: this.filtreRegion
      }
    }).subscribe(
      (data) => {
        let test = []
        test.push(data)
        //data = [].push(data)

        this.cdeBloques = data;
        this.regionSelected = this.saf.getFiltre('cdeBloque', 'region', 'includes') as Array<string> || [];
        this.cdeBloques$.next(this.saf.filtrer('cdeBloque', this.cdeBloques));
        this.cdeBloques$.subscribe(d => {
          this.dataSource.data = d;
        });
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      },
      (error) => {
        console.log(error);
      })
  }


  getCdeRupture() {
    return this.http.get<Array<CdeBloque>>(`${environment.apiUrl}/ListeCdeBloqueesstk.php`, {
      params: {
        fitreregion: this.filtreRegion
      }
    }).subscribe(
      (data) => {
        this.cdeBloques = data;
        this.regionSelected = this.saf.getFiltre('cdeBloque', 'region', 'includes') as Array<string> || [];
        this.cdeBloques$.next(this.saf.filtrer('cdeBloque', this.cdeBloques));
        this.cdeBloques$.subscribe(d => {
          this.dataSource.data = d;
        });
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      },
      (error) => {
        console.log(error);
      })
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  onSearch(target: string, type: string, method: string, event: string, values?: string): void {
    if (values) {
      setTimeout(() => this.cdeBloques$.next(this.saf.onFiltre('cdeBloque', target, type, method, this[values], this.cdeBloques)), 1);
    } else {
      setTimeout(() => this.cdeBloques$.next(this.saf.onFiltre('cdeBloque', target, type, method, event['target'].value != null ? event['target'].value : event['target'].innerText, this.cdeBloques)), 1);
    }
  }

  resetOneFilters(filter: string) {
    // RESET ONE FILTERS
    this.formFiltre.get(filter).setValue('');
    this.saf.resetFiltre('cdeBloque', filter + 'includes');
    this.cdeBloques$.next(this.saf.filtrer('client', this.cdeBloques))
  }

  handleRowClick(column: string, numClient: string) {
    if (column != 'risqueGlobal') {
      const url = this.router.serializeUrl(
        this.router.createUrlTree(['/client-detail', numClient], {
          queryParams: {display: 'commande'}
        })
      );
      window.open(url, '_blank');
    }
  }

  get region(): Array<any> {
    let region = [];
    this.cdeBloques.forEach((e) => {
      region.push(e.region);
    });
    region = region.filter((x, i) => region.indexOf(x) === i);
    return region;
  }
}
