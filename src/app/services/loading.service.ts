import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {

  private _isLoading$ = new BehaviorSubject<boolean>(false);
  loading$ = this._isLoading$.asObservable();


  get isLoading$(): Subject<boolean> {
    return this._isLoading$;
  }

  /**
   * Démarre le chargement.
   */
  public startLoading(): void {
    setTimeout(() => this._isLoading$.next(true));
  }

  /**
   * Arrête le chargement.
   */
  public stopLoading(): void {
    setTimeout(() => this._isLoading$.next(false));
  }

  constructor() { }
}
