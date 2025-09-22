import {Injectable} from "@angular/core";
import {LocalStorageService} from "@services/local-storage.service";
import {Router} from "@angular/router";

@Injectable({providedIn: 'root'})
export class AuthGardClient {

  constructor(
    private localStorage: LocalStorageService,
    private router: Router
  ) {
  }

  canActivate(){
    setTimeout(() => {
      if(!this.localStorage.getItem('client')){
        this.router.navigate(['/'])
      }
    }, 100)
  }
}
