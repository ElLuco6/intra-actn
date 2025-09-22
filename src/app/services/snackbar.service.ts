import { Injectable } from '@angular/core';
import { WindowService } from "./window.service";

@Injectable({
  providedIn: 'root'
})
export class SnackbarService {

  public get show(): boolean {
    return this._show;
  }

  public get message(): string {
    return this._message;
  }

  public get actionMessage(): string {
    return this._actionMessage;
  }

  public get action(): () => void {
    return () => {
      this._action();
      this.hideSnackbar();
    };
  }

  public get hasAction(): boolean {
    return this._hasAction;
  }

  public get isLarge(): boolean {
    return this._large;
  }
  public get isWarning(): boolean {
    return this._warning;
  }

  private _message = '';
  private _hasAction = false;
  private _actionMessage = '';
  private _action: () => void;
  private _timeout = 5000;
  private _show = false;
  private _timer = -1;

  private _large = false;
  private _warning = false;

  private _alerte: boolean = false;

  constructor(
    private window: WindowService
  ) { }

  /**
   * Affiche une snackbar avec un message et, en option, un bouton d'action.
   * @param message Le message à afficher
   * @param actionMessage Le message du bouton
   * @param action L'action à effectuer
   * @param timeout Le temps d'affichage de la snackbar
   * @param params Une liste de paramètres optionnels :
   * - **noTimer** : Permet de désactiver la désactivation automatique de la snackbar
   * - **warning** : Affiche la snackbar en rouge et en haut
   * - **large** : Élargit la marge à gauche et à droite
   */
  public showSnackbar(
    message: string,
    actionMessage: string = '',
    action?: () => void,
    timeout: number = 5000,
    params?: { [param: string]: boolean; }
  ): void {
    clearTimeout(this._timer);
    this._hasAction = actionMessage.length > 0;
    this._actionMessage = actionMessage;
    this._action = action;
    this._timeout = timeout;
    this._message = message;
    this._warning = !!params?.['warning'];
    this._large = !!params?.['large'];
    this._show = true;
    if (!params?.['noTimer']) {
      this._timer = this.window.setTimeout(() => this._show = false, this._timeout);
    }
  }

  /**
   * Cache la snackbar.
   */
  public hideSnackbar(): void {
    this.window.clearTimeout(this._timer);
    this._show = false;
  }
}
