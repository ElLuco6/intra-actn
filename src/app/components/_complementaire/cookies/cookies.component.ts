import { Component, OnInit } from '@angular/core';
import { LocalStorageService } from "@services/local-storage.service";
import { CookieService, CookieState as State } from '@services/cookie.service';

@Component({
  selector: 'app-cookies',
  templateUrl: './cookies.component.html',
  styleUrls: ['./cookies.component.scss']
})
export class CookiesComponent implements OnInit {

  State = State;

  get state(): State {
    return this.cookieService.state;
  }
  set state(value: State) {
    this.cookieService.state = value;
  }
  get previousState(): State {
    return this.cookieService.previousState;
  }
  set previousState(value: State) {
    this.cookieService.previousState = value;
  }
  get userExperience(): boolean {
    return this.cookieService.userExperience;
  }
  set userExperience(value: boolean) {
    this.cookieService.userExperience = value;
  }
  get youtube(): boolean {
    return this.cookieService.youtube;
  }
  set youtube(value: boolean) {
    this.cookieService.youtube = value;
  }
  get gotowebinar(): boolean {
    return this.cookieService.gotowebinar;
  }
  set gotowebinar(value: boolean) {
    this.cookieService.gotowebinar = value;
  }

  constructor(
    private cookieService: CookieService,
    private localStorage: LocalStorageService
  ) { }

  saveCookieParams(): void {
    this.cookieService.set('cookie_consent_asked', 'YES', 30);
    this.cookieService.set('cookie_consent_ux', this.userExperience ? 'ACCEPT' : 'REJECT', 30);
    this.cookieService.set('cookie_consent_youtube', this.youtube ? 'ACCEPT' : 'REJECT', 30);
    this.cookieService.set('cookie_consent_gotowebinar', this.gotowebinar ? 'ACCEPT' : 'REJECT', 30);
    this.localStorage.clearForbiddenItems();
  }

  ngOnInit(): void {
    if (this.cookieService.check('consent-actn')) {
      this.cookieService.deleteAll();
    }
    if (this.cookieService.get('cookie_consent_asked') !== 'YES') {
      this.state = State.ACTIVE;
      this.cookieService.set('cookie_consent_asked', 'NO_ANSWER', 30);
      this.cookieService.set('cookie_consent_ux', 'REJECT', 30);
      this.cookieService.set('cookie_consent_youtube', 'REJECT', 30);
      this.cookieService.set('cookie_consent_gotowebinar', 'REJECT', 30);
    }
  }

  turnAllOn(): void {
    this.userExperience = true;
    this.youtube = true;
    this.gotowebinar = true;
  }

  turnAllOff(): void {
    this.userExperience = false;
    this.youtube = false;
    this.gotowebinar = false;
  }

  /**
   * L'utilisateur accepte l'utilisation des cookies.
   */
  onAccept(): void {
    switch (this.state) {
      case State.HIDDEN:
        // Impossible
        break;
      case State.ACTIVE:
        this.turnAllOn();
        this.saveCookieParams();
        this.previousState = this.state;
        this.state = State.HIDDEN;
        break;
      case State.COOKIE:
        // Impossible ou rien
        break;
    }
  }

  /**
   * L'utilisateur refuse l'utilisation des cookies.
   */
  onRefuse(): void {
    switch (this.state) {
      case State.HIDDEN:
        // Impossible
        break;
      case State.ACTIVE:
        this.turnAllOff();
        this.saveCookieParams();
        this.previousState = this.state;
        this.state = State.HIDDEN;
        break;
      case State.COOKIE:
        this.turnAllOff();
        this.saveCookieParams();
        this.previousState = this.state;
        this.state = State.HIDDEN;
        break;
    }
  }

  /**
   * L'utilisateur veut voir les paramètres des cookies.
   */
  onShowCookieParams(): void {
    switch (this.state) {
      case State.HIDDEN:
        // Impossible
        break;
      case State.ACTIVE:
        this.previousState = this.state;
        this.state = State.COOKIE;
        break;
      case State.COOKIE:
        // Impossible ou rien
        break;
    }
  }

  /**
   * Cache les paramètres de cookies.
   */
  onHideCookieParams(): void {
    switch (this.state) {
      case State.HIDDEN:
        // Impossible
        break;
      case State.ACTIVE:
        // Impossible
        break;
      case State.COOKIE:
        this.cookieService.init();
        this.state = this.previousState;
        this.previousState = State.COOKIE;
        break;
    }
  }

  /**
   * Sauvegarde les préférences de l'utilisateur.
   */
  onSaveCookieParams(): void {
    switch (this.state) {
      case State.HIDDEN:
        // Impossible
        break;
      case State.ACTIVE:
        // Impossible
        break;
      case State.COOKIE:
        this.saveCookieParams();
        this.state = State.HIDDEN;
        this.previousState = State.COOKIE;
        break;
    }
  }

  onAcceptAll(): void {
    switch (this.state) {
      case State.HIDDEN:
        // Impossible
        break;
      case State.ACTIVE:
        // Impossible
        break;
      case State.COOKIE:
        this.turnAllOn();
        this.state = State.COOKIE;
        break;
    }
  }

  onRefuseAll(): void {
    switch (this.state) {
      case State.HIDDEN:
        // Impossible
        break;
      case State.ACTIVE:
        // Impossible
        break;
      case State.COOKIE:
        this.turnAllOff();
        this.state = State.COOKIE;
        break;
    }
  }

}
