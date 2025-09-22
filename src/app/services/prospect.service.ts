import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {environment} from "@env/environment";
import {Prospect} from "@models/prospect";
import {Departement} from "@models/departement";
import {FormGroup} from "@angular/forms";
import {Observable} from "rxjs";
import {FonctionUser} from "@models/fonctionUser";

@Injectable({
  providedIn: 'root'
})
export class ProspectService {

  departmentList: Departement[] = [];

  constructor(
    private http: HttpClient
  ) {
    this.getDepartments()
  }

  getDepartments(){
      this.http.get<Array<Departement>>(`${environment.apiUrl}/departement.php`).subscribe(
        (dep) => {
          this.departmentList = dep;
        }
      );
  }

  getFunc() {
    return this.http.get<FonctionUser[]>(`${environment.apiUrl}/fonctionuser.php`);
  }

    /**
   * Retrieves the prospects from the server.
   *
   * @return {Observable<Array<Prospect>>} An observable representing the prospects.
   */
  getProspects(): Observable<Array<Prospect>>{
    return this.http.get<Array<Prospect>>(`${environment.apiUrl}/ListeProspect.php`);
  }

  /**
   * Retrieves the list of unique regions from the department list.
   *
   * @returns {Array<any>} An array containing the unique regions.
   */
  get region(): Array<any> {
    let region = [];
    this.departmentList.forEach((e) => {
      if(e.region != ' ' && e.region != ''){
        region.push(e.region);
      }
    });
    region = region.filter((x, i) => region.indexOf(x) === i);
    return region;
  }

  /**
   * Add a prospect to the database.
   *
   * @param {FormGroup} prospect - The form group containing the prospect data.
   * @return {Observable} - An observable representing the HTTP request.
   */
  addProspect(prospect: FormGroup): Observable<any>{
    return this.http.get(`${environment.apiUrl}/ProspectMAJ.php`, {
      params: {
        mode : 'ADD',
        prospect: 0,
        siret: prospect.value.siret,
        nom: prospect.value.nom,
        origine: prospect.value.originerecrutement,
        daterecrutement: prospect.value.daterecrutement,
        region: prospect.value.region,
        siteweb: prospect.value.siteweb,
        ape: prospect.value.ape,
        adresse1: prospect.value.adresse1,
        adresse2: '',
        adresse3: '',
        departement: prospect.value.departement,
        codepostal: prospect.value.codepostal,
        ville: prospect.value.ville,
        telephone: prospect.value.telephone,
        qualite: prospect.value.qualite,
        contactprenom: prospect.value.contactprenom,
        contactnom: prospect.value.contactnom,
        mail: prospect.value.mail,
        service: prospect.value.service,
        fonction: prospect.value.fonction,
        contacttelephone: prospect.value.contacttelephone,
        contactgsm: prospect.value.contactgsm,
        activite: prospect.value.activite,
        status: prospect.value.status,
        commentaire: prospect.value.commentaire,
        groupe : prospect.value.groupe
      }
    });
  }

  /**
   * Deletes a prospect based on its SIRET
   *
   * @param {string} prospect - The number of the prospect to be deleted
   *
   * @return {Observable<any>} - An RxJS Observable representing the HTTP GET request to delete the prospect
   *                             The response will be an object containing the result of the request
   */
  delProspect(prospect: number): Observable<any>{
    return this.http.get(`${environment.apiUrl}/ProspectMAJ.php`, {
      params: {
        mode: 'DEL',
        prospect: prospect
      }
    });
  }

  /**
   * Updates a prospect in the database.
   *
   * @param {FormGroup} prospect - The prospect object to update.
   *
   * @returns {Observable} - An observable that emits the updated prospect.
   */
  updProspect(prospect: FormGroup): Observable<any>{
    return this.http.get(`${environment.apiUrl}/ProspectMAJ.php`, {
      params: {
        mode: 'UPD',
        siret: prospect.value.numSiret ?? '',
        nom: prospect.value.nomSociete ?? '',
        origine: prospect.value.origine ?? '',
        daterecrutement: prospect.value.dateRecrutement ?? '',
        region: prospect.value.region ?? '',
        siteweb: prospect.value.siteWeb ?? '',
        ape: prospect.value.numApe ?? '',
        adresse1: prospect.value.adresse ?? '',
        adresse2: '',
        adresse3: '',
        departement: prospect.value.departement ?? '',
        codepostal: prospect.value.codePostal ?? '',
        ville: prospect.value.ville ?? '',
        telephone: prospect.value.numTelephone ?? '',
        qualite: prospect.value.qualite ?? '',
        contactprenom: prospect.value.prenom ?? '',
        contactnom: prospect.value.nom ?? '',
        mail: prospect.value.mail ?? '',
        service: prospect.value.service ?? '',
        fonction: prospect.value.fonction ?? '',
        contacttelephone: prospect.value.numTelephone ?? '',
        contactgsm: prospect.value.contactgsm ?? '',
        activite: prospect.value.activite ?? '',
        status: prospect.value.status ?? '',
        commentaire: prospect.value.commentaire ?? '',
        prospect: prospect.value.numprospect,
        groupe: prospect.value.groupe ?? ''
      }
    });
  }

  /**
   * Retrieves the prospect data based on the given SIRET value.
   *
   * @param {string} prospect - The num value of the prospect.
   * @returns {Observable<Prospect>} - An observable that emits the prospect data.
   */
  getProspect(prospect: number): Observable<Prospect>{
    return this.http.get<Prospect>(`${environment.apiUrl}/ProspectMaj.php`, {
      params: {
        mode: 'SEL',
        prospect: prospect
      }
    });
  }

  getGroupement(){
    return this.http.get<any[]>(`${environment.apiUrl}/groupement.php`);
  }

}
