import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { environment } from "@env/environment";
import { Campagne } from "@models/campagne";
import { CampaignDialogComponent } from "@components/_util/components/campaign-dialog/campaign-dialog.component";
import * as XLSX from "xlsx";
import { MatDialog } from "@angular/material/dialog";
import { SelectionModel } from "@angular/cdk/collections";
import { FileService } from "@services/file.service";
import { SnackbarService } from "@services/snackbar.service";
import { PeopleOfCampaign } from "@models/peopleOfCampaign";
import { BehaviorSubject, Observable } from "rxjs";
import { Action } from "@models/action";
import { FormGroup } from "@angular/forms";
import { AuthenticationService } from "@services/authentication.service";
import { CompteRenduVisite } from "@models/compteRenduVisite";
import { RenduCampaign } from "@models/renduCampaign";

@Injectable({
  providedIn: 'root'
})
export class CampagnesService {

  campaignAffected: string;
  selection: SelectionModel<any>;

  private peopleSource = new BehaviorSubject([]);
  currentPeople = this.peopleSource.asObservable();

  private campagneSource = new BehaviorSubject(new Campagne('', '', '', '', '', '', '', '', '', ''));
  currentCampagne = this.campagneSource.asObservable();

  actionCampaign: Action[] = [];

  constructor(private http: HttpClient,
    private dialog: MatDialog,
    private fileUploadService: FileService,
    private snackBarService: SnackbarService,
    private authService: AuthenticationService) { }

  getCampagnes() {
    return this.http.get<Campagne[]>(`${environment.apiUrl}/Campagnes.php`, { params: { mode: 'SEL' } });
  }

  addCampagne(campagne: Campagne) {
    return this.http.get(`${environment.apiUrl}/Campagnes.php`, {
      params: {
        mode: 'ADD',
        campagne: campagne.campagne,
        libelle: campagne.libelle,
        datedeb: campagne.datedeb,
        datefin: campagne.datefin,
        user1: campagne.user1,
        user2: campagne.user2,
        user3: campagne.user3,
        user4: campagne.user4,
        texte: campagne.texte,
        USERAS: this.authService.currentUser.USERAS
      }, withCredentials: true
    });
  }

  updateCampagne(campagne: Campagne) {
    return this.http.get(`${environment.apiUrl}/Campagnes.php`, {
      params: {
        mode: 'UPD',
        campagne: campagne.campagne,
        libelle: campagne.libelle,
        datedeb: campagne.datedeb,
        datefin: campagne.datefin,
        user1: campagne.user1,
        user2: campagne.user2,
        user3: campagne.user3,
        user4: campagne.user4,
        texte: campagne.texte
      }, withCredentials: true
    });
  }

  deleteCampagne(id: string) {
    return this.http.get(`${environment.apiUrl}/Campagnes.php`, {
      params: {
        mode: 'DEL',
        campagne: id
      }
    });
  }

  getCampagneById(id: string) {
    return this.http.get<Campagne>(`${environment.apiUrl}/Campagnes.php`, {
      params: {
        mode: 'SEL',
        campagne: id
      }
    });
  }

  openCampaignDialog(selection: SelectionModel<any>): void {
    const dialogRef = this.dialog.open(CampaignDialogComponent, {
      width: '350px',
      data: { name: 'data to pass' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.campaignAffected = result;
        this.selection = selection;
        this.onFileSelected();
      }
    });
  }

  exportCampaign(): Blob {
    let data = [];

    this.selection.selected.forEach((d) => {

      if (d.type == 'PROSPECT') {
        data.push({ ' ': 'p;' + d.cle });
      } else {
        data.push({ ' ': 'c;' + d.numclient.toString().padStart(8, '0') });
      }
    });

    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, this.campaignAffected);

    const wbout = XLSX.write(wb, { bookType: 'csv', type: 'array' });

    return new Blob([wbout], { type: 'text/csv' });
  }

  onFileSelected() {
    const file: Blob = this.exportCampaign();
    const fileToUpload = new File([file], this.campaignAffected + '.csv');

    if (fileToUpload) {
      this.fileUploadService.uploadFileCampaign(fileToUpload, `${environment.apiUrl}/uploadCampaign.php`).subscribe(
        () => {
          this.snackBarService.showSnackbar('Les clients / prospects ont bien été ajoutés à la campagne ' + this.campaignAffected, '', undefined, 5000, { warning: false, large: false });
          this.http.get(`${environment.apiUrl}/CampagneIDrecup.php`, {
            params: {
              campagne: this.campaignAffected
            }
          }).subscribe();
        }, () => {
          this.snackBarService.showSnackbar('Erreur lors de l\'ajout des clients / prospects à la campagne ' + this.campaignAffected, '', undefined, 5000, { warning: true, large: false });
        }
      );
    }
  }

  getPeopleByCampaign(campagne: string) {
    return this.http.get<PeopleOfCampaign[]>(`${environment.apiUrl}/CampagneID.php`, {
      params: {
        campagne: campagne
      }
    });
  }

  groupContacts(contacts: PeopleOfCampaign[]): PeopleOfCampaign[] {
    const grouped = contacts.reduce((grouped, contact) => {
      let key = contact.numero;
      if (!grouped.has(key)) {
        grouped.set(key, {
          type: contact.type,
          numero: contact.numero,
          raisonSociale: contact.raisonSociale,
          region: contact.region,
          siret: contact.siret,
          ape: contact.ape,
          adresse1: contact.adresse1,
          adresse2: contact.adresse2,
          adresse3: contact.adresse3,
          departement: contact.departement,
          codepostal: contact.codepostal,
          ville: contact.ville,
          telephone: contact.telephone,
          steAppel: contact.steAppel,
          contacts: []
        });
      }
      grouped.get(key).contacts.push({
        mail: contact.email,
        mailing: contact.mailing,
        service: contact.service,
        nom: contact.interlocuteur,
        fixe: contact.fixe,
        gsm: contact.gsm,
        statut: contact.statut,
        appel: contact.appel,
        appelTri: contact.appelTri,
        numindividu: contact.numindividu,
        fonction: contact.fonction,
        fonctioncode: contact.fonctioncode,
      });
      return grouped;
    }, new Map());

    grouped.forEach((group: PeopleOfCampaign) => {
      let code = 0;
      let appelLabel = '';
      group.contacts.map((contact) => {
        if (Number(contact.appelTri) > code) {
          code = Number(contact.appelTri);
          appelLabel = contact.appel;
        }
      });
      group.appel = appelLabel;
    });

    return Array.from(grouped.values());
  }

  groupCompteRendu(contacts: CompteRenduVisite[]): RenduCampaign[] {
    const grouped = contacts.reduce((grouped, contact) => {
      let key = contact.numclient;
      if (!grouped.has(key)) {
        grouped.set(key, {
          adresse1: contact.adresse,
          codepostal: contact.codepostal,
          departement: contact.departement,
          numclient: contact.numclient,
          telephone: contact.telsociete,
          raisonSociale: contact.raison,
          region: contact.region,
          ville: contact.ville,
          type: contact.type,
          siret: contact.siret,
          rendus: []
        });
      }
      grouped.get(key).rendus.push({
        nom: contact.contactnom,
        mail: contact.contactmail,
        date: contact.date,
        gsm: contact.contacttel,
        texte: contact.texte,
        appelcode: contact.appelcode,
        appellib: contact.appellib,
        user: contact.user
      });
      return grouped;
    }, new Map());

    return Array.from(grouped.values());
  }

  changePeople(people: any[]) {
    this.peopleSource.next(people);
  }

  changeCampaign(campaign: Campagne) {
    this.campagneSource.next(campaign);
  }

  getActionCampaign() {
    return this.http.get<Action[]>(`${environment.apiUrl}/CampagneCodeAppel.php`);
  }

  addCompteRenduClient(infosContact, form: FormGroup, isClient: boolean) {
    let date = this.fomatterDate(form.getRawValue().date);
    if (date[0] == 'Invalid Date') {
      let todayDate = new Date().toLocaleDateString('fr-FR');
      date = todayDate.split('/');
    }

    const url = environment.apiUrl + (isClient ? '/clientsVisites.php' : '/ProspectVisites.php');

    return this.http.get(url, {
      withCredentials: true,
      params: {
        mode: 'ADD',
        numclient: infosContact.numclient,
        date: date[2] + date[1] + date[0],
        texte: form.value.commentaire,
        action: 'TEL',
        campagne: infosContact.campagne,
        appel: form.value.action,
        mail: infosContact.mail,
        nom: infosContact.nom,
        tel: infosContact.tel
      }
    });
  }

  fomatterDate(date: string) {
    let newDate = new Date(date).toLocaleDateString('fr-FR');
    let dateFormatted = newDate.split('/');
    if (dateFormatted[0] == 'Invalid Date') {
      let todayDate = new Date().toLocaleDateString('fr-FR');
      dateFormatted = todayDate.split('/');
    }

    return dateFormatted;
  }

}
