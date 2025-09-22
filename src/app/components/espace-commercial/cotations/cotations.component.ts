import { Component, OnInit, ViewChild } from '@angular/core';
import { AuthenticationService } from "@services/authentication.service";
import { MatTableDataSource } from '@angular/material/table';
import { Filter, FilterControl } from "@models/filter";
import { FilterService } from "@services/filter.service";
import { MatPaginator } from "@angular/material/paginator";
import { LogClientService } from "@services/log-client.service";
import { CotationDeSesMorts } from "@models/cotationDeSesMorts";
import { CotationService } from "@services/cotation.service";
import { ProduitService } from "@services/produit.service";
import * as XLSX from "xlsx";
import { environment } from '@env/environment';

@Component({
  selector: 'app-cotations',
  templateUrl: './cotations.component.html',
  styleUrls: ['./cotations.component.scss']
})
export class CotationsComponent implements OnInit {
  environment = environment;

  cotations = new MatTableDataSource<CotationDeSesMorts>();
  display = [];
  filtreControls: FilterControl = {};
  filtres: Filter[] = [];

  @ViewChild(MatPaginator) paginator: MatPaginator;

  pageSize = 10;
  currentPage = 0;

  header: HTMLElement;

  constructor(protected authService: AuthenticationService,
    private filterService: FilterService,
    protected logClientService: LogClientService,
    private cotationService: CotationService,
    protected produitService: ProduitService) { }

  ngOnInit(): void {
    this.cotationService.getCotationTous().subscribe((data) => {
      data.map((d) => {
        d.datedeb = this.convertDates(d.datedeb);
        d.datefin = this.convertDates(d.datefin);
      });
      this.cotations = new MatTableDataSource(Object.values(this.cotationService.groupByNumCotation(data)));
      this.cotations.paginator = this.paginator;
      this.initFilters();
    });
  }


  initFilters() {
    const filtersNamesAndTypes = [
      { name: 'numcotation', type: 'input', displayName: 'N° Cotation' },
      { name: 'refcot', type: 'input', displayName: 'ref. Cotation' },
      { name: 'numcli', type: 'input', displayName: 'N° Client' },
      { name: 'groupe', type: 'input' },
      { name: 'classe', type: 'input' },
      { name: 'marquelib', type: 'select', displayName: 'Marque' },
      { name: 'produit', type: 'input' },
      { name: 'designation', type: 'input', displayName: 'Designation' },
      { name: 'region', type: 'select' },
      { name: 'datedeb', type: 'dateAsc', displayName: 'Date début' },
      { name: 'datefin', type: 'dateDesc', displayName: 'Date fin' },
    ];

    const { filtres, filtreControls } = this.filterService.initFiltres(this.cotations, filtersNamesAndTypes);
    this.filtres = filtres;
    this.filtreControls = filtreControls;
  }

  convertDates(date: Date): Date {
    if (Number(date.toString().substring(0, 2)) > 12) {
      return new Date(date.toString().split('/').reverse().join('/'));
    } else {
      return new Date(date);
    }
  }

  applyPagination() {
    const startIndex = this.currentPage * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    return this.cotations.filteredData.slice(startIndex, endIndex);
  }

  onPageChange(event: any) {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
  }

  unrollDetails(index: number): void {
    this.display[index] = !this.display[index];
  }

  stickyHeader() {
    return window.scrollY >= this.header.offsetTop;
  }

  exportToExcel(cotation: CotationDeSesMorts): void {
    const data = cotation.produits.map(produit => ({
      NumCotation: cotation.numcotation,
      Reference: produit.produit,
      Marque: produit.marquelib,
      Designation: produit.designation,
      PrixVente: produit.prixvente,
      QuantiteMin: produit.qtecdemini,
      QuantiteMax: produit.qtecdemax,
      DateDebut: cotation.datedeb,
      DateFin: cotation.datefin
    }));

    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Cotation ' + cotation.numcotation);
    XLSX.writeFile(wb, 'Cotation ' + cotation.numcotation + '.xlsx');
  }

}
