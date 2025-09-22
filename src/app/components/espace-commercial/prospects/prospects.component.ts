import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {ProspectService} from "@services/prospect.service";
import {Prospect} from "@models/prospect";
import {MatTableDataSource} from "@angular/material/table";
import {MatPaginator} from "@angular/material/paginator";
import {MatSort} from "@angular/material/sort";
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {DatePipe, formatDate} from "@angular/common";
import {FonctionUser} from "@models/fonctionUser";
import {SortAndFilterService} from "@services/sort-and-filter.service";
import {BehaviorSubject} from "rxjs";
import {map, tap} from "rxjs/operators";
import {SelectionModel} from "@angular/cdk/collections";
import {CampagnesService} from "@services/campagnes.service";
import {ExportToXslService} from "@services/export-to-xsl.service";

@Component({
  selector: 'app-prospects',
  templateUrl: './prospects.component.html',
  styleUrls: ['./prospects.component.scss']
})
export class ProspectsComponent implements OnInit {

  displayedColumns: string[] = ['select', 'activite', 'siret', 'nom', 'adresse1', 'codepostal', 'ville', 'region', 'telephone', 'action'];
  selection = new SelectionModel<Prospect>(true, []);
  dataSource: MatTableDataSource<Prospect> = new MatTableDataSource<Prospect>();

  @ViewChild(MatPaginator) paginator: MatPaginator;

  @ViewChild(MatSort) sort: MatSort;

  popUpModif: boolean = false;

  maxDate: Date;

  fontions: Array<FonctionUser> = [];

  processedProspect$ = new BehaviorSubject<Array<Prospect>>([]);
  listProspect: any[] = [];
    formSearch = new FormGroup({
    regionFiltre : new FormControl(''),
    majFiltre : new FormControl(''),
    actifFiltre : new FormControl(''),
    majcolor: new FormControl(''),
    actifcolor: new FormControl('')

  });
 /*  regionFiltre = new FormControl('');
  majFiltre = new FormControl('');
  actifFiltre = new FormControl(''); */
  listOfRegion: any[] = [];
  nbProspect: number = 0;

  constructor(
    public prospectService: ProspectService,
    private fb: FormBuilder,
    private datePipe: DatePipe,
    private saf: SortAndFilterService,
    protected campagnesService: CampagnesService,
    protected exportXls: ExportToXslService
  ) {
    const processProspects = (prospects: Prospect[]) => {
      return this.saf.filtrer('client', prospects);
    };

    const getRegions = (prospects: Prospect[]) => {
      return Array.from(new Set(prospects.filter(p => p.region !== '').map(p => p.region)));
    };

    this.prospectService.getProspects()
      .pipe(
        tap((prospects: Prospect[]) => {
          this.listProspect = prospects;
          this.listOfRegion = getRegions(prospects);
        }),
        map(processProspects),
      )
      .subscribe((processedProspects) => {
        this.processedProspect$.next(processedProspects);

        this.dataSource.data = processedProspects;
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;

        this.processedProspect$.subscribe((d) => {
          this.dataSource.data = d;
        });
      });
    this.processedProspect$.subscribe((d) => {
      this.nbProspect = d.length;
    });

    prospectService.getFunc().subscribe((data) => {
      data.forEach((d) => {
        if(d.argument != '' && d.argument != ' '){
          this.fontions.push(d);
        }
      });
    });

  }

  formUpdateProspect = this.fb.group({
    numSiret: ['', [Validators.required, Validators.maxLength(14), Validators.minLength(9), Validators.pattern(/^[0-9]{9,14}$/)]],
    nomSociete: ['', Validators.required],
    adresse: '',
    numTelephone: ['', [Validators.required, Validators.maxLength(15), Validators.pattern(/^[0-9+_-]{1,15}$/)]],
    nom: '',
    prenom: '',
    fonction: '',
    mail: '',
    numApe: '',
    origine: '',
    dateRecrutement: formatDate(new Date(), 'yyy-mm-dd', 'en'),
    region: ['', Validators.required],
    siteWeb: '',
    departement: '',
    codePostal: ['', [Validators.required, Validators.maxLength(5), Validators.pattern(/^[0-9]{5}$/)]],
    ville: ['', [Validators.required, Validators.maxLength(30), Validators.pattern(/^[a-zA-Z0-9 éèêàâîïÉÈÊÀÂÎÏ'-]{1,30}$/)]],
    qualite: '',
    interlocuteur: '',
    ste: '',
    activite: '',
    commentaire: '',
    numprospect: ''
  })

  ngOnInit() {
    this.formSearch = this.fb.group({
      regionFiltre: [''],
      majFiltre: [''],
      actifFiltre: [''],
      actifcolor: [''],
      majcolor: [''],
    })

    this.maxDate = new Date();

    this.formSearch.get('regionFiltre').valueChanges.subscribe(value => {
      this.onSearch('region', 'array', 'includes', value, value);
    });
    this.formSearch.get('majFiltre').valueChanges.subscribe(value => {
      this.onSearch('majcolor', 'array', 'includes', value, value);
    });
    this.formSearch.get('actifFiltre').valueChanges.subscribe(value => {
      this.onSearch('actifcolor', 'array', 'includes', value, value);
    });

  }

  onSearch(target: string, type: string, method: string, event: any, values?: string): void{
    if (values) {
      setTimeout(() => this.processedProspect$.next(this.saf.onFiltre('client', target, type, method, values, this.listProspect)), 1);
    } else {
      setTimeout(() => this.processedProspect$.next(this.saf.onFiltre('client', target, type, method, event['target'].value != null ? event['target'].value : event['target'].innerText, this.listProspect)), 1);
    }
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  setUpdateForm(row){
    this.popUpModif = true;
    this.formUpdateProspect.setValue({
      numSiret: row.siret,
      nomSociete: row.nom ?? '',
      adresse: row.adresse1 ?? '',
      numTelephone: row.telephone ?? '',
      nom: row.contactnom ?? '',
      prenom: row.contactprenom ?? '',
      fonction: row.fonction ?? '',
      mail: row.contactmail ?? '',
      numApe: row.ape ?? '',
      origine: row.originerecrutement ?? '',
      dateRecrutement: row.daterecrutement ?? '',
      region: row.region,
      siteWeb: row.siteweb ?? '',
      departement: row.departement ?? '',
      codePostal: row.codepostal ?? '',
      ville: row.ville ?? '',
      qualite: row.qualite ?? '',
      interlocuteur: '',
      ste: '',
      activite: row.activite ?? '',
      commentaire: row.commentaire ?? '',
      numprospect: row.numprospect
    });
  }

  updateProspect() {
    this.formUpdateProspect.value.dateRecrutement = this.datePipe.transform(new Date(this.formUpdateProspect.value.dateRecrutement), 'yyyy-MM-dd');
      this.prospectService.updProspect(this.formUpdateProspect,).subscribe(() => {
        // Refresh the prospect list after adding
        this.prospectService.getProspects().subscribe(data => {
          this.dataSource = new MatTableDataSource<Prospect>(data);
          setTimeout(() => {
            this.dataSource.paginator = this.paginator;
            this.dataSource.sort = this.sort;
          }, 1000);
          this.popUpModif = false;
        });
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

    this.selection.select(...this.dataSource.data);
  }

  /** The label for the checkbox on the passed row */
  checkboxLabel(row?: Prospect): string {
    if (!row) {
      return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'}`;
  }

  export() {
    this.exportXls.exportToXls(this.selection.selected.map(({ numclient, status, ...rest }) => rest), 'prospects');
  }

}

