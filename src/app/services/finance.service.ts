import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {environment} from "@env/environment";
import {BehaviorSubject, combineLatest, map} from "rxjs";
import {Finance} from "@models/finance";
import {filter} from "rxjs/operators";
import {CommandeCommercial} from "@models/commandeCommercial";

@Injectable({
  providedIn: 'root'
})
export class FinanceService {

  constructor(
    private _http: HttpClient
  ) {}

  pastItems: Array<Finance> = [];
  currentItems: Array<Finance> = [];
  alertItems: Array<Finance> = [];
  avoirItems: Array<Finance> = [];

  filteredPastItems = new BehaviorSubject<Array<Finance>>([]);
  filteredCurrentItems = new BehaviorSubject<Array<Finance>>([]);
  filteredAlertItems = new BehaviorSubject<Array<Finance>>([]);
  filteredAvoirItems = new BehaviorSubject<Array<Finance>>([]);

  private _listOfFinance: Array<Finance> = [];

  getListOfFinance(id: number){
    return this._http.get<Array<Finance>>(`${environment.apiUrl}/ExtraitCompte.php`, {
      params: {
        client: id
      }
    }).subscribe((data: Array<Finance>) => {
      this._listOfFinance = data;
      this.initArrays();
    });
  }

  initArrays(){
    const today = new Date();
    this.pastItems = this._listOfFinance.filter(item => item.codelettrage != '');
    this.currentItems = this._listOfFinance.filter(item => item.codelettrage == '' && new Date(item.dateecheancenumero) > today && item.debit != '0').sort((a, b) => new Date(a.dateecheancenumero).getTime() - new Date(b.dateecheancenumero).getTime());
    this.alertItems = this._listOfFinance.filter(item => item.codelettrage == '' && new Date(item.dateecheancenumero) < today && item.debit != '0').sort((a, b) => new Date(a.dateecheancenumero).getTime() - new Date(b.dateecheancenumero).getTime());
    this.avoirItems = this._listOfFinance.filter(item => item.codelettrage == '' && item.credit != '0' && item.debit == '0').sort((a, b) => new Date(a.dateecheancenumero).getTime() - new Date(b.dateecheancenumero).getTime());
    this.filteredPastItems.next(this.pastItems);
    this.filteredCurrentItems.next(this.currentItems);
    this.filteredAlertItems.next(this.alertItems);
    this.filteredAvoirItems.next(this.avoirItems);
  }

  getTotalCostEchus() {
    return this.filteredAlertItems.getValue().map(t => t.debit).reduce((acc, value) => Number(acc) + Number(value), 0);
  }
  getTotalCostNonEchus() {
    return this.filteredCurrentItems.getValue().map(t => t.debit).reduce((acc, value) => Number(acc) + Number(value), 0);
  }
  getTotalCostHisto() {
    return this.filteredPastItems.getValue().map(t => t.debit).reduce((acc, value) => Number(acc) + Number(value), 0);
  }

  getTotalCostAvoir() {
    return this.filteredAvoirItems.getValue().map(t => t.debit).reduce((acc, value) => Number(acc) + Number(value), 0);
  }

  getNbResultEchus(){
    return this.filteredAlertItems.getValue().length;
  }

  getNbResultNonEchus(){
    return this.filteredCurrentItems.getValue().length;
  }

  getNbResultHisto(){
    return this.filteredPastItems.getValue().length;
  }

  getNbResultAvoir(){
    return this.filteredAvoirItems.getValue().length;
  }

  appliedFilters: { [key: string]: any } = {};

  applyFilter(filterText: any, type: string, champ: string) {
    if (!this.appliedFilters[type]) {
      this.appliedFilters[type] = {};
    }
    if (type === 'date' && filterText === null) {
      this.appliedFilters[type] = {};
    } else {
      this.appliedFilters[type][champ] = filterText;
    }

    let filteredPastItems = [...this._listOfFinance.filter(item => item.codelettrage !== '')];
    let filteredCurrentItems = [...this._listOfFinance.filter(item => item.codelettrage === '' && new Date(item.dateecheancenumero) > new Date())];
    let filteredAlertItems = [...this._listOfFinance.filter(item => item.codelettrage === '' && new Date(item.dateecheancenumero) < new Date())];
    let filteredAvoirItems = [...this._listOfFinance.filter(item => item.codelettrage == '' && item.credit != '0')];

    Object.keys(this.appliedFilters).forEach((filterType) => {
      Object.keys(this.appliedFilters[filterType]).forEach((filterField) => {
        const filterValue = this.appliedFilters[filterType][filterField];
        switch (filterType) {
          case 'date': {
            filteredPastItems = this.dateFilter(filteredPastItems, filterValue, filterField);
            filteredCurrentItems = this.dateFilter(filteredCurrentItems, filterValue, filterField);
            filteredAlertItems = this.dateFilter(filteredAlertItems, filterValue, filterField);
            filteredAvoirItems = this.dateFilter(filteredAvoirItems, filterValue, filterField);
            break;
          }
          case 'string': {
            filteredPastItems = this.stringFilter(filteredPastItems, filterValue, filterField);
            filteredCurrentItems = this.stringFilter(filteredCurrentItems, filterValue, filterField);
            filteredAlertItems = this.stringFilter(filteredAlertItems, filterValue, filterField);
            filteredAvoirItems = this.stringFilter(filteredAvoirItems, filterValue, filterField);
            break;
          }
        }
      });
    });

    this.filteredPastItems.next(filteredPastItems);
    this.filteredCurrentItems.next(filteredCurrentItems);
    this.filteredAlertItems.next(filteredAlertItems);
    this.filteredAvoirItems.next(filteredAvoirItems);
  }

  private stringFilter(arr: Finance[], filterText: any, champ: string): Finance[] {
    return arr.filter(item => item[champ].includes(filterText.toString().toUpperCase()));
  }

  private dateFilter(arr: Finance[], filterText: string, champ: string): Finance[] {
    let date = this.formatDate(filterText);
    return arr.filter(item => item[champ].toString() >= date[0] && item[champ].toString() <= date[1]);
  }


  formatDate(dateInput: string){
    let date = dateInput.split(',');
    let dateStart = this.formatDateToYYYYMMDD(new Date(date[0]));
    let dateEnd = this.formatDateToYYYYMMDD(new Date(date[1]));
    return [dateStart, dateEnd];
  }

  formatDateToYYYYMMDD(date) {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

}
