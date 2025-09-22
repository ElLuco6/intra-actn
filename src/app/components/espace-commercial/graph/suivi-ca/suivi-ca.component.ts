import {HttpClient} from '@angular/common/http';
import {Component, inject, OnInit, ViewChild} from '@angular/core';
import {Router} from '@angular/router';
import {SelectionModel} from '@angular/cdk/collections';
import {FormBuilder, FormGroup} from '@angular/forms';
import {MatCheckboxChange} from '@angular/material/checkbox';
import {MatDialog} from '@angular/material/dialog';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from "@angular/material/sort";
import {MatTableDataSource} from '@angular/material/table';
import {environment} from '@env/environment';
import {CampagnesService} from '@/services/campagnes.service';
import {ClientsService} from '@/services/clients.service';

import * as XLSX from "xlsx";
import {
  SuiviCADialogComponent
} from '@components/espace-commercial/graph/suivi-ca/suivi-ca-dialog/suivi-ca-dialog.component';
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexDataLabels,
  ApexGrid,
  ApexTitleSubtitle,
  ApexXAxis,
  ApexYAxis,
  ChartComponent
} from 'ng-apexcharts';
import {forkJoin} from 'rxjs';
import {SaveFiltersComponent} from "@components/espace-commercial/graph/suivi-ca/save-filters/save-filters.component";
import {
  SupprimerFiltrageComponent
} from "@components/espace-commercial/graph/suivi-ca/supprimer-filtrage/supprimer-filtrage.component";

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  dataLabels: ApexDataLabels;
  xaxis: ApexXAxis;
  yaxis: ApexYAxis;
  grid: ApexGrid;
  title: ApexTitleSubtitle;
  colors: string[];
};

@Component({
  selector: 'app-suivi-ca',
  templateUrl: './suivi-ca.component.html',
  styleUrl: './suivi-ca.component.scss',
})
export class SuiviCAComponent implements OnInit {
  @ViewChild('chart', {static: false}) chart: ChartComponent;
  @ViewChild(MatSort) sort: MatSort;

  protected readonly Infinity = Infinity;

  chartOptions: ChartOptions;

  years = [];
  selectedYears = [];
  anneesComparables: string[] = [];

  moisDebutDisponibles: string[] = [];
  moisFinDisponibles: string[] = [];

  caAnnee1Map: Map<number, number> = new Map<number, number>();
  caAnnee2Map: Map<number, number> = new Map<number, number>();
  evolutionBruteMap: Map<number, number> = new Map<number, number>();
  prctEvolutionMap: Map<number, number> = new Map<number, number>();

  dataClients: DataClient[][];
  listeClients: InfosClient[] = [];

  regions: string[] = [];
  departements: string[] = [];
  categories: Categorie[] = [];
  marques: Marque[] = [];
  classes: { marque: string, classe: string }[] = [
    {marque: '', classe: ''}
  ];

  displayedColumns: string[] = ['select', 'num', 'nom', 'codepostal', 'ville', 'detail-transactions'];

  filtresForm: FormGroup;

  selection = new SelectionModel<InfosClient>(true, []);

  dataSource = new MatTableDataSource<InfosClient>;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  dialog = inject(MatDialog);

  selectedSavedFilter = null;
  savedFilters: { displayName: string; filtresFormValue: any }[] = [];

  SERIES: { id: string, filtresFormId: string, displayName: string }[] = [
    {id: 'annee', filtresFormId: 'annees', displayName: 'Années'},
    {id: 'commercial', filtresFormId: 'regions', displayName: 'Régions'},
    {id: 'categorieCode', filtresFormId: 'categories', displayName: 'Catégories'},
    {id: 'marque', filtresFormId: 'marques', displayName: 'Marques'},
    {id: 'departement', filtresFormId: 'departements', displayName: 'Départements'}
  ]
  serie: { id: string, filtresFormId: string, displayName: string } = this.SERIES[0];

  MONTHS: string[] = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

  constructor(
    public http: HttpClient,
    private campagnesService: CampagnesService,
    private clientsService: ClientsService,
    private router: Router
  ) {
  }

  ngOnInit() {
    this.filtresForm = new FormBuilder().group({
      annees: [''],
      regions: [''],
      categories: [''],
      marques: [''],
      classes: [''],
      departements: [''],
      num: [''],
      nom: [''],
      codepostal: [''],
      ville: [''],
      anneescomparees: [''],
      moisdebut: [''],
      moisfin: ['']
    });

    const parsed = JSON.parse(localStorage.getItem('suivi-ca-filters') || '[]');
    this.savedFilters = Array.isArray(parsed) ? parsed : [];

    this.getDataClients();
    this.fillChartOptions();
  }

  getDataClients() {
    const currentYear = new Date().getFullYear();
    this.years = [currentYear - 2, currentYear - 1, currentYear];
    this.filtresForm.get('annees')?.setValue(this.years);
    this.selectedYears = this.years;
    forkJoin(this.years.map((year) =>
      this.http.get<DataClient[][]>(`${environment.apiUrl}/SuiviWebCdeClients3.php?annee=${year}`, {
        withCredentials: true,
        responseType: 'json',
      })))
      .subscribe((dataClients) => {
        this.dataClients = dataClients.map((annuel) => annuel[0] ?? []);
        this.getCategories();
        this.getRegions();
      });
  }

  getRegions() {
    this.dataClients.forEach((dataClientsAnnuel) => {
      dataClientsAnnuel.forEach((transaction) => {
        if (!this.regions.includes(transaction.commercial)) {
          this.regions.push(transaction.commercial);
        }
        this.getClasses(transaction);
      });
    });
    this.filtresForm.get('regions')?.setValue(this.regions);
    this.sortClasses();
    this.applyFilters(true);
  }

  getCategories() {
    this.http
      .get<Categorie[]>(`${environment.apiUrl}/ListeCategorieNiv1.php`).subscribe((data) => {
      this.categories = data;
      this.filtresForm.get('categories')?.setValue(data.map((categorie) => categorie.id));
    });
  }

  updateMarques() {
    this.marques = [];
    this.dataSource.data.filter((element) => {
      return this.filtresForm.get('regions')?.value.includes(element.region);
    }).forEach((client) => {
      client.marques.forEach((marque) => {
        if (!this.marques.find((m) => m.marquelib === marque)) {
          this.marques.push({marque: marque, marquelib: marque, sub: []});
        }
      });
    });
    this.marques.sort((a, b) => a.marquelib.localeCompare(b.marquelib));
    const values = this.marques.map((marque) => marque.marquelib);
    this.filtresForm.get('marques')?.setValue(values);
  }

  getClasses(transaction: DataClient) {
    if (!this.classes.some(c => c.marque === transaction.marque && c.classe === transaction.cclasseLib) && transaction.cclasseLib !== '') {
      this.classes.push({marque: transaction.marque, classe: transaction.cclasseLib});
    }
  }

  sortClasses() {
    this.classes.sort((a, b) => {
      const libelleMarqueClasseA = a.marque + ' - ' + a.classe;
      const libelleMarqueClasseB = b.marque + ' - ' + b.classe;
      return libelleMarqueClasseA.localeCompare(libelleMarqueClasseB);
    });
    const values: string[] = this.classes.map((classe) => {
        if (classe.marque === '' && classe.classe === '') {
          return 'Sans classe';
        }
        return classe.marque + ' - ' + classe.classe;
      }
    );
    this.filtresForm.get('classes')?.setValue(values);
  }

  updateDepartements() {
    this.departements = [];
    this.dataSource.data.filter((element) => {
      return this.filtresForm.get('regions')?.value.includes(element.region);
    }).forEach((client) => {
      if (!this.departements.includes(client.departement)) {
        this.departements.push(client.departement);
      }
    });
    this.departements.sort();
    this.filtresForm.get('departements')?.setValue(this.departements.sort());
  }

  fillClientsTable() {
    this.listeClients = [];

    this.selectedYears.forEach(year => {
      this.dataClients[this.years.indexOf(year)].forEach((element) => {
        const existingClient = this.listeClients.find(client => client.num === element.client);

        if (!existingClient) {
          const client: InfosClient = {
            num: element.client,
            nom: element.nom,
            departement: element.departement,
            codepostal: element.codepostal,
            ville: element.ville,
            telephone: element.telephone,
            region: element.commercial,
            categorieCodes: [element.categorieCode],
            marques: [element.marque],
            classes: element.cclasseLib !== '' ? [{marque: element.marque, classe: element.cclasseLib}] : []
          }
          this.listeClients.push(client);
        } else {
          if (!existingClient.categorieCodes.includes(element.categorieCode)) {
            existingClient.categorieCodes.push(element.categorieCode);
          }
          if (!existingClient.marques.includes(element.marque)) {
            existingClient.marques.push(element.marque);
          }
          if (!existingClient.classes.some((c) => c.marque === element.marque && c.classe === element.cclasseLib) && element.cclasseLib !== '') {
            existingClient.classes.push({marque: element.marque, classe: element.cclasseLib});
          }
        }
      });
    });

    this.dataSource = new MatTableDataSource(this.listeClients);
    this.dataSource.paginator = this.paginator;
  }

  updateSelectedYears() {
    this.selectedYears = this.years.filter((year) => this.filtresForm.get('annees')?.value.includes(year));
    this.anneesComparables = this.years.slice(0, -1).map(year => `${year} - ${++year}`);
  }

  resetMonths() {
    const currentDate = new Date();
    const annee2 = this.filtresForm.get('anneescomparees').value.split(' - ')[1];

    if (annee2 == currentDate.getFullYear()) {
      this.moisFinDisponibles = this.MONTHS.slice(0, currentDate.getMonth());
      this.moisDebutDisponibles = this.MONTHS.slice(0, currentDate.getMonth());
    } else {
      this.moisFinDisponibles = this.MONTHS;
      this.moisDebutDisponibles = this.MONTHS;
    }

    this.filtresForm.get('moisdebut').setValue(this.moisDebutDisponibles[0]);
    this.filtresForm.get('moisfin').setValue(this.moisFinDisponibles[this.moisFinDisponibles.length - 1]);
  }

  updateAvailableStartMonths() {
    this.moisDebutDisponibles = this.MONTHS.slice(0, this.MONTHS.lastIndexOf(this.filtresForm.get('moisfin').value) + 1);
  }

  updateAvailableEndMonths() {
    const currentDate = new Date();
    const annee2 = this.filtresForm.get('anneescomparees').value.split(' - ')[1];

    if (annee2 == currentDate.getFullYear()) {
      this.moisFinDisponibles = this.MONTHS.slice(this.MONTHS.lastIndexOf(this.filtresForm.get('moisdebut').value), new Date().getMonth());
    } else {
      this.moisFinDisponibles = this.MONTHS.slice(this.MONTHS.lastIndexOf(this.filtresForm.get('moisdebut').value), this.MONTHS.length);
    }
  }

  getMaxLength(filtre: 'regions' | 'categories' | 'marques' | 'classes' | 'departements') {
    let maxLength: number;
    switch (filtre) {
      case 'regions':
        maxLength = this.regions.length;
        break;
      case 'categories':
        maxLength = this.categories.length;
        break;
      case 'marques':
        maxLength = this.marques.length;
        break;
      case 'classes':
        maxLength = this.classes.length;
        break;
      case 'departements':
        maxLength = this.departements.length;
        break;
      default:
        maxLength = 0;
        break;
    }
    return maxLength;
  }

  allSelected(filtre: 'regions' | 'categories' | 'marques' | 'classes' | 'departements') {
    const selectedValues = this.filtresForm.get(filtre)?.value || [];
    const maxLength = this.getMaxLength(filtre);
    return selectedValues.length === maxLength;
  }

  someSelected(filtre: 'regions' | 'categories' | 'marques' | 'classes' | 'departements') {
    const selectedValues = this.filtresForm.get(filtre)?.value || [];
    const maxLength = this.getMaxLength(filtre);
    return selectedValues.length > 0 && selectedValues.length < maxLength;
  }

  toggleAllSelection(event: MatCheckboxChange, filtre: 'regions' | 'categories' | 'marques' | 'classes' | 'departements') {
    const checked = event.checked;
    if (checked) {
      let allValues;
      if (filtre === 'regions') {
        allValues = this.regions;
      } else if (filtre === 'categories') {
        allValues = this.categories.map((categorie) => categorie.id);
      } else if (filtre === 'marques') {
        allValues = this.marques.map((marque) => marque.marquelib);
      } else if (filtre === 'classes') {
        allValues = this.classes.map((classe) => {
            if (classe.marque === '' && classe.classe === '') {
              return 'Sans classe';
            }
            return classe.marque + ' - ' + classe.classe;
          }
        );
      } else {
        allValues = this.departements;
      }
      this.filtresForm.get(filtre)?.setValue(allValues);
    } else {
      this.filtresForm.get(filtre)?.setValue([]);
    }
    this.applyFilters(filtre === 'regions');
  }

  applyFilters(isRegionUpdated: boolean): void {

    this.displayedColumns = ['select', 'num', 'nom', 'codepostal', 'ville', 'detail-transactions'];

    this.updateSelectedYears();

    this.fillClientsTable();

    if (isRegionUpdated) {
      this.updateMarques();
      this.updateDepartements();
    }

    this.dataSource.filterPredicate = (data, filter) => {
      const filters = JSON.parse(filter);

      for (const key in filters) {
        if (filters[key]) {
          if (key === 'regions') {
            const selectedRegions = filters[key];

            if (!selectedRegions.includes(data.region.toLowerCase())) {
              return false;
            }
          } else if (key === 'categories') {
            if (!data.categorieCodes.some((categorieCode: string) =>
              filters[key].includes(categorieCode.toLowerCase())
            )) {
              return false;
            }
          } else if (key === 'marques') {
            if (!data.marques.some((marque: string) =>
              filters[key].includes(marque.toLowerCase())
            )) {
              return false;
            }
          } else if (key === 'classes') {
            if (!(data.classes.some((c) =>
                filters[key].includes((c.marque + ' - ' + c.classe).toLowerCase())
              ) || filters[key].includes('sans classe') && data.classes.length === 0
            )) {
              return false;
            }
          } else if (key === 'departements') {
            const selectedDepartements = filters[key];

            if (!selectedDepartements.includes(data.departement.toLowerCase())) {
              return false;
            }
          } else if (key !== 'annees' && key !== 'anneescomparees' && key !== 'moisdebut' && key !== 'moisfin') {
            const columnValue = data[key] ? data[key].toString().toLowerCase() : '';
            if (!columnValue.includes(filters[key].toLowerCase())) {
              return false;
            }
          }
        }
      }
      return true;
    };

    const filterString = JSON.stringify(this.filtresForm.value);
    this.dataSource.filter = filterString.trim().toLowerCase();

    this.updateChartSeries();
  }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.filteredData.length;
    return numSelected === numRows;
  }

  toggleAllRows() {
    if (this.isAllSelected()) {
      this.selection.clear();
      return;
    }

    this.selection.select(...this.dataSource.filteredData);
  }

  checkboxLabel(row?: InfosClient): string {
    if (!row) {
      return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} ${row.num}`;
  }

  openInNewWindow(numClient: number) {
    const url = this.router.serializeUrl(this.router.createUrlTree(['/client-detail/' + numClient]))
    window.open(decodeURIComponent(url), '_blank');
  }

  openDialog(numClient: number) {
    const transactionsClient = [];
    let infosClient: InfosClient;
    for (let index in this.years) {
      if (!transactionsClient[index]) {
        transactionsClient[index] = [];
      }
      this.dataClients[index].forEach((element) => {
        if (element.client === numClient) {
          if (!infosClient) {
            infosClient = this.listeClients.find(client => client.num === numClient);
          }
          const transaction = {
            marque: element.marque,
            ca: element.ca,
            mois: element.mois
          }
          transactionsClient[index].push(transaction);
        }
      });
    }
    this.dialog.open(SuiviCADialogComponent, {
      minWidth: '1200px',
      minHeight: '600px',
      data: {
        firstYear: this.years[0],
        infosClient,
        transactionsClient
      },
    });
  }

  completeSelectionAndAddToCampaign() {
    const selectedClients = [];
    this.clientsService.getClients().subscribe(clients => {
      this.selection.selected.forEach((row) => {
        const client = clients.find(client => client.numclient === row.num);
        if (client) {
          selectedClients.push(client);
        }
      });

      const completedSelectionModel = new SelectionModel<any>(true, selectedClients);

      this.campagnesService.openCampaignDialog(completedSelectionModel);
    });
  }

  completeSelectionAndExportToExcel() {
    const selectedClients = [];
    this.clientsService.getClients().subscribe(clients => {
      this.selection.selected.forEach((row) => {
        const client = clients.find(client => client.numclient === row.num);
        if (client) {
          selectedClients.push(client);
        }
      });

      const completedSelectionModel = new SelectionModel<any>(true, selectedClients);

      const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(completedSelectionModel.selected);
      const wb: XLSX.WorkBook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Clients-Prospect');
      XLSX.writeFile(wb, 'Clients-Prospect.xlsx');
    });
  }

  filterDataClientsByFilters(): DataClient[] {
    const selectedRegions = this.filtresForm.get('regions')?.value || [];
    const selectedCategories = this.filtresForm.get('categories')?.value || [];
    const selectedMarques = this.filtresForm.get('marques')?.value || [];
    const selectedClasses = this.filtresForm.get('classes')?.value || [];
    const selectedDepartements = this.filtresForm.get('departements')?.value || [];

    return this.selectedYears.flatMap(year =>
      this.dataClients[this.years.indexOf(year)].filter((dataClient) => {
        const isRegionValid = selectedRegions.length === this.regions.length || selectedRegions.includes(dataClient.commercial);
        const isCategorieValid = selectedCategories.length === this.categories.length || selectedCategories.includes(dataClient.categorieCode);
        const isMarqueValid = selectedMarques.length === this.marques.length || selectedMarques.includes(dataClient.marque);
        const isClasseValid = selectedClasses.length === this.classes.length || selectedClasses.some((c) => c.marque === dataClient.marque && c.classe === dataClient.cclasseLib) || dataClient.cclasseLib === '';
        const isNumClientValid = this.filtresForm.get('num')?.value ? dataClient.client.toString().includes(this.filtresForm.get('num')?.value) : true;
        const isNomValid = this.filtresForm.get('nom')?.value ? dataClient.nom.toLowerCase().includes(this.filtresForm.get('nom')?.value.toLowerCase()) : true;
        const isDepartementValid = selectedDepartements.length === this.departements.length || selectedDepartements.includes(dataClient.departement);
        const isCodePostalValid = this.filtresForm.get('codepostal')?.value ? dataClient.codepostal.toString().includes(this.filtresForm.get('codepostal')?.value) : true;
        const isVilleValid = this.filtresForm.get('ville')?.value ? dataClient.ville.toLowerCase().includes(this.filtresForm.get('ville')?.value.toLowerCase()) : true;

        return isRegionValid && isCategorieValid && isMarqueValid && isClasseValid && isNumClientValid && isNomValid && isDepartementValid && isCodePostalValid && isVilleValid;
      })
    );
  }

  calculerEvolutionCA() {
    if (!this.filtresForm.get('anneescomparees') || this.filtresForm.get('anneescomparees').value.length === 0) {
      return;
    }

    const filteredData = this.filterDataClientsByFilters();
    const clientsCA: Record<number, { [key: number]: number }> = {};

    filteredData.forEach(element => {
      const mois = Number(element.mois) - 1;

      const moisDebut = this.MONTHS.lastIndexOf(this.filtresForm.get('moisdebut').value);
      const moisFin = this.MONTHS.lastIndexOf(this.filtresForm.get('moisfin').value);
      const moisValides = Array.from(
        {length: moisFin - moisDebut + 1},
        (_, i) => i + moisDebut
      );

      if (!clientsCA[element.client]) {
        clientsCA[element.client] = {};
      }
      if (!clientsCA[element.client][element.annee]) {
        clientsCA[element.client][element.annee] = 0;
      }
      if (moisValides.includes(mois)) {
        clientsCA[element.client][element.annee] += element.ca;
      }
    });

    this.displayedColumns = ['select', 'num', 'nom', 'codepostal', 'ville', 'caAnnee1', 'caAnnee2', 'evolutionbrute', 'prctevolution', 'detail-transactions'];

    const annees = this.filtresForm.get('anneescomparees').value.split(' - ');
    let evolution: number;

    this.caAnnee1Map = new Map<number, number>();
    this.caAnnee2Map = new Map<number, number>();
    this.evolutionBruteMap = new Map<number, number>();
    this.prctEvolutionMap = new Map<number, number>();

    this.listeClients.forEach(client => {
      if (clientsCA[client.num] === undefined || clientsCA[client.num] === null) {
        return;
      }
      const caYear1 = clientsCA[client.num][annees[0]] || 0;
      const caYear2 = clientsCA[client.num][annees[1]] || 0;

      if (caYear1 === 0) {
        if (caYear2 === 0) {
          evolution = 0;
        } else if (caYear2 > 0) {
          evolution = Infinity;
        } else {
          evolution = -Infinity;
        }
      } else {
        evolution = ((caYear2 - caYear1) / caYear1) * 100;
      }

      this.caAnnee1Map.set(client.num, caYear1);
      this.caAnnee2Map.set(client.num, caYear2);
      this.evolutionBruteMap.set(client.num, caYear2 - caYear1);
      this.prctEvolutionMap.set(client.num, evolution);
    });

    this.sort.active = 'evolutionbrute';
    this.sort.direction = 'asc';
    this.sortData();
    this.updateChartSeries();
  }

  sortData() {
    const data = this.dataSource.data.slice();

    this.dataSource.sort = this.sort;

    this.dataSource.data = data.sort((a, b) => {
      const isAsc = this.sort.direction === 'asc';
      let valA: number;
      let valB: number;
      switch (this.sort.active) {
        case 'caAnnee1':
          valA = this.caAnnee1Map.get(a.num) || 0;
          valB = this.caAnnee1Map.get(b.num) || 0;
          break;
        case 'caAnnee2':
          valA = this.caAnnee2Map.get(a.num) || 0;
          valB = this.caAnnee2Map.get(b.num) || 0;
          break;
        case 'evolutionbrute':
          valA = this.evolutionBruteMap.get(a.num) || 0;
          valB = this.evolutionBruteMap.get(b.num) || 0;
          break;
        case 'prctevolution':
          valA = this.prctEvolutionMap.get(a.num) || 0;
          valB = this.prctEvolutionMap.get(b.num) || 0;
          break;
        default:
          valA = a[this.sort.active];
          valB = b[this.sort.active];
          break;
      }
      return this.compare(valA, valB, isAsc);
    });

  }

  private compare(a: number | string, b: number | string, isAsc: boolean) {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }

  aggregateDataByMonth() {
    const aggregatedData: Record<string, Record<string, number>> = {};

    const months = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

    for (let month of months) {
      aggregatedData[month] = {};
    }

    const filteredDataClients = this.filterDataClientsByFilters().filter(transaction =>
      this.dataSource.filteredData.some(client => client.num === transaction.client)
    );

    filteredDataClients.forEach((element) => {
      const month = months[Number(element.mois.trim()) - 1];
      const serie = element[this.serie.id];

      if (!aggregatedData[month][serie]) {
        aggregatedData[month][serie] = 0;
      }

      aggregatedData[month][serie] += element.ca;
    });

    return aggregatedData;
  }

  updateChartSeries() {
    const aggregatedData = this.aggregateDataByMonth();
    const mois = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

    const series = this.filtresForm.get(this.serie.filtresFormId).value.map(serie => {
      return {
        name: serie,
        data: mois.map(month => aggregatedData[month]?.[serie] || 0)
      };
    });

    this.chartOptions.series = [...series];

    if (this.chart) {
      this.chart.updateOptions(this.chartOptions);
    }
  }

  openSaveFiltersPopup() {
    this.dialog.open(SaveFiltersComponent).afterClosed().subscribe(result => {
      if (result) {
        const filtersArray = Array.isArray(this.savedFilters) ? this.savedFilters : [];
        localStorage.setItem(
          'suivi-ca-filters',
          JSON.stringify([...filtersArray, {
            displayName: result,
            filtresFormValue: this.filtresForm.value
          }])
        );
        const parsed = JSON.parse(localStorage.getItem('suivi-ca-filters') || '[]');
        this.savedFilters = Array.isArray(parsed) ? parsed : [];
      }
    });
  }

  applySavedFilters(saved) {
    this.filtresForm.patchValue(saved.filtresFormValue);
    this.selectedSavedFilter = saved;
    this.applyFilters(false);
    this.updateChartSeries();
  }

  supprimerFiltrage() {
    this.dialog.open(SupprimerFiltrageComponent, {
      autoFocus: false,
      data: {displayName: this.selectedSavedFilter.displayName}
    }).afterClosed().subscribe(result => {
      if (result) {
        const updatedFilters = this.savedFilters.filter(filter => filter !== this.selectedSavedFilter);
        localStorage.setItem('suivi-ca-filters', JSON.stringify(updatedFilters));
        this.savedFilters = updatedFilters;
        this.selectedSavedFilter = null;
      }
    });
  }

  changeGraphType() {
    if (this.chartOptions.chart.type === 'line') {
      this.chartOptions.chart.type = 'bar';
    } else {
      this.chartOptions.chart.type = 'line';
    }
    this.chart.updateOptions(this.chartOptions);
  }

  fillChartOptions() {
    this.chartOptions = {
      grid: {
        show: true,
        borderColor: '#e7e7e7',
        strokeDashArray: 0,
        position: 'back',
        xaxis: {
          lines: {
            show: true
          }
        },
        yaxis: {
          lines: {
            show: true
          }
        },
        row: {
          colors: undefined,
          opacity: 0.5
        },
        column: {
          colors: undefined,
          opacity: 0.5
        }
      },
      series: [
        {
          data: [],
        },
      ],
      colors: ['#7ED6A5', '#4A90E2', '#9013FE', '#E5989B', '#B5838D'],
      chart: {
        height: 350,
        type: 'bar',
        zoom: {
          enabled: true,
          type: 'xy',
          autoScaleYaxis: true
        },
        toolbar: {
          show: true,
          tools: {
            zoom: true,
            zoomin: true,
            zoomout: true,
            pan: true,
            reset: true
          },
          autoSelected: 'zoom'
        },
      },
      dataLabels: {
        enabled: false
      },
      xaxis: {
        categories: ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre']
      },
      yaxis: {
        title: {
          text: 'Chiffre d\'affaires (€)'
        }
      },
      title: {
        text: 'Suivi CA par mois',
        align: 'left',
        style: {
          fontSize: '16px',
          color: '#666',
        },
      },
    };
  }

  protected readonly Object = Object;
}

export interface DataClient {
  annee: number;
  ca: number;
  categorieCode: string;
  client: number;
  codepostal: number;
  commercial: string;
  departement: string;
  marque: string;
  cclasseLib: string;
  mois: string;
  nom: string;
  ville: string;
  telephone: string;
}

export interface InfosClient {
  num: number;
  nom: string;
  departement: string;
  codepostal: number;
  ville: string;
  telephone: string;
  region: string;
  categorieCodes: string[];
  marques: string[];
  classes: { marque: string, classe: string }[];
}

export interface Region {
  SecteurCode: string;
  SecteurLibelle: string;
}

export interface Categorie {
  id: string;
  label: string;
  label2: string;
}

export interface Marque {
  marque: string;
  marquelib: string;
  sub: [];
}
