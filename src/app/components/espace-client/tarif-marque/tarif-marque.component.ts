import {Component, OnInit} from '@angular/core';
import {take, takeUntil} from "rxjs/operators";
import * as XLSX from 'xlsx';
import {CatalogueService} from "@services/catalogue.service";
import {Subject} from "rxjs";
import {environment} from "@env/environment";
import {HttpClient} from "@angular/common/http";

@Component({
  selector: 'app-tarif-marque',
  templateUrl: './tarif-marque.component.html',
  styleUrls: ['./tarif-marque.component.scss']
})
export class TarifMarqueComponent implements OnInit {

  environment = environment;
  marques: Array<[string, string]>;

  private _marques = new Map<string, string>();

  /** Tableau de toute les marques pour pouvoir revnir en arrière sur les filtre */
  fullMarques: Array<[string,string]>;
  private _destroy$ = new Subject<void>();

  /** Liste des premières lettres de chaque marque
   * Utilisée ensuite pour créer une barre de sauts à chaques lettres */
  firstLetters: Map<string, string> = null;

  btnVoir = false;
  hideBtn = true

  constructor(
    private catalogueService: CatalogueService,
    private http: HttpClient
  ) { }

  ngOnInit(): void {
    this.catalogueService.setFilArianne(false);
    this.catalogueService.getTarifs()
      .pipe(
        take(1),
        takeUntil(this._destroy$))
      .subscribe((data) => {
        data.forEach(produit => {
          if (produit.marq !== ''){
            this._marques.set(produit.marquelib, produit.marq);
          }
        });
        this.marques = Array.from(this._marques).sort();
        let firstCharsSet: Map<string, string> = new Map<string, string>();
        this.marques.forEach(marque => {
          if (marque[0] && (!firstCharsSet.get(marque[0][0])) ) {
            firstCharsSet.set(marque[0][0], marque[0].replace(/\s/g, ''));
          }
        });
        this.firstLetters = firstCharsSet;
        this.fullMarques = this.marques;
        this.hideBtn = false
      });
  }

  downloadXLS(marque){
    this.http.get<any[]>(`${environment.apiUrl}/Listexlstarifmarque.php`, {
      params: {
        tsearchMrq: marque[1]
      },
      withCredentials: true,
    }).subscribe((data) => {
      const mappedData = data.map(item => [
        item.TAMRQL,
        item.TAPROD,
        item.TAFREF,
        item.TADESI,
        item.TADES3,
        item.TACBAR,
        item.TAPRIX,
        item.TATCCO,
        item.TAPPUB,
        item.TAGARA,
        item.TAPD3E,
        item.TAPD3O,
        item.TADapp,
        item.TAPOIB,
        item.TADOCU ? `https://www.actn.fr/backend/pdf/${item.TADOCU}.pdf` : "N.C."
      ]);

      // Extract client data
      const clientData = {
        'N° Client': data[0].TANCLI,
        'Raison sociale': data[0].TAFJUR,
        'Adresse': `${data[0].TANVOI} ${data[0].TACPOS}`,
        'Tarif au ': data[0].TADATE
      };

      // Initialize a new workbook and worksheet
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet([]);

      // Set column widths
      ws['!cols'] = [
        { wch: 15 }, { wch: 25 }, { wch: 30 }, { wch: 50 }, { wch: 20 }
      ];

      // Add client information
      const clientInfo = [
        ["", `Tarif au ${clientData['Tarif au ']}`, "N° Client", clientData['N° Client']],
        ["", "", "Raison sociale", clientData['Raison sociale']],
        ["", "", "Adresse", clientData['Adresse']]
      ];

      // Define the headers
      const headers = [
        "Marque", "Référence Produit", "Votre Référence", "Désignation",
        "Désignation complémentaire", "Gencode", "Prix HT €", "Port Messagerie/hors ga",
        "Prix Public H", "Garantie", "Contribution", "Organisme DEEE",
        "Date Application", "Poids Brut", "Url documentation"
      ];

      // Combine client information, headers, and mapped data
      const combinedData = [
        ...clientInfo,
        [],
        headers,
        ...mappedData
      ];

      // Add the combined data to the worksheet
      XLSX.utils.sheet_add_aoa(ws, combinedData, { origin: 0 });

      // Append worksheet to workbook and write to a file
      XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
      XLSX.writeFile(wb, 'output.xlsx');
    });
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
    this.catalogueService.setFilArianne(true);
  }

  resetMarque(){
    this.btnVoir = false
    this.marques = this.fullMarques
  }


  removeMarque(letre:string){
    this.resetMarque()

    let nLetre=  letre.toUpperCase()
    this.marques = this.marques.filter((obj) => {
      return obj[0][0] === nLetre
    });
    this.btnVoir = true

  }
}
