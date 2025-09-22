import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {environment} from "@env/environment";
import {CompteRenduVisite} from "@models/compteRenduVisite";
import {Contact} from "@models/contact";
import {MotifCompteRendu} from "@components/client-detail/client-detail.component";
import {FormGroup} from "@angular/forms";
import {AuthenticationService} from "@services/authentication.service";
import {Client} from "@/models";
import {Prospect} from "@models/prospect";
import {forkJoin, Observable} from "rxjs";

/**
 * A service for managing visit related operations.
 */
@Injectable({
  providedIn: 'root'
})
export class VisiteService {

  constructor(private http: HttpClient,
              private auth: AuthenticationService) { }

  private uniqueVisitesCount: number;

  get visitesCount(): number {
    return this.uniqueVisitesCount;
  }

  set visitesCount(arr: any[]) {
    const uniqueArr = arr.filter((v,i,a)=>a.findIndex(t=>(t.numclient === v.numclient))===i);
    this.uniqueVisitesCount = uniqueArr.length;
  }

  /**
   * Indicates whether the code is running on the client or prospect.
   *
   * @type {boolean}
   */
  isClient: boolean;

  /**
   * Retrieves the visits for a client or prospect.
   *
   * @param {boolean} isClient - Determines whether the visits are for a client (true) or a prospect (false).
   * @param {number} id - The ID of the client or prospect.
   * @returns {Observable<CompteRenduVisite[]>} - An observable that resolves to an array of visit reports.
   */
  getVisites(isClient: boolean, id: number): Observable<CompteRenduVisite[]>{
    this.isClient = isClient;
    return this.http.get<CompteRenduVisite[]>(`${environment.apiUrl}/${isClient ? 'clientsVisites.php' : 'ProspectVisites.php'}`, {
      params: {
        mode: 'SEL',
        numclient: id
      },
      withCredentials: true
    });
  }

  /**
   * Converts the date format of each report in the given array and sorts the array in descending order based on the converted dates.
   *
   * @param {CompteRenduVisite[]} reports - The array of reports with date in the format 'DD/MM/YY'.
   * @return {CompteRenduVisite[]} - The sorted array of reports with dates converted to 'MM/DD/YYYY' format.
   */
  convertDate(reports: CompteRenduVisite[]): CompteRenduVisite[] {
    reports.forEach(report => {
      let test = report.date.split('/');
      test[2] = 20 + test[2]
      let date = new Date(Date.UTC(Number(test[2]), Number(test[1]) - 1, Number(test[0])));
      report.date = date.toLocaleDateString('en-US');
    });
    return reports.sort((a, b) => {
      return <any>new Date(b.date) - <any>new Date(a.date);
    });
  }

  /**
   * Retrieve contacts based on client ID.
   *
   * @param {number} id - The client ID.
   * @returns {Observable<Contact[]>} - An observable of an array of contact objects.
   */
  getContacts(id: number): Observable<Contact[]> {
    return this.http.get<Contact[]>(`${environment.apiUrl}/${this.isClient ? 'ListeclientsContacts.php' : 'ListeProspectontacts.php'}`, {
      params: {
        numclient: id
      }
    });
  }

  /**
   * Retrieves the motifs of compte rendus.
   *
   * @returns {Observable<MotifCompteRendu[]>} The Observable that emits an array of MotifCompteRendu objects.
   */
  getMotifs(): Observable<MotifCompteRendu[]> {
    return this.http.get<MotifCompteRendu[]>(`${environment.apiUrl}/MotifCompteRendu.php`);
  }

  /**
   * Splits a given date string into its parts.
   *
   * @param {string} date - The date string to split. The format should be "MM/DD".
   *
   * @return {Array} - An array containing the date parts: [month, day].
   */
  dateParted(date: string): Array<any> {
    let dateParts = date.split('/');
    dateParts[0] = dateParts[0].padStart(2, '0');
    dateParts[1] = dateParts[1].padStart(2, '0');
    return dateParts;
  }

  /**
   * Add a visit report for a given form, id, and contacts list.
   *
   * @param {FormGroup} form - The form to submit the visit report.
   * @param {number} id - The ID of the client or prospect.
   * @param {Contact[]} contactsList - The list of contacts related to the client or prospect.
   * @returns {Observable} - An observable that represents the HTTP request to add the visit report.
   */
  addCompteRendu(form: FormGroup, id: number, contactsList: Contact[]): Observable<any>{
    let date = new Date(form.get('date').value).toLocaleDateString('fr-FR');
    let dateFormatted = date.split('/');
    let index: Array<number> = form.get('contact').value;
    let contact = contactsList[index[0]];

    let tel = '', mail = '', nom = '', resContacts: string;

    if(contact != undefined) {
      tel = contact.gsm;
      mail = contact.mail;
      nom = contact.nom;
    }

    if(dateFormatted[0] == 'Invalid Date'){
      let todayDate = new Date().toLocaleDateString('fr-FR');
      dateFormatted = todayDate.split('/');
    }

    let arrContactSelect = index.slice(1).map(i => contactsList[i].mail);

    resContacts = arrContactSelect.length > 0
      ? `${arrContactSelect.join('\n')} \n${form.get('commentaire').value}`
      : form.get('commentaire').value;

    return this.http.get(`${environment.apiUrl}/${this.isClient ? 'clientsVisites.php' : 'ProspectVisites.php'}`, {
      withCredentials: true,
      responseType: "json",
      params: {
        mode: 'ADD',
        numclient: id,
        date: dateFormatted[2] + dateFormatted[1] + dateFormatted[0],
        action: form.get('action').value,
        texte: resContacts,
        nom: nom,
        mail: mail,
        tel: tel,
      }
    });
  }

  /**
   * Deletes a visit report based on the provided parameters.
   *
   * @param {number} id - The ID of the CompteRendu.
   * @param {string} action - The action to perform.
   * @param {string} date - The date of the CompteRendu in string format (e.g., "2021-01-01").
   * @returns {Observable<Object>} - The response from the API call.
   */
  deleteCompteRendu(id: number, action: string, date: string): Observable<object> {

    let dateParts = this.dateParted(date);
    let dateFormatted = `${dateParts[2]}${dateParts[0]}${dateParts[1]}`;

    return this.http.get(`${environment.apiUrl}/${this.isClient ? 'clientsVisites.php' : 'ProspectVisites.php'}`, {
      params: {
        mode: 'DEL',
        date: dateFormatted,
        numclient: id,
        action: action
      },
      withCredentials: true
    })
  }

  /**
   * Edits the compte rendu of a visit.
   *
   * @param {number} id - The ID of the visit.
   * @param form
   * @return {Observable} - An Observable that makes a HTTP GET request to update the compte rendu.
   */
  editCompteRendu(id: number, form: FormGroup): Observable<any>{
    let dateParts = this.dateParted(form.value.date);
    let dateFormatted = `${dateParts[2]}${dateParts[0]}${dateParts[1]}`;

    return this.http.get(`${environment.apiUrl}/${this.isClient ? 'clientsVisites.php' : 'ProspectVisites.php'}`, {
      params: {
        mode: 'UPD',
        numclient: id,
        date: dateFormatted,
        action: form.value.action,
        texte: form.value.commentaire,
        mail: form.value.contact[0]
      },
      withCredentials: true
    })
  }

  /**
   * Sends a mail using the given parameters.
   *
   * @param {boolean} toRegion - Whether to send the mail to the region or not.
   * @param {FormGroup} form - The form containing the mail details.
   * @param {Client} client - The client object.
   * @param {Prospect} prospect - The prospect object.
   * @return {Observable<any>} - An observable representing the HTTP request to send the mail.
   */
  sendMail(toRegion: boolean, form: FormGroup, client: Client, prospect: Prospect): Observable<any> {
    let commercial = '';
    if(toRegion){
      if(client){
        commercial = client.commercialMail
      }else{
        commercial = prospect.commercialMail1
      }
    }

    const estUnClient = client ? true : false;

    return this.http.get(`${environment.apiUrl}/envoieCompteRendu.php`, {
      params : {
        compteRendu: form.get('compteRendu').value,
        mail: form.get('to').value,
        cc: form.get('cc').value,
        region: commercial,
        estUnClient: estUnClient,
        num: estUnClient ? client.numclient : prospect.numprospect,
        regionClient: estUnClient ? client.region : prospect.region,
        date: form.get('date').value,
        nomEntreprise: estUnClient ? client.nom : prospect.nom,
        contact: form.get('contact').value,
        action: form.get('action').value,
        mailCommercial: this.auth.currentUser['mail']
      }
    })
  }

  getAllVisite() {
    return forkJoin({
      clients: this.http.get<CompteRenduVisite[]>(`${environment.apiUrl}/clientsVisites.php`, {
        params: {
          mode: 'ALL'
        },
        withCredentials: true
      }),
      prospects: this.http.get<CompteRenduVisite[]>(`${environment.apiUrl}/ProspectVisites.php`, {
        params: {
          mode: 'ALL'
        },
        withCredentials: true
      })
    })
  }

  getVisiteByCampaignByPeople(campagne: string, type: string, idClient: string) {
    return this.http.get<CompteRenduVisite[]>(`${environment.apiUrl}/${type === 'C' ? 'clientsVisites.php' : 'ProspectVisites.php'}`, {
      params: {
        mode: 'SEL',
        campagne: campagne,
        numclient: idClient
      },
      withCredentials: true
    });
  }

  countVisiteByCampaign(campaign: string) {
    return forkJoin({
      clients: this.http.get<CompteRenduVisite[]>(`${environment.apiUrl}/clientsVisites.php`, {
        params: {
          mode: 'SEL',
          campagne: campaign
        },
        withCredentials: true
      }),
      prospects: this.http.get<CompteRenduVisite[]>(`${environment.apiUrl}/ProspectVisites.php`, {
        params: {
          mode: 'SEL',
          campagne: campaign
        },
        withCredentials: true
      })
    })
  }
}
