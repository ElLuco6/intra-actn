import { Injectable } from '@angular/core';
import { CookieService } from "./cookie.service";

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService implements Storage {

  private _UXforbiddenItems = ['ActnCalogueFormat', 'searchHistory']

  constructor(
    protected cookieService: CookieService
  ) {
    this.clearForbiddenItems();
  }

  [name: string]: any;
  length: number;

  clear(): void {
    localStorage.clear();
  }

  clearForbiddenItems(): void {
    if (this.cookieService.get('cookie_consent_ux') !== 'ACCEPT') {
      for (const key of this._UXforbiddenItems) {
        localStorage.removeItem(key);
      }
    }
  }

  getItem(key: string): string {
    if (this._UXforbiddenItems.includes(key)) {
      return this.cookieService.get('cookie_consent_ux') === 'ACCEPT' ? localStorage.getItem(key) : '';
    } else {
      return localStorage.getItem(key);
    }
  }

  key(index: number): string {
    return localStorage.key(index);
  }

  removeItem(key: string): void {
    return localStorage.removeItem(key);
  }

  setItem(key: string, value: string): void {
    if (this._UXforbiddenItems.includes(key)) {
      if (this.cookieService.get('cookie_consent_ux') === 'ACCEPT') {
        localStorage.setItem(key, value);
      }
    } else {
      localStorage.setItem(key, value);
    }
  }

}
