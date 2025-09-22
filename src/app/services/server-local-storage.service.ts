import { Injectable } from '@angular/core';
import {LocalStorageService} from "@services/local-storage.service";
import {CookieService} from "@services/cookie.service";

@Injectable({
  providedIn: 'root'
})
export class ServerLocalStorageService extends LocalStorageService {

  constructor(
    protected override cookieService: CookieService
  ) {
    super(cookieService);
  }

  [name: string]: any;
  override length: number;

  override clear(): void { }

  override clearForbiddenItems(): void { }

  override getItem(key: string): string {
    return '';
  }

  override key(index: number): string {
    return '';
  }

  override removeItem(key: string): void { }

  override setItem(key: string, value: string): void { }
}
