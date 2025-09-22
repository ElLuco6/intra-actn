import { Component, Inject, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { environment } from '@env/environment';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-importer-prospects-non-qualifies',
  templateUrl: './importer-prospects-non-qualifies.component.html',
  styleUrl: './importer-prospects-non-qualifies.component.scss'
})
export class ImporterProspectsNonQualifiesComponent {
  @ViewChild('fileInput') fileInput: any;
  URL_TEMPLATE = environment.pagesHtml + '/template_pnq.xls';

  constructor(
    public dialogRef: MatDialogRef<ImporterProspectsNonQualifiesComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { idCampagne: string }
  ) { }

  uploadCSV(rows: any[]) {
    const csvContent = rows.map(row => Object.values(row).join(';')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const file = new File([blob], `${this.data.idCampagne}.pnq`, { type: 'text/csv' });

    const formData = new FormData();
    formData.append('file', file);

    const uploadUrl = environment.apiUrl + '/uploadPNQ.php';

    fetch(uploadUrl, {
      method: 'POST',
      body: formData
    })
      .then(response => response.text())
      .then(data => {
        try {
          const jsonData = JSON.parse(data);
        } catch (e) {
          console.error('Erreur lors du parsing du JSON:', e);
        }
      })
      .catch(error => {
        console.error('Erreur lors de l\'upload :', error);
      });
  }

  processExcelFile() {
    const file = this.fileInput.nativeElement.files[0];
    const reader = new FileReader();

    reader.onload = (e: any) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const jsonData: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      const headers = jsonData[0];
      const rows = jsonData.slice(1).map(row => {
        const rowData: any = {};
        headers.forEach((header: string, index: number) => {
          rowData[header] = row[index];
        });
        return rowData;
      });

      this.uploadCSV(rows);
    };

    reader.readAsArrayBuffer(file);
  }

}
