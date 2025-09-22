import { Injectable } from '@angular/core';
import { CookieService as cs } from 'ngx-cookie-service';

export enum CookieState {
  HIDDEN,
  ACTIVE,
  COOKIE
}

@Injectable({
  providedIn: 'root'
})
export class CookieService {

  previousState = CookieState.ACTIVE;
  state: CookieState = CookieState.HIDDEN;
  userExperience = false;
  youtube = false;
  gotowebinar = false;

  constructor(
    private cookieService: cs
  ) {
    this.init();
  }

  init(): void {
    this.userExperience = this.cookieService.get('cookie_consent_ux') === 'ACCEPT';
    this.youtube = this.cookieService.get('cookie_consent_youtube') === 'ACCEPT';
    this.gotowebinar = this.cookieService.get('cookie_consent_gotowebinar') === 'ACCEPT';
  }

  showParams(): void {
    this.previousState = this.state;
    this.state = CookieState.COOKIE;
  }

  /**
   * @param name Cookie name
   * @returns boolean - whether cookie with specified name exists
   */
  check(name: string): boolean {
    return this.cookieService.check(name);
  }

  /**
   * @param name Cookie name
   * @returns property value
   */
  get(name: string): string {
    return this.cookieService.get(name);
  }
  /**
   * @returns all the cookies in json
   */
  getAll(): { [key: string]: string; } {
    return this.cookieService.getAll();
  }

  /**
   * @param name     Cookie name
   * @param value    Cookie value
   * @param expires  Number of days until the cookies expires or an actual `Date`
   * @param path     Cookie path
   * @param domain   Cookie domain
   * @param secure   Secure flag
   * @param sameSite OWASP samesite token `Lax`, `None`, or `Strict`. Defaults to `Lax`
   */
  set(name: string, value: string, expires?: number | Date, path?: string, domain?: string, secure?: boolean, sameSite?: 'Lax' | 'None' | 'Strict'): void {
    return this.cookieService.set(name, value, expires, path, domain, secure, sameSite);
  }

  /**
   * @param name   Cookie name
   * @param path   Cookie path
   * @param domain Cookie domain
   * @param secure
   * @param sameSite
   */
  delete(name: string, path?: string, domain?: string, secure?: boolean, sameSite?: 'Lax' | 'None' | 'Strict'): void {
    return this.cookieService.delete(name, path, domain, secure, sameSite);
  }

  /**
   * @param path   Cookie path
   * @param domain Cookie domain
   * @param secure
   * @param sameSite
   */
  deleteAll(path?: string, domain?: string, secure?: boolean, sameSite?: 'Lax' | 'None' | 'Strict'): void {
    return this.cookieService.deleteAll(path, domain, secure, sameSite);
  }
}
