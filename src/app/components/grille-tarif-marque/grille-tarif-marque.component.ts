import {AfterContentInit, AfterViewInit, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {environment} from "@env/environment";
import {ActivatedRoute, Router} from "@angular/router";
import {GrilleTarifaire} from "@models/grilleTarifaire";
import {FileService} from "@services/file.service";
import {FileDownloaded} from "@models/fileDownloaded";
import {MatTableDataSource} from "@angular/material/table";
import {MatPaginator} from "@angular/material/paginator";
import {MatSort} from "@angular/material/sort";
import {DataSource, SelectionModel} from '@angular/cdk/collections';
import * as XLSX from "xlsx";
import {ExportToXslService} from "@services/export-to-xsl.service";
import {CampagnesService} from "@services/campagnes.service";
import {FormControl} from "@angular/forms";
import {FilterService} from "@services/filter.service";
import {Filter, FilterControl} from "@models/filter";
import {MatSnackBar} from "@angular/material/snack-bar";
import {Clipboard} from '@angular/cdk/clipboard';

@Component({
  selector: 'app-grille-tarif-marque',
  templateUrl: './grille-tarif-marque.component.html',
  styleUrls: ['./grille-tarif-marque.component.scss']
})
export class GrilleTarifMarqueComponent implements AfterContentInit {

  /** Marque récupéré en parametre */
  marque: string = this.route.snapshot.paramMap.get('marque');
  /** Liste des tarifs de la marque */
  grilleTarif: GrilleTarifaire[] = [];
  /** Liste des champs de la table */
  displayedColumns: string[] = ['name', 'createdAt', 'size', 'share', 'action'];
  clientDisplayedColumns: string[] = ['select', 'client', 'raison', 'adresse', 'region', 'telephone', 'datedebut', 'datefin', 'collibelle', 'colonne'];
  dataSource: MatTableDataSource<FileDownloaded> = new MatTableDataSource<FileDownloaded>();
  clientColonne: MatTableDataSource<ClientColonne> = new MatTableDataSource<ClientColonne>();
  @ViewChild(`clientPaginator`, {static: true}) clientPaginator: MatPaginator;
  @ViewChild('paginator', {static: true}) paginator: MatPaginator;
  @ViewChild('empTbSort') empTbSort = new MatSort();
  @ViewChild('empTbSortWithObject') empTbSortWithObject = new MatSort();
  selection = new SelectionModel<ClientColonne>(true, []);

  /** True si elle est ouverte / false si elle est fermé ne soit pas con */
  showPopup: boolean = false;
  testUpload: Array<any> = [];
  @ViewChild('fileInput') fileInput: ElementRef;
  nomMarque: string = '';
  tesGrosseMelissandre: boolean = false;
  pasLesBonsChiffres: boolean = false;
  rowSelected: { name: string, createdAt: string } = {name: '', createdAt: ''};

  filtreControls: FilterControl = {};
  filtres: Filter[] = [];

  constructor(private http: HttpClient,
              private route: ActivatedRoute,
              public fileService: FileService,
              protected exportToXsl: ExportToXslService,
              protected campagnesService: CampagnesService,
              private filterService: FilterService,
              private clipboard: Clipboard,
              private snackBar: MatSnackBar) {}

  get tarifMarque() {
    return this.http.get<GrilleTarifaire[]>(`${environment.apiUrl}/MarqueLibColonne.php`, {
      params: {
        marque: this.marque
      }
    });
  }

  ngAfterContentInit(): void {
    this.empTbSort.disableClear = true;
    this.empTbSortWithObject.disableClear = true;


    this.getClientColonne();
    this.tarifMarque.subscribe(data => {
      this.grilleTarif = data;
      this.nomMarque = data[0].marque
    });
    this.grilleTarif.slice(0, 0);
    this.files();
    setTimeout(() => {
      this.fileInput = this.fileInput.nativeElement;
    }, 100);
  }

  getClientColonne() {
    this.http.get<ClientColonne[]>(`${environment.apiUrl}/ListeRemisesColonnes.php`, {
      params: {
        marque: this.marque
      },
    }).subscribe((data: ClientColonne[]) => {
      this.clientColonne.data = data;

      const filtersNamesAndTypes = [
        { name: 'raison', type: 'input' },
        { name: 'numclient', type: 'input', displayName: 'N°Client' },
        { name: 'region', type: 'select' },
        { name: 'ville', type: 'select' },
        { name: 'collibelle', type: 'select', displayName: 'Libelle' },
      ];

      const { filtres, filtreControls } = this.filterService.initFiltres(this.clientColonne, filtersNamesAndTypes);
      this.filtres = filtres;
      this.filtreControls = filtreControls;

      this.clientColonne.paginator = this.clientPaginator;
      this.clientColonne.sort = this.empTbSortWithObject;
    });

  }

  applyFilter(event: Event, dataSource: MatTableDataSource<any>) {
    const filterValue = (event.target as HTMLInputElement).value;
    dataSource.filter = filterValue.trim().toLowerCase();

    if (dataSource.paginator) {
      dataSource.paginator.firstPage();
    }
  }

  uploadFile(event: any) {
    this.testUpload.push(event);
    let payload = new FormData();
    payload.append('file', event);
    if (payload.get('file')['size'] > 52428800) {
      this.tesGrosseMelissandre = true;
    } else {
      this.http.post(`${environment.apiUrl}/uploadFiles.php`, payload,
        {
          params: {
            marque: this.marque,
            type: 'DossiersMarques'
          },
          withCredentials: true,
          responseType: 'text'
        }
      ).subscribe(
        () => {
          this.files();
        }
      );
    }
  }

  files() {
    this.http.get(`${environment.apiUrl}/loadFiles.php`, {
      params: {
        marque: this.marque
      }
    }).subscribe(
      (data: FileDownloaded[]) => {

        this.dataSource.data = data;
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.empTbSort;
      }
    );
  }

  deleteFile(filename: string) {
    this.fileService.deleteFileMarque(filename, this.marque).subscribe(
      data => {
        this.files();
        this.showPopup = false;
      }
    )
  }

  openSupprConfirm(row) {
    this.showPopup = true;
    this.rowSelected = row;
  }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.clientColonne.data.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  toggleAllRows() {
    if (this.isAllSelected()) {
      this.selection.clear();
      return;
    }

    this.selection.select(...this.clientColonne.data);
  }

  /** The label for the checkbox on the passed row */
  checkboxLabel(row?: ClientColonne): string {
    if (!row) {
      return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.adresse + 1}`;
  }

  onShareClicked(filename: string, marque: string) {
    const urlFriendlyFilename = encodeURIComponent(filename);
    const linkToCopy = `${environment.apiUrl}/downloadFiles.php?marque=${marque}&type=DossiersMarques&filename=${urlFriendlyFilename}`;
    const successful = this.clipboard.copy(linkToCopy);

    if (successful) {
      this.snackBar.open('Copié dans le presse-papier', 'Fermer', {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'bottom'
      });
    } else {
      this.snackBar.open('Erreur lors de la copie', 'Fermer', {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'bottom'
      });
    }
  }

}

export interface ClientColonne {
  adresse: string;
  numclient: string;
  codepostal: string;
  collibelle: string;
  colonne: string;
  datedebut: string;
  datefin: string;
  marque: string;
  raison: string;
  region: string;
  telephone: string;
  ville: string;


}
