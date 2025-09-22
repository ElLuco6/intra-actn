import {Component, Input} from '@angular/core';
import {Client} from "@/models";
import {LogClientService} from "@services/log-client.service";
import {HttpClient} from '@angular/common/http';
import {environment} from '@env/environment';
import {parse} from 'date-fns';
import * as XLSX from "xlsx";
import {XlsFormatterService} from "@services/xls-formatter.service";

@Component({
  selector: 'app-bandeau-client',
  templateUrl: './bandeau-client.component.html',
  styleUrls: ['./bandeau-client.component.scss']
})
export class BandeauClientComponent {

  @Input() client: Client;

  constructor(
    public authClient: LogClientService,
    private http: HttpClient,
    private xlsFormatterService: XlsFormatterService) {
  }

  formatStatistiques(data: any[]): any[][] {
    if (!data || data.length === 0) return [];

    const allYears = data.map(d => {
      const fullYear = parseInt(d.annee, 10);
      return fullYear < 100 ? 2000 + fullYear : fullYear;
    });

    const uniqueYears = Array.from(new Set(allYears)).sort((a, b) => a - b);

    const grouped = data.reduce((acc, item) => {
      const fullYear = parseInt(item.annee, 10);
      const yearKey = fullYear < 100 ? 2000 + fullYear : fullYear;
      if (!acc[item.marque]) acc[item.marque] = {};
      acc[item.marque][yearKey] = item.chiffreAffaire;
      return acc;
    }, {} as Record<string, Record<number, number>>);

    const header = ['Marque', ...uniqueYears];
    const rows = Object.entries(grouped).map(([marque, chiffres]) => {
      const row = [marque];
      uniqueYears.forEach(annee => {
        row.push(chiffres[annee] ?? '');
      });
      return row;
    });

    return [header, ...rows];
  }


  exportClient() {
    this.http.get(`${environment.apiUrl}/FicheClientexcel.php?NUMCLI=${this.client.numclient}`, {
      withCredentials: true,
      responseType: 'json'
    }).subscribe((infosClient: any) => {
      const wb: XLSX.WorkBook = XLSX.utils.book_new();

      const activiteAoA = this.xlsFormatterService.transposeDataWithHeaders([infosClient.activite]);
      const ligneContacts = [[], [], ['Contacts']];
      const contactsAoA = this.xlsFormatterService.jsonToAoA(infosClient.contacts || []);
      const fullAoA = [...activiteAoA, ...ligneContacts, ...contactsAoA];
      const wsActivite: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(fullAoA);
      this.xlsFormatterService.autoFitColumns(wsActivite, fullAoA);
      wb.SheetNames.push('Identité');
      wb.Sheets['Identité'] = wsActivite;

      const statsAoA = this.formatStatistiques(infosClient.statistiques || []);
      const wsStats: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(statsAoA);
      this.xlsFormatterService.autoFitColumns(wsStats, statsAoA);
      wb.SheetNames.push('Statistiques');
      wb.Sheets['Statistiques'] = wsStats;

      this.xlsFormatterService.createTransposedSheet([infosClient.financier], 'Financier', wb);

      this.xlsFormatterService.createNormalSheet(infosClient.commentaires || [], 'Commentaires', wb);
      this.xlsFormatterService.createNormalSheet(infosClient.visites || [], 'Visites', wb);

      XLSX.writeFile(wb, `Fiche_Client_${this.client.numclient}.xls`);
    });
  }

  depassementPlafond(): number {
    let depassementPlafond: number;

    if (this.client.limiteCreditExceptionnel == 0) {
      depassementPlafond = this.client.risqueGlobal - this.client.plafondbloquant;
    } else {
      const dateLimite = parse(this.client.limiteCreditExceptionnelDate, 'dd/MM/yyyy', new Date());
      if (this.client.limiteCreditExceptionnelDate != null && new Date() < dateLimite) {
        depassementPlafond = this.client.risqueGlobal - this.client.limiteCreditExceptionnel;
      } else {
        depassementPlafond = this.client.risqueGlobal - this.client.plafondbloquant;
      }
    }

    return depassementPlafond;
  }

  isEtudeFinanciereObsolete(): boolean {
    const dateEtude = parse(this.client.plafondbloquantDate, 'dd/MM/yyyy', new Date());
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    return dateEtude < oneYearAgo;
  }

}
