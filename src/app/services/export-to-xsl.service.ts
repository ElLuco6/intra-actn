import { Injectable } from '@angular/core';
import * as XLSX from "xlsx";

@Injectable({
  providedIn: 'root'
})
export class ExportToXslService {

  constructor() { }

  exportToXls(array: Array<unknown>, nom: string) {
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(array);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, nom);
    nom = nom.replace(' ', '-');
    XLSX.writeFile(wb, nom + '.xlsx');
  }
}
