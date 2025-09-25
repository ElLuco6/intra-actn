import {ChangeDetectorRef, Component, inject, ViewChild} from '@angular/core';
import {CampagnesService} from "@services/campagnes.service";
import {ActivatedRoute, Router} from "@angular/router";
import {Campagne} from "@models/campagne";
import {MatDialog} from "@angular/material/dialog";
import {
  ConfirmationDeleteDialogComponent
} from "@components/_util/components/confirmation-delete-dialog/confirmation-delete-dialog.component";
import {PeopleOfCampaign} from "@models/peopleOfCampaign";
import {MatTableDataSource} from "@angular/material/table";
import {MatSort} from "@angular/material/sort";
import {animate, state, style, transition, trigger} from "@angular/animations";
import {forkJoin} from "rxjs";
import * as XLSX from "xlsx";
import {MatPaginator} from "@angular/material/paginator";
import {VisiteService} from "@services/visite.service";
import {FilterService} from "@services/filter.service";
import {Filter, FilterControl} from "@models/filter";
import {SelectionModel} from '@angular/cdk/collections';
import {
  ImporterProspectsNonQualifiesComponent
} from './importer-prospects-non-qualifies/importer-prospects-non-qualifies.component';
import {RenduCampaign} from "@models/renduCampaign";
import {XlsFormatterService} from "@services/xls-formatter.service";

@Component({
  selector: 'app-campagne-detail',
  templateUrl: './campagne-detail.component.html',
  styleUrl: './campagne-detail.component.scss',
  animations: [
    trigger('detailExpand', [
      state('collapsed,void', style({height: '0px', minHeight: '0'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ])
  ],
})
export class CampagneDetailComponent {
  readonly importerProspectsNonQualifiesDialog = inject(MatDialog);

  state: 'default' | 'hover' | 'active' = 'default';

  displayedColumns: string[] = ['select', 'raisonSociale', 'appel', 'type', 'numero', 'adresse', 'codepostal', 'ville', 'region', 'steAppel', 'phoning'];

  columnsToDisplayWithExpand = [...this.displayedColumns, 'expand'];

  expandedElement: PeopleOfCampaign | null;

  idCampagne: string;

  campagne: Campagne;

  peoples = new MatTableDataSource<PeopleOfCampaign>;

  selection = new SelectionModel<PeopleOfCampaign>(true, []);

  @ViewChild(MatPaginator) paginator: MatPaginator;

  @ViewChild(MatSort) sort: MatSort;

  savedSort: MatSort;

  displayedColumns2: string[] = ['nom', 'email', 'gsm', 'telephone', 'service', 'statut'];

  renduCampaign: MatTableDataSource<RenduCampaign> = new MatTableDataSource();

  filtreControls: FilterControl = {};

  filtreControlsCompteRendu: FilterControl = {};

  filtres: Filter[] = [];

  filtresCompteRendu: Filter[] = [];

  affichageDoc: boolean = false;

  affichageCompteRendu: boolean = false;

  constructor(private campagnesService: CampagnesService,
              private route: ActivatedRoute,
              private router: Router,
              public dialog: MatDialog,
              private visiteService: VisiteService,
              private filterService: FilterService,
              private cdr: ChangeDetectorRef,
              private xlsFormatterService: XlsFormatterService) {
    route.params.subscribe(params => {
      this.idCampagne = params['id'];
    });
    forkJoin({
      campagneArr: this.campagnesService.getCampagneById(this.idCampagne),
      peoples: this.campagnesService.getPeopleByCampaign(this.idCampagne),
      renduCampaign: this.visiteService.countVisiteByCampaign(this.idCampagne)
    }).subscribe(({campagneArr, peoples, renduCampaign}) => {
      const {
        campagne: campagneName,
        datedeb,
        datefin,
        libelle,
        texte,
        user,
        user1,
        user2,
        user3,
        user4,
        nbrSocietes
      } = campagneArr[0];
      this.campagne = new Campagne(campagneName, datedeb, datefin, libelle, texte, user, user1, user2, user3, user4, nbrSocietes);
      this.campagnesService.changeCampaign(this.campagne);
      this.renduCampaign = new MatTableDataSource(this.campagnesService.groupCompteRendu([...renduCampaign.clients, ...renduCampaign.prospects]));
      //this.visiteService.calculerNbSocietesContactees(this.renduCampaign.data);

      const groupedContacts = Object.values(this.campagnesService.groupContacts(peoples));

      this.peoples.data = groupedContacts;

      this.cdr.detectChanges();
      setTimeout(() => {
        this.peoples.paginator = this.paginator;
        this.peoples.sort = this.sort;
      });


      const filtersNamesAndTypes = [
        {name: 'raisonSociale', type: 'input', displayName: 'Raison Sociale'},
        {name: 'appel', type: 'select', displayName: 'Statut'},
        {name: 'numero', type: 'input', displayName: 'N°Client'},
        {name: 'region', type: 'select'},
        {name: 'ville', type: 'select'},
        {name: 'codepostal', type: 'input', displayName: 'Code Postal'}
      ];
      const {filtres, filtreControls} = this.filterService.initFiltres(this.peoples, filtersNamesAndTypes);
      this.filtres = filtres;
      this.filtreControls = filtreControls;

      const filtersCmptRendu = [
        {name: 'texte', type: 'input', displayName: 'Commentaire'},
        {name: 'numclient', type: 'input', displayName: 'N° Client'},
        {name: 'user', type: 'select', displayName: 'Commercial'},
        {name: 'appel', type: 'select', displayName: 'Statut'}
      ];
      const {
        filtres: filtres2,
        filtreControls: filtreControls2
      } = this.filterService.initFiltres(this.renduCampaign, filtersCmptRendu);
      this.filtresCompteRendu = filtres2;
      this.filtreControlsCompteRendu = filtreControls2;

      this.campagnesService.changePeople(groupedContacts);

      this.preRemplirFiltres();
      this.preRemplirSelection();
    });
  }

  affichageDocChange(type: string) {
    if (type == 'doc') {
      this.affichageDoc = !this.affichageDoc;
      if (this.affichageDoc) {
        this.affichageCompteRendu = false;
      }
    } else {
      if (!this.affichageCompteRendu) {
        this.savedSort = this.sort;
      }
      this.affichageCompteRendu = !this.affichageCompteRendu;
      if (this.affichageDoc) {
        this.affichageDoc = false;
      }
    }
    this.resetPagination();
  }

  resetPagination() {
    this.cdr.detectChanges();
    setTimeout(() => {
      this.peoples.paginator = this.paginator;
      this.peoples.sort = this.sort;
    });
  }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.peoples.filteredData.length;
    return numSelected === numRows;
  }

  toggleAllRows() {
    if (this.isAllSelected()) {
      this.selection.clear();
      return;
    }

    this.selection.select(...this.peoples.filteredData);
  }

  checkboxLabel(row?: PeopleOfCampaign): string {
    if (!row) {
      return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} ${row.numero}`;
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(ConfirmationDeleteDialogComponent, {
      width: '350px',
      data: "Voulez-vous vraiment supprimer cette campagne ?"
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.deleteCampagne();
      }
    });
  }

  deleteCampagne() {
    this.campagnesService.deleteCampagne(this.idCampagne).subscribe(() => {
      this.router.navigate(['/espace-commercial/campagne']);
    });
  }

  goToClientDetail(idClient: string, type: string) {
    let url = '';
    if (type == 'C') {
      url = this.router.serializeUrl(
        this.router.createUrlTree(['/client-detail/' + idClient])
      );
    } else {
      url = this.router.serializeUrl(
        this.router.createUrlTree(['/espace-commercial/prospects/detail/' + idClient])
      );
    }
    window.open(decodeURIComponent(url), '_blank');
  }

  goToPhoning(idClient: string) {
    this.router.navigate(['/espace-commercial/campagne/' + this.idCampagne + '/phoning/' + idClient]).then(() => {
      const start = Date.now();
      const animation = setInterval(() => {
        const timePassed = Date.now() - start;
        if (timePassed >= 600) {
          window.scrollTo(0, 0);
          clearInterval(animation);
        } else {
          let currentScroll = window.scrollY;
          window.scrollTo(0, currentScroll - (currentScroll * (timePassed / 600)));
        }
      }, 16.6);
    });
  }

  preRemplirFiltres() {
    const filtresCampagnes = JSON.parse(localStorage.getItem('filtresCampagnes')) || [];
    const campagneFiltres = filtresCampagnes.find(campagne => campagne.idCampagne === this.idCampagne);

    if (campagneFiltres) {
      for (const key in campagneFiltres.filtres) {
        if (this.filtreControls.hasOwnProperty(key)) {
          this.filtreControls[key].setValue(campagneFiltres.filtres[key]);
          if (campagneFiltres.sorting) {
            this.sort.active = campagneFiltres.sorting.active;
            this.sort.direction = campagneFiltres.sorting.direction;
          }
        }
      }
    }
  }

  preRemplirSelection() {
    const phoningSelection = JSON.parse(localStorage.getItem('phoningSelection')) || [];
    const selectedIds = phoningSelection.find(campagne => campagne.idCampagne === this.idCampagne)?.ids;

    this.peoples.data.forEach(people => {
      if (selectedIds && selectedIds.includes(people.numero)) {
        this.selection.select(people);
      }
    });
  }

  commencerLePhoning() {
    if (this.affichageDoc) {
      this.affichageDocChange('doc');
    }

    this.enregistrerFiltres();
    this.enregistrerSelection();

    if (this.selection.selected.length === 0) {
      alert("Vous devez sélectionner au moins un client pour commencer le phoning");
      return;
    } else {
      this.router.navigate(['/espace-commercial/campagne/' + this.idCampagne + '/phoning']);
    }
  }

  enregistrerFiltres() {
    const filtresValues = {};
    for (const key in this.filtreControls) {
      if (this.filtreControls.hasOwnProperty(key)) {
        filtresValues[key] = this.filtreControls[key].value;
      }
    }
    let sortValues;
    if (this.affichageCompteRendu) {
      sortValues = {
        active: this.savedSort.active,
        direction: this.savedSort.direction
      };
    } else {
      sortValues = {
        active: this.sort.active,
        direction: this.sort.direction
      };
    }

    let filtresCampagnes = JSON.parse(localStorage.getItem('filtresCampagnes')) || [];

    const existingIndex = filtresCampagnes.findIndex(campagne => campagne.idCampagne === this.idCampagne);

    if (existingIndex !== -1) {
      filtresCampagnes[existingIndex].filtres = filtresValues;
      filtresCampagnes[existingIndex].sorting = sortValues;
    } else {
      filtresCampagnes.push({
        idCampagne: this.idCampagne,
        filtres: filtresValues,
        sorting: sortValues
      });
    }

    localStorage.setItem('filtresCampagnes', JSON.stringify(filtresCampagnes));
  }

  enregistrerSelection() {
    let selectedIds = [];

    this.selection.selected.forEach(selected => {
      selectedIds.push(selected.numero);
    });

    let phoningSelection = JSON.parse(localStorage.getItem('phoningSelection')) || [];

    const existingIndex = phoningSelection.findIndex(campagne => campagne.idCampagne === this.idCampagne);

    if (existingIndex !== -1) {
      phoningSelection[existingIndex].ids = selectedIds;
    } else {
      phoningSelection.push({
        idCampagne: this.idCampagne,
        ids: selectedIds
      });
    }

    localStorage.setItem('phoningSelection', JSON.stringify(phoningSelection));
  }

  resetFiltresEtSelection() {
    let filtresCampagnes = JSON.parse(localStorage.getItem('filtresCampagnes')) || [];
    filtresCampagnes = filtresCampagnes.filter(campagne => campagne.idCampagne !== this.idCampagne);
    localStorage.setItem('filtresCampagnes', JSON.stringify(filtresCampagnes));

    let phoningSelection = JSON.parse(localStorage.getItem('phoningSelection')) || [];
    phoningSelection = phoningSelection.filter(campagne => campagne.idCampagne !== this.idCampagne);
    localStorage.setItem('phoningSelection', JSON.stringify(phoningSelection));

    location.reload();
  }

  openImporterProspectsNonQualifiesDialog() {
    this.importerProspectsNonQualifiesDialog.open(ImporterProspectsNonQualifiesComponent, {
      width: '600px',
      data: {idCampagne: this.idCampagne}
    });
  }

  exportContactsToExcel(): void {
    const lignes: any[] = [];

    this.selection.selected.forEach(company => {
      const {contacts, ...companyData} = company;
      if (contacts && contacts.length > 0) {
        contacts.forEach(contact => {
          lignes.push({...companyData, ...contact});
        });
      } else {
        lignes.push(companyData);
      }
    });

    let aoa: any[][];

    if (lignes && lignes.length > 0) {
      aoa = this.xlsFormatterService.jsonToAoA(lignes);
    } else {
      aoa = this.xlsFormatterService.jsonToAoA([{erreur: 'aucun contact trouvé'}]);
    }
    const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(aoa);
    this.xlsFormatterService.autoFitColumns(ws, aoa);

    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Campagne_' + this.idCampagne);
    XLSX.writeFile(wb, 'Campagne_' + this.idCampagne + '.xlsx');
  }

  exportVisitesToExcel(): void {
    const listeCR = [];
    this.renduCampaign.data.forEach((element: any) => {
        if (this.selection.selected.map(client => client.numero).includes(element.numclient)) {
          element.rendus.forEach((rendu: any) => {
            const {rendus, ...elementWithoutRendus} = element;

            listeCR.push({
              ...elementWithoutRendus,
              nom: rendu.nom,
              mail: rendu.mail,
              date: rendu.date,
              appel: rendu.appellib,
              appelcode: rendu.appelcode,
              gsm: rendu.gsm,
              texte: rendu.texte,
              user: rendu.user,
            });
          });
        }
      }
    );

    let aoa: any[][];

    if (listeCR && listeCR.length > 0) {
      aoa = this.xlsFormatterService.jsonToAoA(listeCR);
    } else {
      aoa = this.xlsFormatterService.jsonToAoA([{erreur: 'aucun compte rendu trouvé'}]);
    }
    const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(aoa);
    this.xlsFormatterService.autoFitColumns(ws, aoa);

    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Campagne_' + this.idCampagne);
    XLSX.writeFile(wb, 'Campagne_' + this.idCampagne + '.xlsx');
  }
}

