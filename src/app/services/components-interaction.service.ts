import { Injectable } from '@angular/core';
import {Subject} from "rxjs";

class SideNavigationLine {
  private _onOpenSideNav = new Subject<string>();

  get onOpenSideNav$(){
    return this._onOpenSideNav.asObservable();
  }

  fireOpenSideNav(menuName: string){
    this._onOpenSideNav.next(menuName);
  }
}

@Injectable({
  providedIn: 'root'
})
export class ComponentsInteractionService {
  sideNavigationLine = new SideNavigationLine();
  constructor() { }
}
