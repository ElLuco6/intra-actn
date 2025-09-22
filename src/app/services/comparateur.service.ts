import {Inject, Injectable, PLATFORM_ID} from '@angular/core';
import {fromEvent, Observable, Subject, Subscription} from "rxjs";
import {LocalStorageService} from "./local-storage.service";
import {WindowService} from "./window.service";
import {isPlatformBrowser} from "@angular/common";
import {tap} from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})
export class ComparateurService {

  // Attributs
  /////////////////////////////////////////////////////////////////////////////////
  /** Subject observable of the service */
  private actnReferencesOfProducts: Subject<string[]> = new Subject<string[]>();
  /** Observable that fire when other tabs update their localStorage */
  private tabUpdate: Observable<StorageEvent>;
  /** Subscription that fire when other tabs update their localStorage
   * Update the compare list when fired */
  private tabUpdateSubscription: Subscription;
  /** Clef de la valeur du local storage*/
  private localStorageAddress = 'actnCompare';
  /////////////////////////////////////////////////////////////////////////////////

  constructor(
    private localStorage: LocalStorageService,
    private window: WindowService,
    @Inject(PLATFORM_ID) private platformId: any
  ) {
    // get localStorage if there is already one
    this.updateCompare();

    if (isPlatformBrowser(this.platformId)) {
      // listen to other tabs' updating the localStorage
      this.tabUpdate = fromEvent<StorageEvent>(this.window.window, 'storage')
        .pipe(
          tap(() => {
            this.updateCompare();
          })
        );
      this.tabUpdateSubscription = this.tabUpdate.subscribe();
    }
  }

  /** Renvoie comme Observable la liste des références produits à Comparer */
  compare(): Observable<string[]> {
    return this.actnReferencesOfProducts.asObservable();
  }

  /**
   * Renvoie la liste :string[] des références des produits comparés directement depuis le service
   * @returns la liste :string[] des références des produits comparés directement depuis le service
   */
  setUp(): string[] {
    const storedActnCompare = this.localStorage.getItem(this.localStorageAddress);
    if (storedActnCompare) {
      return (this.localStorage.getItem(this.localStorageAddress).split(','));
    }
    return (['']);
  }

  // CRUD
  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  /**
   * Ajoute une référence de produit à la liste d'objets comparés
   *  Ecrit la nouvelle liste dans le localstorage
   *  Envoie la liste par l'observable
   */
  addToCompare(produitReference: string): void {
    // old compare
    const compareArray: string[] = this.localStorage.getItem(this.localStorageAddress).split(',');
    // add new compare
    compareArray.push(produitReference);
    // build a string from the array
    const compareString: string = this.convertArrayToStringWithComma(compareArray);
    // add it to the localStorage
    this.localStorage.setItem(this.localStorageAddress, compareString);
    // update Observable
    this.actnReferencesOfProducts.next(compareArray);
  }
  /**
   * Retire une référence de produit à la liste d'objets comparés
   *  Ecrit la nouvelle liste dans le localstorage
   *  Envoie la liste par l'observable
   */
  removeFromCompare(produitReference: string): void {
    const storedActnCompare: string = this.localStorage.getItem(this.localStorageAddress);
    // SI il existe une valeur stockée localement de actnCompare
    if (storedActnCompare) {
      // build an array from the string
      const compareArray: string[] = storedActnCompare.split(',');
      const i: number = compareArray.indexOf(produitReference);
      // SI une case du tableau correspond à 'produitReference'
      if (i >= 0) {
        // remove 'produitReference' from the array
        compareArray.splice(i, 1);
        // build a string from the array AND update Observable
        this.actnReferencesOfProducts.next(compareArray);
        this.localStorage.setItem('actnCompare', this.convertArrayToStringWithComma(compareArray));
      }
    }
  }
  /**
   * Ajoute ou Retire une référence de produit à la liste d'objets comparés celon si elle y existe déjà ou non.
   *  Ecrit la nouvelle liste dans le localstorage
   *  Envoie la liste par l'observable
   */
  toggleCompare(produitReference: string): void {
    const storedActnCompare: string = this.localStorage.getItem(this.localStorageAddress);
    // SI il existe une valeur stockée localement de compare actn
    // SINON ajoute 'produitReference' au localStorage 'actnCompare'
    if (storedActnCompare) {
      if (storedActnCompare.split(',').includes(produitReference)) {
        this.removeFromCompare(produitReference);
      }
      else {
        this.addToCompare(produitReference);
      }
    }
    else {
      this.localStorage.setItem(this.localStorageAddress, produitReference);
      this.actnReferencesOfProducts.next([produitReference]);
    }
  }
  /**
   * Envois l'état actuel du Localstorage par l'observable
   */
  updateCompare(): void {
    const storedActnCompare: string = this.localStorage.getItem(this.localStorageAddress);
    // SI il existe une valeur stockée localement de compare actn
    if (storedActnCompare) {
      this.actnReferencesOfProducts.next(
        this.localStorage.getItem(this.localStorageAddress).split(',')
      );
    }
    else {
      this.clearCompare();
    }
  }
  /**
   * Remplis le localStorage avec une string vide
   * et envois cet état par l'observable
   */
  clearCompare(): void {
    this.localStorage.setItem(this.localStorageAddress, '');
    this.actnReferencesOfProducts.next([]);
  }

  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  /**
   * Convert given string array 'arr' to a single string of all the 'arr' elements separated by a comma ','
   * @return converted string
   */
  convertArrayToStringWithComma(arr: string[]): string {
    let ret = '';
    // remove first element if empty
    if (arr[0] === '') {
      arr.shift();
    }
    // build the string
    for (let i = 0; i <= arr.length - 1; i++) {
      if (i !== 0) {
        ret += ',';
      }
      ret += arr[i];
    }
    return (ret);
  }

}
