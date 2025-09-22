import {AfterContentInit, Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';
import {LogClientService} from "@services/log-client.service";
import {FileDownloaded} from "@models/fileDownloaded";
import {MatTableDataSource} from "@angular/material/table";
import {MatPaginator} from "@angular/material/paginator";
import {MatSort} from "@angular/material/sort";
import {FileService} from "@services/file.service";
import {environment} from "@env/environment";
import {Clipboard} from "@angular/cdk/clipboard";
import {MatSnackBar} from "@angular/material/snack-bar";

@Component({
  selector: 'app-documents',
  templateUrl: './documents.component.html',
  styleUrls: ['./documents.component.scss']
})
export class DocumentsComponent implements OnInit, AfterContentInit{

  @Input() idClient: number = undefined;
  @Input() groupement: any = undefined;
  @Input() campagne: string = undefined;

  @ViewChild('fileInput') fileInput: ElementRef;
  @ViewChild('fileInputGroupe') fileInputGroupe: ElementRef;
  @ViewChild('fileInputCampagne') fileInputCampagne: ElementRef;

  @ViewChild('paginatorClient') paginatorClient: MatPaginator;
  @ViewChild('paginatorGroupe') paginatorGroupe: MatPaginator;
  @ViewChild('paginatorCampagne') paginatorCampagne: MatPaginator;

  titleName: string = 'Documents';

  /** Liste des champs de la table */
  displayedColumns: string[] = ['name', 'createdAt', 'share', 'action'];

  dataSource: MatTableDataSource<FileDownloaded> = new MatTableDataSource<FileDownloaded>();
  dataSourceGroupe: MatTableDataSource<FileDownloaded> = new MatTableDataSource<FileDownloaded>();
  dataSourceCampagne: MatTableDataSource<FileDownloaded> = new MatTableDataSource<FileDownloaded>();

  @ViewChild(MatPaginator) paginator: MatPaginator;

  @ViewChild(MatSort) sort: MatSort;

  showPopup: boolean = false;

  rowSelected: {name: string, createdAt: string} = {name: '', createdAt: ''};

  typeDeletion: number | string ;

  constructor(
    private authClient: LogClientService,
    public fileService: FileService,
    private clipboard: Clipboard,
    private snackBar: MatSnackBar) {
  }

  ngOnInit() {
    setTimeout(() => {
      if(this.campagne){
        this.getDocsCampagne();
      }else{
        if(!this.idClient){
          this.idClient = this.authClient.currentClient.id;
        }
        if (this.idClient.toString().length > 8 ) {
          this.titleName = 'Documents du prospect';
        } else {
          this.titleName = 'Documents du client';
        }
        this.getDocs();
      }
    }, 100)

  }

  ngAfterContentInit(): void {
    this.checkGroupement();
  }

  checkGroupement(): void {

    setTimeout(() => {

      if (!this.groupement) {

        this.fileService.getGroupement(this.idClient).subscribe(
          (data) => {

            this.groupement = data;
            this.getDocsGroupe();
          },
          (error) => {
            console.error('Error fetching groupement', error);
          }
        );
      } else {

        this.getDocsGroupe();
      }
    }, 200);
  }

  getDocs(){
    this.fileService.getFilesClient(this.idClient).subscribe(
      (data) => {
        this.dataSource.data = data;
        this.dataSource.paginator = this.paginatorClient;
        this.dataSource.sort = this.sort;
      }
    );
  }

  getDocsGroupe(){
    this.fileService.getFilesGroupe(this.groupement).subscribe(
      (data) => {
        this.dataSourceGroupe.data = data;
        this.dataSourceGroupe.paginator = this.paginatorGroupe;
        this.dataSourceGroupe.sort = this.sort;
      }
    )
  }

  getDocsCampagne(){
    this.fileService.getFilesCampagne(this.campagne).subscribe(
      (data) => {
        this.dataSourceCampagne.data = data;
        this.dataSourceCampagne.paginator = this.paginatorCampagne;
        this.dataSourceCampagne.sort = this.sort;
      });
  }

  tesGrosseMelissandre: boolean = false;
  pasLesBonsChiffres: boolean = false;

  uploadFile(event: any){

    let payload = new FormData();
    payload.append('file', event);
    if(payload.get('file')['size'] > 52428800) {
      this.tesGrosseMelissandre = true;
    }else{
      this.fileService.uploadFileClient(this.idClient, payload).subscribe(
        () => {
          this.getDocs();
          this.fileInput.nativeElement.value = '';
        }, error => {
          if(error.error == '\tVous devez uploader un fichier de type png, gif, jpg, jpeg, txt ou doc...'){
            this.pasLesBonsChiffres = true;
          }
        }
      );
    }

  }

  uploadFileGroupe(event: any){
    let payload = new FormData();
    payload.append('file', event);
    if(payload.get('file')['size'] > 52428800) {
      this.tesGrosseMelissandre = true;
    }else{
      this.fileService.uploadFileGroupe(this.groupement, payload).subscribe(
        () => {
          this.getDocsGroupe();
          this.fileInputGroupe.nativeElement.value = '';
        }, error => {
          if(error.error == '\tVous devez uploader un fichier de type png, gif, jpg, jpeg, txt ou doc...'){
            this.pasLesBonsChiffres = true;
          }
        }
      );
    }

  }

  uploadFileCampagne(event: any){


    let payload = new FormData();
    payload.append('file', event);
    if(payload.get('file')['size'] > 52428800) {
      this.tesGrosseMelissandre = true;
    }else{
      this.fileService.uploadFileCampagne(this.campagne, payload).subscribe(
        () => {
          this.getDocsCampagne();
          this.fileInputCampagne.nativeElement.value = '';
        }, error => {
          if(error.error == '\tVous devez uploader un fichier de type png, gif, jpg, jpeg, txt ou doc...'){
            this.pasLesBonsChiffres = true;
          }
        }
      );
    }

  }

  deleteFile(filename: string, type: string){

    if(type == 'groupe'){


      this.fileService.deleteFileGroupe(filename, this.groupement).subscribe(
        () => {
          this.getDocsGroupe();
          this.showPopup = false;
          this.typeDeletion = '';
        }
      );
    }else if(type === 'client'){


      this.fileService.deleteFileClient(filename, this.idClient).subscribe(
        () => {
          this.getDocs();
          this.showPopup = false;
          this.typeDeletion = '';
        }
      );
    } else {


      this.fileService.deleteFileCampagne(filename, this.campagne).subscribe(
        () => {
          this.getDocsCampagne();
          this.showPopup = false;
          this.typeDeletion = '';
        }
      );
    }
  }

// Ajoutez cette méthode pour gérer les trois valeurs possibles de typeDeletion
getDeletionParameter(): string {


  if (this.typeDeletion === 'groupe') {
    return 'groupe';
  } else if (this.typeDeletion === 'client') {
    return 'client';
  } else if (this.typeDeletion === 'campagne') {
    return 'campagne';
  } else {
    return '';
  }
}


  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  openSupprConfirm(row, type){
    this.showPopup = true;
    this.rowSelected = row;
    this.typeDeletion = type;
  }

  shareDocumentsClient(filename: string, idClient: string) {
    const urlFriendlyFilename = encodeURIComponent(filename);
    const linkToCopy = `${environment.apiUrl}/downloadFiles.php?client=${idClient}&type=DossiersClient&filename=${urlFriendlyFilename}`;
    this.shareDocuments(linkToCopy);
  }

  shareDocumentsGroupement(filename: string, groupe: string) {
    const urlFriendlyFilename = encodeURIComponent(filename);
    const linkToCopy = `${environment.apiUrl}/downloadFiles.php?groupe=${groupe}&type=DossiersClient&filename=${urlFriendlyFilename}`;
    this.shareDocuments(linkToCopy);
  }

  shareDocumentsCampagne(filename: string, campagne: string) {
    const urlFriendlyFilename = encodeURIComponent(filename);
    const linkToCopy = `${environment.apiUrl}/downloadFiles.php?campagne=${campagne}&type=DossierCampagne&filename=${urlFriendlyFilename}`;
    this.shareDocuments(linkToCopy);
  }

  shareDocuments(linkToCopy: string) {
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
