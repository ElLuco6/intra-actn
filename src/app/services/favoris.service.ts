import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { Subject, Observable, Subscription, fromEvent } from 'rxjs';
import { tap } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';
import {LocalStorageService} from "./local-storage.service";
import {WindowService} from "./window.service";

/** Service qui enregistre, maintient et met à jours la liste de références produits à afficher dans le FavorisComponent */
@Injectable({
  providedIn: 'root'
})
export class FavorisService {

  /** Subject observable of the service */
  private actnReferencesOfFavoris: Subject<string[]> = new Subject<string[]>();
  /** Observable that fire when other tabs update their localStorage */
  private tabUpdate: Observable<StorageEvent>;
  /** Subscription that fire when other tabs update their localStorage
   * Update the favoris list when fired */
  private tabUpdateSubscription: Subscription;

  constructor(
    private localStorage: LocalStorageService,
    private window: WindowService,
    @Inject(PLATFORM_ID) private platformId: any
  ) {
    // get localStorage if there is already one
    this.updateFavoris();

    if (isPlatformBrowser(this.platformId)) {
      // listen to other tabs' updating the localStorage
      this.tabUpdate = fromEvent<StorageEvent>(this.window.window, 'storage')
        .pipe(
          tap(() => {
            this.updateFavoris();
          })
        );
      this.tabUpdateSubscription = this.tabUpdate.subscribe();
    }
  }

  /** Renvoie comme Observable la liste des références produits Favoris */
  favoris(): Observable<string[]> {
    return this.actnReferencesOfFavoris.asObservable();
  }

  /**
   * Renvoie la liste :string[] des produits favoris directement depuis le service
   * @returns la liste :string[] des produits favoris directement depuis le service
   */
  setUp(): string[] {
    const storedActnFavoris = this.localStorage.getItem('actnFavoris');
    if (storedActnFavoris) {
      return (this.localStorage.getItem('actnFavoris').split(','));
    }
    return (['']);
  }

  // CRUD
  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  /**
   * Ajoute une référence de produit à la liste d'objets favoris
   *  Ecrit la nouvelle liste dans le localstorage
   *  Envoie la liste par l'observable
   */
  addFavoris(favorisReference: string): void {
    // old favoris
    const favorisArray: string[] = this.localStorage.getItem('actnFavoris').split(',');
    // add new favoris
    favorisArray.push(favorisReference);
    // build a string from the array
    const favorisString: string = this.convertArrayToStringWithComma(favorisArray);
    // add it to the localStorage
    this.localStorage.setItem('actnFavoris', favorisString);
    // update Observable
    this.actnReferencesOfFavoris.next(favorisArray);
  }
  /**
   * Envois l'état actuel du Localstorage par l'observable
   */
  updateFavoris(): void {
    const storedActnFavoris: string = this.localStorage.getItem('actnFavoris');
    // SI il existe une valeur stockée localement de favoris actn
    if (storedActnFavoris) {
      this.actnReferencesOfFavoris.next(
        this.localStorage.getItem('actnFavoris').split(',')
      );
    }
    else {
      this.clearFavoris();
    }
  }
  /**
   * Remplis le localStorage avec une string vide
   * et envois cet état par l'observable
   */
  clearFavoris(): void {
    this.localStorage.setItem('actnFavoris', '');
    this.actnReferencesOfFavoris.next([]);
  }
  /**
   * Retire une référence de produit à la liste d'objets favoris
   *  Ecrit la nouvelle liste dans le localstorage
   *  Envoie la liste par l'observable
   */
  removeFavoris(favorisReference: string): void {
    const storedActnFavoris: string = this.localStorage.getItem('actnFavoris');
    // SI il existe une valeur stockée localement de favoris actn
    if (storedActnFavoris) {
      // build an array from the string
      const favorisArray: string[] = storedActnFavoris.split(',');
      const i: number = favorisArray.indexOf(favorisReference);
      // SI une case du tableau correspond à 'favorisReference'
      if (i >= 0) {
        // remove 'favorisReference' from the array
        favorisArray.splice(i, 1);
        // build a string from the array AND update Observable
        this.actnReferencesOfFavoris.next(favorisArray);
        this.localStorage.setItem('actnFavoris', this.convertArrayToStringWithComma(favorisArray));
      }

    }
  }
  /**
   * Ajoute ou Retire une référence de produit à la liste d'objets favoris celon si elle y existe déjà ou non.
   *  Ecrit la nouvelle liste dans le localstorage
   *  Envoie la liste par l'observable
   */
  toggleFavoris(favorisReference: string): void {
    const storedActnFavoris: string = this.localStorage.getItem('actnFavoris');
    // SI il existe une valeur stockée localement de favoris actn
    // SINON ajoute 'favorisReference' au localStorage 'actnFavoris'
    if (storedActnFavoris) {
      if (storedActnFavoris.split(',').includes(favorisReference)) {
        this.removeFavoris(favorisReference);
      }
      else {
        this.addFavoris(favorisReference);
      }
    }
    else {
      this.localStorage.setItem('actnFavoris', favorisReference);
      this.actnReferencesOfFavoris.next([favorisReference]);
    }
  }

  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  /**
   * Convert given string array 'arr' to a single string of all the 'arr' elements separated by a comma ','
   * @return converted string
   */
  convertArrayToStringWithComma(arr: string[]): string {
    let ret = '';
    // remove first element if empty
    if (arr[0] == '') {
      arr.shift();
    }
    // build the string
    for (let i = 0; i <= arr.length - 1; i++) {
      if (i != 0) {
        ret += ',';
      }
      ret += arr[i];
    }
    return (ret);
  }

}
