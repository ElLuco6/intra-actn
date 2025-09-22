import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from "rxjs";
import { Adresse, Contact } from "@/models";
import { Contact as clientContact } from "@/models/contact"
import { AuthenticationService } from "./authentication.service";
import { environment } from "@env/environment";
import { HttpClient } from "@angular/common/http";
import { FormGroup } from "@angular/forms";
import { RmaService } from "@services/rma.service";
import { LogClientService } from "@services/log-client.service";
import { FonctionUser } from "@models/fonctionUser";

@Injectable({
  providedIn: 'root'
})
export class UserService {

  get contacts$(): Observable<Contact[]> {
    return this._contacts$.asObservable();
  }

  private _contacts$ = new BehaviorSubject<Contact[]>([])

  private _defaultContact = {
    nom: 'Service commercial',
    tel: '05 62 488 488',
    mail: '',
    telLink: '+33562488488'
  };

  public contactGroupName = 'Contact';

  constructor(
    private authService: AuthenticationService,
    private authClient: LogClientService,
    private http: HttpClient,
    private rmaService: RmaService
  ) {
    this._parseContacts();
  }

  private _parseContacts(): void {
    this.authClient._currentCient$.subscribe(user => {
      const contacts = [];
      if (user) {
        const keys = Object.keys(user);

        keys.forEach(key => {
          if (key.startsWith('COMMERCIALNOM')) {
            const index = parseInt(key.replace('COMMERCIALNOM', ''), 10);
            const commercialNom = user[key];
            const commercialTel = user[`COMMERCIALTEL1`];
            const commercialMail = user[`COMMERCIALMAIL1`];

            if (commercialNom.length > 0) {
              contacts.push({
                nom: commercialNom,
                tel: commercialTel,
                mail: commercialMail,
                telLink: '+33' + commercialTel.replace(' ', '')
              });
            }
          }
        });

        if (contacts.length === 0) {
          contacts.push(this._defaultContact);
        }
        this.contactGroupName = user['COMMERCIALNOM'];
      } else {
        contacts.push(this._defaultContact);
      }
      this._contacts$.next(contacts);
    });
  }


  /** Liste des adresses, observable, résultat de la requete ListeAdresses.php */
  getAdresses(): Observable<Adresse[]> {
    return this.http.get<Adresse[]>(`${environment.apiUrl}/ListeAdresses.php`,
      { withCredentials: true }
    );
  }

  /** Récupère les informations profil en une Observable depuis une requète LogLecture.php */
  getProfil(): Observable<any> {
    return (
      this.http.get(`${environment.apiUrl}/LogLecture.php`, { withCredentials: true, responseType: 'json' })
    );
  }

  /** Liste des utilisateurs, observable, résultat de la requete ListeUtilisateurs.php */
  getClients(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/ListeUtilisateurs.php`,
      { withCredentials: true }
    );
  }

  getContact(numClient: number, isProspect?: boolean): Observable<clientContact[]> {
    return this.http.get<clientContact[]>(`${environment.apiUrl}/${isProspect ? 'ListeProspectontacts.php' : 'ListeclientsContacts.php'}`, {
      params: {
        numclient: numClient
      }
    });
  }


  /**
   * Mise à jour d'un utilisateur
   * @param form FormGroup regroupant toutes les infos mises à jour de l'utilisateur
   * @param formWeb
   * @param numInd Numéro d'indentification de l'utilisateur
   * @param numclient
   * @param prospect
   */
  updtClients(form: FormGroup, formWeb: FormGroup, numInd: number, numclient: number, isProspect?: boolean): Observable<any> {

    return this.http
      .get<any>(`${environment.apiUrl}/${isProspect ? 'prospectcontactmaj.php' : 'IDutilisateur.php'}`,
        {
          withCredentials: true,
          params: {
            action: 'UPD',
            service: form.value.service,
            mail: form.value.mail,
            nom: this.rmaService.removeAccents(form.value.nom),
            tel: form.value.gsm,
            fixe: form.value.fixe,
            droit: form.value.commande,
            mailling: form.value.mailing ? 'O' : 'N',
            pass: formWeb.value.mdp,
            id: formWeb.value.id,
            numindividu: numInd,
            role: form.value.role ? "A" : '',
            numclient: numclient,
            fonction: form.value.fonctioncode
          }
        });
  }

  /**
   * Créé et rajoute un Utilisateur à un compte client
   * @param form FormGroup regroupant toutes les infos du nouvel l'utilisateur
   * @param webForm Form pour créer un web user
   * @param numclient
   * @param prospect
   */
  addClients(form: FormGroup, webForm: FormGroup, numclient: number, isProspect: boolean, idCampagne?: number): Observable<any> {

    return this.http
      .get<any>(`${environment.apiUrl}/${isProspect ? 'prospectcontactmaj.php' : 'IDutilisateur.php'}`,
        {
          withCredentials: true,
          params: {
            action: 'ADD',
            service: form.value.service,
            mail: form.value.mail,
            nom: this.rmaService.removeAccents(form.value.nom),
            tel: form.value.gsm,
            fixe: form.value.fixe,
            droit: form.value.commande,
            mailling: form.value.mailing ? 'O' : 'N',
            pass: webForm.value.mdp,
            id: webForm.value.id,
            numindividu: '',
            role: form.value.role ? "A" : '',
            numclient: numclient,
            fonction: form.value.fonctioncode,
            campagne: idCampagne ? idCampagne.toString() : ''
          }
        });
  }

  /**
   * Supression d'un utilisateur depuis son ID
   * @param numInd ID de l'utilisateur à supprimer
   * @param numclient num du client lié à l'utilisateur
   */
  supprClients(numInd: number, numclient?: number): Observable<any> {
    return this.http
      .get<any>(`${environment.apiUrl}/IDutilisateur.php`,
        {
          withCredentials: true,
          params: {
            action: 'DEL',
            numindividu: numInd,
            numclient: numclient
          }
        });
  }

  /**
   * Supression d'un utilisateur depuis son ID
   * @param mail mail de l'utilisateur à supprimer
   * @param numclient num du client lié à l'utilisateur
   */
  supprProspect(mail: string, numclient: number): Observable<any> {
    return this.http
      .get<any>(`${environment.apiUrl}/prospectcontactmaj.php`,
        {
          withCredentials: true,
          params: {
            action: 'DEL',
            mail: mail,
            numclient: numclient
          }
        });
  }

  /** Récupère la grille de transport en une Observable depuis une requète LogLecture.php */
  chargerGrille(client: number): Observable<any> {
    return (
      this.http.get(`${environment.apiUrl}/ListePort.php`, { withCredentials: true, responseType: 'json', params: { client: client } })
    );
  }

  /** Retourne les fonctions à affecter sur un User */
  get functionUser() {
    return this.http.get<FonctionUser[]>(`${environment.apiUrl}/fonctionuser.php`);
  }

  get services() {
    return this.http.get<any[]>(`${environment.apiUrl}/services.php`);
  }

  changePass(mail: string) {
    return this.http.get(`${environment.apiUrl}/MDPOublie.php`, {
      params: {
        mail: mail
      },
      withCredentials: true
    });
  }
}
