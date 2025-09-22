import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import { windowToggle } from 'rxjs/operators';
import { WindowService } from './window.service';

@Injectable({
  providedIn: 'root'
})
export class ServerWindowService implements WindowService {

  public window = null;
  public location: Location = null;
  public history: History = null;

  public get innerWidth(): number { return 300; }
  public get length(): number { return 0; }

  public get scrollY(): number { return 0; }
  public get pageYOffset(): number { return 0; }

  constructor(
    @Inject(DOCUMENT) public document: Document
  ) { }

  public scroll(x: number, y: number): void { }
  public scrollTo(x: number, y: number): void { }
  public setTimeout(handler: TimerHandler, timeout?: number): number { return 0; }
  public setInterval(handler: TimerHandler, timeout?: number): number { return 0; }
  public clearTimeout(handle?: number): void { }
  public clearInterval(handle?: number): void { }
  public dispatchEvent(event: Event): boolean { return false; }
  public open(url?: string, target?: string, features?: string, replace?: boolean): Window { return null; }
  public alert(message?: any): void { }
}
