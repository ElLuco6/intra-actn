import { Injectable } from '@angular/core';
import {Filtre} from "@/models";
import {HttpClient} from "@angular/common/http";
import {LocalStorageService} from "@services/local-storage.service";
import {Router} from "@angular/router";
import {SnackbarService} from "@services/snackbar.service";
import {AuthenticationService} from "@services/authentication.service";
import {Observable} from "rxjs";
import {StorageService} from "@services/storage.service";
import {LicenceService} from "@services/licence.service";
import {LogClientService} from "@services/log-client.service";

@Injectable({
  providedIn: 'root'
})
export class LicenceCommandesService extends LicenceService {
  constructor(
    protected override httpClient: HttpClient,
    protected override storageService: StorageService,
    protected override router: Router,
    protected override authService: LogClientService,
    protected override snackbarService: SnackbarService,
    protected override localStorage: LocalStorageService
  ) {
    super(httpClient, storageService, router, authService, snackbarService, localStorage);
  }

  /**
   * Retourne les filtres associés aux licences d'un revendeur.
   */
  public override getFiltres(): Observable<Array<Filtre>> {
    this._filtres = [];
    return new Observable(obs => {
      this._filtres.push({ target: 'commande.referencecommande', label: 'Votre référence de commande', type: 'string', method: 'includes', forme: 'input', options: [] });
      this._filtres.push({ target: 'commande.numcommande', label: 'N° de commande ACTN', type: 'string', method: 'includes', forme: 'input', options: [] });
      this._filtres.push({ target: 'commande.numfacture', label: 'N° de facture', type: 'string', method: 'includes', forme: 'input', options: [] });
      this._filtres.push({ target: 'produit.marque', label: 'Marque', type: 'array', method: 'includes', forme: 'select', options: [] });
      this._filtres.push({ target: 'produit.reference', label: 'Référence produit', type: 'string', method: 'includes', forme: 'input', options: [] });
      this._filtres.push({ target: 'statut', label: 'Statut', type: 'array', method: 'includes', forme: 'select', options: ['En attente', 'Active', 'Expirée'] });
      obs.next(this._filtres);
      obs.complete();
    });
  }
}
