import { Injectable } from '@angular/core';
import {CartService} from "@services/cart.service";
import {HttpClient} from "@angular/common/http";
import {AuthenticationService} from "@services/authentication.service";
import {LicenceService} from "@services/licence.service";
import {ServerLocalStorageService} from "@services/server-local-storage.service";

@Injectable({
  providedIn: 'root'
})
export class TempCartService extends CartService {
  override type: string = "temp"; // variable de vérification du cart / utile seulement au debug

  constructor(
    protected  override httpClient: HttpClient,
    protected  override licenceService: LicenceService,
    protected  override localStorage: ServerLocalStorageService,
    protected  override authService: AuthenticationService,
    // protected clipboard: Clipboard
  ) {
    super(httpClient, licenceService, localStorage, authService);
  }
}
