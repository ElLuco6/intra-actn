import { Component, OnDestroy, OnInit, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { Client } from "@/models";
import { LogClientService } from "@services/log-client.service";
import { BehaviorSubject, Subject, debounceTime } from "rxjs";
import { FormBuilder } from "@angular/forms";
import { SortAndFilterService } from "@services/sort-and-filter.service";
import { Router } from "@angular/router";
import { MatTableDataSource } from "@angular/material/table";
import { MatSort } from "@angular/material/sort";
import { MatPaginator } from "@angular/material/paginator";
import { ExposeHeightSetterDirective } from "@components/_util/directives/expose-height-setter.directive";
import { SelectionModel } from "@angular/cdk/collections";
import * as XLSX from "xlsx";
import { ClientsService } from "@services/clients.service";
import { MatDialog } from "@angular/material/dialog";
import { CampagnesService } from "@services/campagnes.service";
import { FilterService } from "@services/filter.service";
import { Filter, FilterControl } from "@models/filter";
@Component({
  selector: 'app-clients',
  templateUrl: './clients.component.html',
  styleUrls: ['./clients.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClientsComponent implements OnInit, OnDestroy {

  filtreControls: FilterControl = {};
  filtres: Filter[] = [];
  displayedColumns: string[] = ['select', 'numclient', 'type', 'bouboule', 'nom', 'adresse1', 'codepostal', 'ville', 'groupe', 'origine', 'telephone', 'note', 'connexion'];
  displayedColumnsSmall: string[] = ['numClient', 'nom', 'connexion'];
  dataSource = new MatTableDataSource<Client>();
  originalData: Client[] = [];
  caIsFiltered: boolean = false;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild('client-table', { read: ExposeHeightSetterDirective }) exposeHeightSetter: ExposeHeightSetterDirective;

  selection = new SelectionModel<Client>(true, []);
  private _destroy$ = new Subject<void>();
  filtreCa = this.fb.group({
    dateCa: [['']],
    caMin: '',
    caMax: ''
  });

  region: string;
  page = new BehaviorSubject<boolean>(false);
  dateCa = [];

  constructor(
    public logClient: LogClientService,
    private fb: FormBuilder,
    public saf: SortAndFilterService,
    private router: Router,
    private clientsService: ClientsService,
    public dialog: MatDialog,
    protected campagnesService: CampagnesService,
    private filterService: FilterService
  ) { }

  get pageSize() {
    return this.page.value;
  }

  getDateCa() {
    let date = [];
    this.dataSource.data.forEach((e) => {
      Object.keys(e).forEach((d) => {
        if (d.startsWith('20')) {
          date.push(d);
        }
      });
    });
    this.dateCa = [...new Set(date)];
  }

  ngOnInit(): void {
    this.clientsService.getClients().subscribe((data) => {
      this.dataSource.data = data;
      this.originalData = data;
      this.initializeFilters();
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    });
  }

  initializeFilters() {
    const filtersNamesAndTypes = [
      { name: 'cle', type: 'input', displayName: 'N°Client' },
      { name: 'nom', type: 'input', displayName: 'Société' },
      { name: 'region', type: 'select' },
      { name: 'departementlib', type: 'select', displayName: 'Departement' },
      { name: 'codepostal', type: 'input', displayName: 'Code postal'},
      { name: 'ville', type: 'select' },
      { name: 'telephone', type: 'input', displayName: 'N°Telephone' },
      { name: 'groupe', type: 'select' },
      { name: 'origine', type: 'select' },
      { name: 'note', type: 'select' },
      { name: 'siren', type: 'input' },
      { name: 'type', type: 'select' },
      { name: 'majcolor', type: 'maj', displayName: 'Maj' },
      { name: 'actifcolor', type: 'actif', displayName: 'Actif' },
      { name: 'datecreation', type: 'date', displayName: 'Date creation (à partir du)' }
    ];

    const { filtres, filtreControls } = this.filterService.initFiltres(this.dataSource, filtersNamesAndTypes);
    this.filtres = filtres;
    this.filtreControls = filtreControls;

    this.filtreControls['region'].valueChanges.pipe(debounceTime(300)).subscribe(selectedRegions => {
      this.filtres.find(filtre => filtre.control === 'departementlib').options = this.filterService.filterDepartments(this.dataSource.data, selectedRegions);
      const selectedDepartements = this.filtreControls['departementlib'].value;
      this.filtres.find(filtre => filtre.control === 'ville').options = this.filterService.filterVilles(this.dataSource.data, selectedRegions, selectedDepartements);
    });

    this.filtreControls['departementlib'].valueChanges.pipe(debounceTime(300)).subscribe(selectedDepartements => {
      const selectedRegions = this.filtreControls['region'].value;
      this.filtres.find(filtre => filtre.control === 'ville').options = this.filterService.filterVilles(this.dataSource.data, selectedRegions, selectedDepartements);
    });

    this.getDateCa();
  }

  ngOnDestroy() {
    this._destroy$.next();
    this._destroy$.complete();
  }

  caFilter(date: Array<string>, caMin, caMax): void {
    this.dataSource.data = this.filterService.filterCa([date, caMin, caMax], this.dataSource.data);
    this.caIsFiltered = true;
  }

  cancelCaFilter(): void {
    this.dataSource.data = this.originalData;
    this.caIsFiltered = false;
  }

  openSuiviCA() {
    const url = this.router.serializeUrl(
      this.router.createUrlTree(['/espace-commercial/suivi-activite/suivi-ca'])
    );
    window.open(url, '_blank');
  }

  isAllSelected() {
    return this.selection.selected.length === this.dataSource.data.length;
  }

  toggleAllRows() {
    this.isAllSelected() ? this.selection.clear() : this.selection.select(...this.dataSource.filteredData);
  }

  checkboxLabel(row?: Client): string {
    return row ? `${this.selection.isSelected(row) ? 'deselect' : 'select'}` : `${this.isAllSelected() ? 'deselect' : 'select'} all`;
  }

  openInNewWindow(client: any) {
    const url = client.type === "CLIENT"
      ? this.router.serializeUrl(this.router.createUrlTree(['/client-detail/' + client.cle]))
      : this.router.serializeUrl(this.router.createUrlTree([`espace-commercial/prospects/detail/${client.cle}/`]));
    window.open(decodeURIComponent(url), '_blank');
  }

  exportToExcel(): void {
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.selection.selected);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Clients-Prospect');
    XLSX.writeFile(wb, 'Clients-Prospect.xlsx');
  }
}
