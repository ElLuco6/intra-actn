import { environment } from "../../environments/environment";
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';

import { RawLicence } from "../models/licence";
import { Licence } from "../models/licence";
import { User } from "../models/user";
import { Filtre } from "../models/catalogue";
import { Client } from "../models/licence";
import { HttpClient } from '@angular/common/http';
import { StorageService } from './storage.service';
import { Router } from '@angular/router';
import { AuthenticationService } from './authentication.service';
import { SnackbarService } from "./snackbar.service";
import { LocalStorageService } from "./local-storage.service";
import {LogClientService} from "@services/log-client.service";

export interface FiltreDate{
  label: string;
  options: Array<string>;
}

@Injectable({
  providedIn: 'root'
})
export class LicenceService {

  public details = new Array<boolean>();
  public user = new User();
  public scroll = 0;
  public paginator = {
    pageIndex: 0,
    pageSize: 10,
    pageSizeOptions: [5, 10, 25, 50, 100],
    previousPageIndex: -1,
    low: 0,
    high: 10
  };

  filtreTout = 'voir toutes les licences';
  filtresExpirant = [
    'expirant dans moins de 7 jours',
    'expirant dans moins de 15 jours',
    'expirant dans moins de de 30 jours',
  ];
  filtresExpire = [
    'expirée dans les 15 derniers jours',
    'expirée dans les 30 derniers jours',
    'expirée dans les 3 derniers mois',
  ];
  filtresDate: Array<FiltreDate> = [
    { label: 'Arrive à expiration', options: this.filtresExpirant },
    { label: 'Récemment expirée', options: this.filtresExpire }
  ];
  selectedFiltreDate = this.filtreTout;
  filtreValues: Array<unknown> = [];
  selectedTri: [string, string] = ['Date d\'expiration', 'desc'];

  public marques = new Set<string>();

  public get prioritaire(): number {
    return this._prioritaire;
  }

  protected _filtres: Array<Filtre> = [];
  protected _oldest: Date;
  protected _newest: Date;
  protected _now: Date;
  protected _prioritaire = 0;
  protected _renouvelable = 0;
  protected _nbLicences = 0;

  constructor(
    protected httpClient: HttpClient,
    protected storageService: StorageService,
    protected router: Router,
    protected authService: LogClientService,
    protected snackbarService: SnackbarService,
    protected localStorage: LocalStorageService
  ) {
    this._oldest = new Date();
    this._newest = new Date();
    this._now = new Date();
    this._oldest.setMonth(this._now.getMonth() - 3);
    this._newest.setDate(this._now.getDate() + 30);

    this.authService._currentCient$.subscribe((user: User) => {
      this._prioritaire = 0;
      this._renouvelable = 0;
      setTimeout(() => {
        this._resetAttributs();
        //this.checkLicences();
      }, 0);
    });

    /*this.getEnduserFormulaire().pipe(take(1)).subscribe(forms => {
      for (const marque of forms.keys()) {
        this.marques.add(marque);
      }
    });*/
  }

  /**
   * Retourne les licences d'un client.
   */
  public getLicences(): Observable<Array<Licence>> {
    return this.storageService.getStoredDataClient('licences', '', () => {
      return this.httpClient.get<Array<RawLicence>>(`${environment.apiUrl}/ListeLicences.php`,
        { withCredentials: true }
      ).pipe(map(rLicences => {
        let licences = new Array<Licence>();
        rLicences.forEach(rLicence => {
          if (rLicence.produit.length > 0) {
            licences.push(new Licence(rLicence));
          }
        });
        licences = licences.sort((l1, l2) => l2.commande.datecommande.getTime() - l1.commande.datecommande.getTime()); //l2 puis l1 Pour les avoir dans l'ordre decroissant
        const licencesMap = new Map<string, Licence>();
        const licenceSansSerie = new Array<Licence>();
        for (const licence of licences) {
          if (licence.serie == '' || licence.serie == 'n.c.') {
            licenceSansSerie.push(licence);
          } else {
            const licenceMap = licencesMap.get(licence.serie);
            if (licenceMap != null) {
              licenceMap.history.push(licence);
            } else {
              licencesMap.set(licence.serie, licence);
            }
          }
        }
        if (licencesMap.size !== this._nbLicences) {
          this._resetAttributs();
        }
        this._nbLicences = licencesMap.size;
        return Array.from(licencesMap.values()).concat(licenceSansSerie);
      }));
    });
  }

  /**
   * Retourne les filtres associés aux licences d'un revendeur.
   */
  public getFiltres(): Observable<Array<Filtre>> {
    this._filtres = [];
    return new Observable(obs => {
      this._filtres.push({ target: 'produit.marque', label: 'Marque', type: 'array', method: 'includes', forme: 'select', options: [] });
      this._filtres.push({ target: 'statut', label: 'Statut', type: 'array', method: 'includes', forme: 'select', options: ['En attente', 'Active', 'Expirée'] });
      this._filtres.push({ target: 'produit.reference', label: 'Ref. Produit', type: 'string', method: 'includes', forme: 'input', options: [] });
      this._filtres.push({ target: 'serie', label: 'SN / EAV', type: 'string', method: 'includes', forme: 'input', options: [] });
      this._filtres.push({ target: 'client.nom', label: 'Client final', type: 'string', method: 'includes', forme: 'input', options: [] });
      obs.next(this._filtres);
      obs.complete();
    });
  }

  /**
   * Vérifie si des licences nécessitent l'attention du user et affiche une snackbar.
   * La snackbar permet d'atteindre la page des licences et disparait au bout de 15 secondes
   * @param showSnackbar Indique si il faut afficher une snackbar après la vérification, true par défaut
   */
  public checkLicences(showSnackbar = true): void {
    this.getLicences().pipe(take(1)).subscribe((licences: Array<Licence>) => {
      this._prioritaire = 0;
      this._renouvelable = 0;
      licences.forEach((licence: Licence) => {
        this._prioritaire += !this.isIgnored(licence) && this.isPrioritaire(licence) ? 1 : 0;
        this._renouvelable += !this.isIgnored(licence) && this.isRenewable(licence) ? 1 : 0;
      });
      if (showSnackbar && this._prioritaire > 0) {
        let message = 'Une ou plusieurs de vos licences nécessitent votre attention :';
        message += this._prioritaire > 0 ? '\n- ' + this._prioritaire + ' licence' + (this._prioritaire > 1 ? 's arrivent ou sont arrivées à expiration' : ' arrive ou est arrivée à expiration') : '';
        message += this._renouvelable > 0 ? '\n- ' + this._renouvelable + ' licence' + (this._renouvelable > 1 ? 's sont renouvelables' : ' est renouvelable') : '';
        this.snackbarService.showSnackbar(
          message,
          'Voir les licences',
          () => this.router.navigateByUrl('/espace-client/contrats'),
          15000
        );
      }
    });
  }

  /**
   * Retourne les formulaires enduser de licence par marque.
   */
  public getEnduserFormulaire(): Observable<Map<string, Map<string, boolean>>> {
    return this.storageService.getStoredData('enduser-form', '0', () => {
      return this.httpClient.get<Map<string, Map<string, boolean>>>(`${environment.apiUrl}/EnduserFormulaire.php`, {
        withCredentials: true
      }).pipe(map(formulaire => {
        formulaire = new Map(Object.entries(formulaire));
        const ret = new Map<string, Map<string, boolean>>();
        for (const key of formulaire.keys()) {
          ret.set(key, new Map(Object.entries(formulaire.get(key))));
        }
        return ret;
      }));
    });
  }

  /**
   * Envoie un client à définir en variable de session.
   * @param client Le client à définir en variable de session
   * @param numCommande
   */
  public postEnduser(client: Client, numCommande?: string): Observable<any> {
    if (client != null) {
      return this.httpClient.post(
        `${environment.apiUrl}/EnduserSET.php`,
        {
          nom: client.nom,
          mail: client.mail,
          telephone: client.telephone,
          adresse1: client.adresse1,
          adresse2: client.adresse2,
          codepostal: client.codepostal,
          ville: client.ville,
          pays: client.pays,
          serie: client.serie,
          ncde: numCommande ?? '',
          ntva: client.numtva
        },
        { withCredentials: true }
      );
    } else {
      return null;
    }
  }

  /**
   * Met à jour une commande avec un enduser préalablement enregistré en variable de session PHP.
   */
  public majEnduser(): Observable<any> {
    return this.httpClient.get<any>(`${environment.apiUrl}/EnduserMAJ.php`, { withCredentials: true });
  }

  /**
   * Indique si une licence est prioritaire ou non.
   * @params licence Une licence
   * @returns true si la licence est prioritaire, false sinon
   */
  public isPrioritaire(licence: Licence): boolean {
    return licence.renouvellementdate > this._oldest && licence.renouvellementdate <= this._newest;
  }

  /**
   * Indique si une licence est renouvelable ou non.
   * @params licence Une licence
   * @returns true si la licence est renouvelable, false sinon
   */
  public isRenewable(licence: Licence): boolean {
    return this.isPrioritaire(licence) || licence.statut === 'Active';
  }

  /**
   * Récupère la liste des licences ignorées par l'utilisateur.
   */
  private getIgnoredLicences(): Set<string> {
    return new Set<string>(JSON.parse(this.localStorage.getItem('ignoredLicences')));
  }

  /**
   * Ignore une licence.
   * @param licence La licence à ignorer
   */
  public ignore(licence: Licence): void {
    let item = this.getIgnoredLicences();
    if (item == null) {
      item = new Set<string>();
    }
    item.add(licence.commande + licence.serie);
    this.localStorage.setItem('ignoredLicences', JSON.stringify([...item]));
    this.checkLicences(false);
  }

  /**
   * Ne plus ignorer une licence.
   * @param licence La licence à ne plus ignorer
   */
  public follow(licence: Licence): void {
    let item = this.getIgnoredLicences();
    if (item == null) {
      item = new Set<string>();
    }
    item.delete(licence.commande + licence.serie);
    this.localStorage.setItem('ignoredLicences', JSON.stringify([...item]));
    this.checkLicences(false);
  }

  /**
   * Indique si une licence est ignorée par l'utilisateur.
   * @param licence Une licence
   */
  public isIgnored(licence: Licence): boolean {
    const item = new Set<string>(JSON.parse(this.localStorage.getItem('ignoredLicences')));
    return item?.has(licence.commande + licence.serie);
  }

  /**
   * Envoi une demande de devis à un commercial ACTN.
   * @param licence La licence à renouveler
   * @param nbPostes Le nombre de postes à ajouter
   * @param duree La durée du renouvellement souhaitée
   */
  public demandeDevis(licence: Licence, nbPostes: number, duree: string): Observable<any> {
    return this.httpClient.post(
      `${environment.apiUrl}/LicenceAjoutPostes.php`,
      {
        numcommande: licence.commande,
        refproduit: licence.produit,
        noserie: licence.serie,
        nbpostes: nbPostes,
        duree
      },
      { withCredentials: true }
    );
  }

  /**
   * Envoi une demande d'aide à un commercial ACTN.
   * @param licence Une licence
   * @param commentaire Le commentaire transmis par le client
   */
  public demandeAide(licence: Licence, commentaire: string): Observable<any> {
    return this.httpClient.post(
      `${environment.apiUrl}/LicenceAide.php`,
      {
        numcommande: licence.commande,
        refproduit: licence.produit,
        noserie: licence.serie,
        commentaire
      },
      { withCredentials: true }
    );
  }

  /**
   * Reset les attributs de sauvegarde du composant de la liste des devis.
   */
  private _resetAttributs(): void {
    this.user = this.authService.currentClient;
    this.details = new Array<boolean>();
    this.scroll = 0;
    this.paginator = {
      pageIndex: 0,
      pageSize: 10,
      pageSizeOptions: [5, 10, 25, 50, 100],
      previousPageIndex: -1,
      low: 0,
      high: 10
    };
    this.selectedFiltreDate = this.filtreTout;
    this.selectedTri = ['Date d\'expiration', 'desc'];
  }
}
