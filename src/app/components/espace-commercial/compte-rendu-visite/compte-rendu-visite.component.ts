import {Component, OnInit, ViewChild} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {environment} from "@env/environment";
import {MatTableDataSource} from "@angular/material/table";
import {CompteRenduVisite} from "@models/compteRenduVisite";
import {BehaviorSubject} from "rxjs";
import {MatPaginator} from "@angular/material/paginator";
import {MatSort} from "@angular/material/sort";
import {FormBuilder} from "@angular/forms";
import {SortAndFilterService} from "@services/sort-and-filter.service";
import {DatePipe} from "@angular/common";
import {Router} from "@angular/router";
import {Rma} from "@models/rma";
import {animate, state, style, transition, trigger} from "@angular/animations";
import * as XLSX from 'xlsx';
import {SelectionModel} from "@angular/cdk/collections";
import {DomSanitizer} from "@angular/platform-browser";
import {ExportToXslService} from "@services/export-to-xsl.service";
import {CampagnesService} from "@services/campagnes.service";
import {VisiteService} from "@services/visite.service";

@Component({
  selector: 'app-compte-rendu-visite',
  templateUrl: './compte-rendu-visite.component.html',
  styleUrls: ['./compte-rendu-visite.component.scss'],
  providers: [DatePipe],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ]
})
export class CompteRenduVisiteComponent implements OnInit {
  displayedColumns: string[] = ['select', 'dateFormated', 'user', 'action', 'type', 'client', 'nom', 'mail', 'tel', 'contact', 'contacttel', 'contactmail'];
  displayedColumnsEnBasLa: string[] = [...this.displayedColumns, 'expand'];
  expandedElement: Rma | null;
  dataSource = new MatTableDataSource<CompteRenduVisite>();
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  compteRebdu$ = new BehaviorSubject<Array<CompteRenduVisite>>([]);
  regionSelected: Array<string> = [];
  depSelected: Array<string> = [];
  compteRenduVisite: CompteRenduVisite[] = []
  selection = new SelectionModel<CompteRenduVisite>(true, []);
  actions: Array<any> = [];
  departements: Array<any> = [];
  regions: Array<any> = [];
  filtresForm = this.fb.group({
    region: [],
    departement: [],
    action: [],
    type: []
  })
  filterValue = '';

  constructor(
    private http: HttpClient,
    private fb: FormBuilder,
    private saf: SortAndFilterService,
    private router: Router,
    protected exportToXsl: ExportToXslService,
    protected campagnesService: CampagnesService,
    private visite: VisiteService
  ) {
  }

  ngOnInit(): void {
    this.visite.getAllVisite().subscribe((data) => {
      this.compteRenduVisite = [...data.clients, ...data.prospects];
      this.compteRebdu$.next(this.compteRenduVisite);
      this.compteRebdu$.subscribe((d) => {
        this.formatDate(d);
        this.dataSource.data = d;
      });
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
      this.getRegion();
      this.getDepartement();
      this.getAction();
      this.initFiltre();
    })
  }

  formatDate(data: CompteRenduVisite[]) {
     data.map((d) => {
      let date = d.date.split('/');
      d.dateFormated = new Date(Number(date[2]) + 2000, Number(date[1]) - 1, Number(date[0]));
    })
  }

  initFiltre() {
    const searchParams = [
      {key: 'region', type: 'array', method: 'includes'},
      {key: 'departement', type: 'array', method: 'includes'},
      {key: 'action', type: 'array', method: 'includes'},
      {key: 'type', type: 'array', method: 'includes'}
    ];

    searchParams.forEach(param => {
      this.filtresForm.get(param.key).valueChanges.subscribe(value => {
        this.onSearch(param.key, param.type, param.method, value, value);
      });
    });
  }

  getRegion() {
    this.regions = [];
    this.compteRenduVisite.forEach((e) => {
      if (e.region != '') {
        this.regions.push(e.region);
      }
    });
    this.regions = this.regions.filter((x, i) => this.regions.indexOf(x) === i);
  }

  getAction() {
    this.actions = [];
    this.compteRenduVisite.forEach((e) => {
      if (e.action != '') {
        this.actions.push({action: e.action, lib: e.actionlib});
      }
    });
    this.actions = this.actions.filter((x, i, self) =>
        i === self.findIndex((t) => (
          t.action === x.action && t.lib === x.lib
        ))
    )
  }

  openInOtherWindow(client: string, type: string) {
    let url: string = '';
    if(type == 'PROSPE'){
      url = this.router.serializeUrl(
        this.router.createUrlTree(['/espace-commercial/prospects/detail/' + client])
      );
    }else{
      url = this.router.serializeUrl(
        this.router.createUrlTree(['/client-detail/' + client])
      );
    }

    window.open(decodeURIComponent(url), '_blank');
  }

  getDepartement() {
    this.departements = [];
    this.compteRenduVisite.forEach((e) => {
      if (e.departement != '') {
        this.departements.push(e.departement);
      }
    });
    this.departements = this.departements.filter((x, i) => this.departements.indexOf(x) === i);
    this.departements.sort();
  }

  applyFilter(event: Event) {
    this.filterValue = (event.target as HTMLInputElement).value.trim();
    this.dataSource.filter = this.filterValue;
  }

  start(mot: string): string {
    const index = mot.indexOf(this.filterValue);
    return index !== -1 ? mot.slice(0, index) : mot;
  }

  end(mot: string): string {
    const index = mot.indexOf(this.filterValue);
    return index !== -1 ? mot.slice(index + this.filterValue.length) : '';
  }

  onSearch(target: string, type: string, method: string, event: any, values?: string): void {
    if (values) {
      setTimeout(() => this.compteRebdu$.next(this.saf.onFiltre('commande', target, type, method, values, this.compteRenduVisite)), 1);
    } else {
      setTimeout(() => this.compteRebdu$.next(this.saf.onFiltre('commande', target, type, method, event['target'].value != null ? event['target'].value : event['target'].innerText, this.compteRenduVisite)), 1);
    }
  }

  openInNewWindow(client) {
    const url = this.router.serializeUrl(
      this.router.createUrlTree(['/client-detail/' + client])
    );
    window.open(decodeURIComponent(url), '_blank');
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

  checkboxLabel(row?: CompteRenduVisite): string {
    if (!row) {
      return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'}`;
  }
}
