import { Injectable } from '@angular/core';
import * as XLSX from "xlsx";

@Injectable({
  providedIn: 'root'
})
export class XlsFormatterService {

  constructor() { }

  transposeDataWithHeaders(data: any[]): any[][] {
    if (!data || data.length === 0) return [];

    const headers = Object.keys(data[0]);
    const transposed: any[][] = [];

    headers.forEach(header => {
      const row = [header, ...data.map(row => row[header])];
      transposed.push(row);
    });

    return transposed;
  }

  jsonToAoA(data: any[]): any[][] {
    if (!data || data.length === 0) return [];
    const headers = Object.keys(data[0]);
    const aoa = [headers];
    data.forEach(item => {
      aoa.push(headers.map(h => item[h]));
    });
    return aoa;
  }

  autoFitColumns(ws: XLSX.WorkSheet, data: any[][]) {
    ws['!cols'] = data[0].map((_, colIndex) => {
      let maxLen = 10;
      data.forEach(row => {
        const cellValue = row[colIndex];
        const len = cellValue ? String(cellValue).length : 0;
        if (len > maxLen) maxLen = len;
      });
      return {wch: maxLen + 2};
    });
  }

  createTransposedSheet(data: any[], sheetName: string, wb: XLSX.WorkBook) {
    const aoa = this.transposeDataWithHeaders(data);
    const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(aoa);
    this.autoFitColumns(ws, aoa);
    wb.SheetNames.push(sheetName);
    wb.Sheets[sheetName] = ws;
  }

  createNormalSheet(data: any[], sheetName: string, wb: XLSX.WorkBook) {
    if (!data || data.length === 0) {
      const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet([[sheetName]]);
      wb.SheetNames.push(sheetName);
      wb.Sheets[sheetName] = ws;
      return;
    }

    const aoa = this.jsonToAoA(data);
    const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(aoa);
    this.autoFitColumns(ws, aoa);
    wb.SheetNames.push(sheetName);
    wb.Sheets[sheetName] = ws;
  }
}
