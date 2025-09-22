import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { environment } from "@env/environment";
import { take, takeUntil } from "rxjs/operators";
import { ProduitService } from "@services/produit.service";
import { CotationService } from "@services/cotation.service";
import { Cotation, Produit } from "@/models";
import { Subject } from "rxjs";
import * as XLSX from "xlsx";
import { LogClientService } from "@services/log-client.service";
import { MatCheckboxChange } from '@angular/material/checkbox';

@Component({
  selector: 'app-cotation',
  templateUrl: './cotation.component.html',
  styleUrls: ['./cotation.component.scss']
})
export class CotationComponent implements OnInit, OnDestroy {
  @Input() numClient: number = 0;
  environment = environment;

  cotationMap = new Map<string, any[]>();
  disabledCotationMap = new Map<string, any[]>();
  dateMap = new Map<string, number>();
  marques = [];
  display = [];
  disabledDisplay = [];
  disabledRenewalButtons: number[] = [];

  filters = { reference: '', numCotation: '', marques: [], startDate: null, endDate: null, status: 'all' };

  private _destroy$ = new Subject<void>();

  constructor(
    public produitService: ProduitService,
    private cotationService: CotationService,
    private logClient: LogClientService
  ) { }

  ngOnInit(): void {
    const clientId = this.numClient || this.logClient.currentClient.id;
    this.cotationService.cotationClient(clientId);

    this.subscribeToCotations(this.cotationService.cotations$, this.cotationMap, false);
    this.subscribeToCotations(this.cotationService.disabledCotations$, this.disabledCotationMap, true);
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  unrollDetails(index: number): void {
    this.display[index] = !this.display[index];
  }

  unrollDisabledDetails(index: number): void {
    this.disabledDisplay[index] = !this.disabledDisplay[index];
  }

  allSelected() {
    const selectedValues = this.filters.marques || [];
    const maxLength = this.marques.length;
    return selectedValues.length === maxLength;
  }

  someSelected() {
    const selectedValues = this.filters.marques || [];
    const maxLength = this.marques.length;
    return selectedValues.length > 0 && selectedValues.length < maxLength;
  }

  toggleAllSelection(event: MatCheckboxChange) {
    this.filters.marques = event.checked ? this.marques : [];
    this.applyFilters();
  }

  private subscribeToCotations(source$, map: Map<string, any[]>, isDisabled: boolean): void {
    source$.pipe(takeUntil(this._destroy$)).subscribe(cotations => {
      map.clear();
      cotations.forEach(cotation => this.processCotation(cotation, map));
      if (isDisabled) this.cotationService.getInvalidReasons(cotations);
    });
  }

  private processCotation(cotation: Cotation, map: Map<string, any[]>): void {
    const produit = this.createProduitFromCotation(cotation);
    this.updateMarques(cotation.marquelib);
    const cotationList = map.get(cotation.numcotation) || [];
    cotationList.push({ produit, cotation });
    map.set(cotation.numcotation, cotationList);
    this.dateMap.set(cotation.numcotation, this.cotationService.dateDifferenceInDays(cotation.datefin, new Date()));
  }

  private createProduitFromCotation(cotation: Cotation): Produit {
    return {
      reference: cotation.produit as string,
      qtemaxi: cotation.qtecdemax - cotation.qtecde,
      qtemini: 0,
      qteStock1: cotation.qtestock,
      prix: cotation.prixvente,
      marque: cotation.marque,
      marquelib: cotation.marquelib,
      designation: cotation.designation,
      photo: cotation.produit,
      perm: cotation.perm
    } as Produit;
  }

  private updateMarques(marque: string): void {
    if (!this.marques.includes(marque)) {
      this.marques.push(marque);
    }
    if (!this.filters.marques.includes(marque)) {
      this.filters.marques.push(marque);
    }
  }

  applyFilters(): void {
    this.cotationMap.clear();
    this.disabledCotationMap.clear();
    this.cotationService.cotations$.pipe(take(1)).subscribe(cotations => {
      cotations.filter(c => this.filterCotation(c)).forEach(c => this.processCotation(c, this.cotationMap));
    });
    this.cotationService.disabledCotations$.pipe(take(1)).subscribe(cotations => {
      cotations.filter(c => this.filterCotation(c)).forEach(c => this.processCotation(c, this.disabledCotationMap));
    });
  }

  filterCotation(cotation: Cotation): boolean {
    const { reference, numCotation, marques, startDate, endDate, status } = this.filters;

    const produitReference = (cotation.produit as string).toLowerCase();
    const produitDesignation = (cotation.designation as string).toLowerCase();
    const matchesReference = !reference || produitReference.includes(reference.toLowerCase()) || produitDesignation.includes(reference.toLowerCase());

    const numCotationString = (cotation.numfrs + " - " + cotation.numcotation);
    const matchesNumCotation = !numCotation || numCotationString.includes(numCotation);

    const matchesMarques = marques.includes(cotation.marquelib);

    const matchesStartDate = !startDate || new Date(cotation.datedeb).setHours(0, 0, 0, 0) >= new Date(startDate).setHours(0, 0, 0, 0);
    const matchesEndDate = !endDate || new Date(cotation.datefin).setHours(0, 0, 0, 0) <= new Date(endDate).setHours(0, 0, 0, 0);

    const matchesStatus = cotation.status === status || status === 'all';

    return matchesReference && matchesNumCotation && matchesStartDate && matchesEndDate && matchesStatus && matchesMarques;
  }

  exportToExcel(cotation?): void {
    if (cotation) {
      const data = cotation.value.map(item => ({
        NumCotation: `${item.cotation.numfrs} - ${cotation.key}`,
        Reference: item.produit.reference,
        Marque: item.produit.marquelib,
        Designation: item.produit.designation,
        Prix: item.produit.prix,
        QuantiteMaxi: item.produit.qtemaxi,
        QuantiteMini: item.produit.qtemini,
        DateDebut: item.cotation.datedeb,
        DateFin: item.cotation.datefin
      }));
      const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);
      const wb: XLSX.WorkBook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Cotation ' + cotation.key);
      XLSX.writeFile(wb, 'Cotation ' + cotation.key + '.xlsx');
    } else {
      const data = [...this.getCotationData(this.cotationMap, 'Oui'), ...this.getCotationData(this.disabledCotationMap, 'Non')];
      const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);
      const wb: XLSX.WorkBook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Cotations');
      XLSX.writeFile(wb, 'Cotations.xlsx');
    }
  }

  private getCotationData(map: Map<string, any[]>, activeStatus: string) {
    return Array.from(map.entries()).flatMap(([key, value]) => value.map(item => ({
      NumCotation: `${item.cotation.numfrs} - ${key}`,
      Reference: item.produit.reference,
      Marque: item.produit.marquelib,
      Designation: item.produit.designation,
      Prix: item.produit.prix,
      QuantiteMaxi: item.produit.qtemaxi,
      QuantiteMini: item.produit.qtemini,
      DateDebut: item.cotation.datedeb,
      DateFin: item.cotation.datefin,
      Active: activeStatus
    })));
  }
}
