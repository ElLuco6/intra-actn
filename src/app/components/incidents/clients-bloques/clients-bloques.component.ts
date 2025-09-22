import {AfterViewInit, Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {environment} from "@env/environment";
import {HttpClient} from "@angular/common/http";
import {ActivatedRoute, Router} from "@angular/router";
import {ClientsBloques} from "@models/clientsBloques";
import {MatTableDataSource} from "@angular/material/table";
import {BehaviorSubject, Subject, takeUntil} from "rxjs";
import {MatSort} from "@angular/material/sort";
import {MatPaginator} from "@angular/material/paginator";
import {SortAndFilterService} from "@services/sort-and-filter.service";
import {skip} from "rxjs/operators";
import {FilterService} from "@services/filter.service";
import {Filter, FilterControl} from "@models/filter";

@Component({
  selector: 'app-clients-bloques',
  templateUrl: './clients-bloques.component.html',
  styleUrls: ['./clients-bloques.component.scss']
})
export class ClientsBloquesComponent implements OnInit, OnDestroy{
  displayedColumns: string[] = ['nom', 'numclient', 'adresse', 'telephone', 'info-finance', 'blocage'];
  dataSource = new MatTableDataSource<ClientsBloques>();
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  listClientBloque: ClientsBloques[] = [];
  filtreRegion: string = '';
  listClientsBloques$ = new BehaviorSubject<Array<ClientsBloques>>([]);
  private _destroy$ = new Subject<void>();
  type: string = '';
  regionSelected: Array<string> = [];

  filtreControls: FilterControl = {};

  filtres: Filter[] = [];

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private saf: SortAndFilterService,
    private router: Router,
    private filterService: FilterService
  ) {
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.filtreRegion = params['region'];
      this.type = params['type'];
    });

    if(this.type == 'encours'){
      this.getClientsEncours()
    }else {
      this.getClientsBloques();
    }
    this.listClientsBloques$
      .pipe(skip(1), takeUntil(this._destroy$))
      .subscribe(() => { });
  }

  openTab(client) {
    const url = this.router.serializeUrl(
      this.router.createUrlTree(['/client-detail', client], {
        queryParams: { display: 'finance' }
      })
    );
    window.open(url, '_blank');
  }

  ngOnDestroy() {
    this._destroy$.next();
    this._destroy$.complete();
  }

  getClientsBloques() {
    return this.http.get<Array<ClientsBloques>>(`${environment.apiUrl}/ListeclientsBloques.php`, {
      params: {
        fitreregion: this.filtreRegion
      }
    }).subscribe(
      (data) => {
        this.listClientBloque = data;
        this.listClientsBloques$.next(this.saf.filtrer('client-bloques', this.listClientBloque));
        this.listClientsBloques$.subscribe((d) => {
          this.dataSource.data = d;
        });
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.initFilters();
      });
  }

  getClientsEncours() {
    return this.http.get<Array<ClientsBloques>>(`${environment.apiUrl}/ListeclientsEncours.php`, {
      params: {
        fitreregion: this.filtreRegion
      }
    }).subscribe(
      (data) => {
        this.listClientBloque = data;
        this.listClientsBloques$.next(this.saf.filtrer('client-bloques', this.listClientBloque));
        this.listClientsBloques$.subscribe((d) => {
          this.dataSource.data = d;
        });
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.initFilters();
      })
  }

  initFilters() {
    const filtersNamesAndTypes = [
      { name: 'numclient', type: 'input', displayName: 'N°Client' },
      { name: 'nom', type: 'input', displayName: 'Nom' },
      { name: 'region', type: 'select', displayName: 'Region' },
    ];

    const { filtres, filtreControls } = this.filterService.initFiltres(this.dataSource, filtersNamesAndTypes);
    this.filtres = filtres;
    this.filtreControls = filtreControls;
  }

}
