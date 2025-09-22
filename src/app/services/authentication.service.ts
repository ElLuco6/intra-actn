import {Injectable} from '@angular/core';
import {environment} from "@env/environment";
import {BehaviorSubject, finalize, map, Observable, Subject, take} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {User} from "@/models";
import {LocalStorageService} from "@services/local-storage.service";
import {DEFAULT_INTERRUPTSOURCES, Idle} from "@ng-idle/core";

export type Alive = 'alive' | 'dying' | 'dead';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  private _currentUser = new BehaviorSubject<User>(null);
  idleWarn: BehaviorSubject<Alive> = new BehaviorSubject<Alive>('alive');

  constructor(
    private http: HttpClient,
    private localStorage: LocalStorageService,
    private _idle: Idle
  ) {
  }

  get warn$(){
    return this.idleWarn.asObservable();
  }
  get warn(){
    return this.idleWarn.value;
  }

  /** Renvoie l'observable de l'utilisateur connecté */
  public get currentUser$(): Observable<User> {
    return this._currentUser.asObservable();
  }

  /** Renvoie la valeur de l'utilisateur connecté */
  public get currentUser(): User {
    return this._currentUser.value;
  }

  login(login: string, password: string){
    return this.http.post<any>(`${environment.apiUrl}/LogIntra.php`,
      {
        login,
        password
      },
      {withCredentials: true}
    ).pipe(take(1), map(data => this._login(data)));
  }

  private _login(data): User | any {
    if(data.user?.id !== '' && data.user?.id !== undefined){
      this._currentUser.next(data.user as User);
      this.localStorage.setItem('user', data.user.id.toString());
      this.localStorage.removeItem('client');
      this.isIdleOrNot();
      return data.user as User;
    }else if(data.error){
      return data;
    }
    return null;
  }

  isIdleOrNot(){
    this._idle.setIdle(1800);
    this._idle.setTimeout(300);
    this._idle.setInterrupts(DEFAULT_INTERRUPTSOURCES);
    this._idle.onIdleStart.subscribe(() => {this.idleWarn.next('alive');});
    this._idle.onIdleEnd.subscribe(() => {});
    this._idle.onTimeoutWarning.subscribe(() => {
      this.idleWarn.next('dying');
    });
    this._idle.onTimeout.subscribe(() => {
      this.idleWarn.next('dead');
    });
    this._idle.watch();
  }

  retrieveCurrentSession(): Observable<any> {
    return this.http.get(`${environment.apiUrl}/RetrieveSession.php`, { withCredentials: true })
      .pipe(take(1), map(data => this._login(data)));
  }

  logOut(): Observable<any>{
    return this.http.post<any>(`${environment.apiUrl}/LogIntraOut.php`, null, {
      withCredentials: true
    }).pipe(finalize(() => {
      this._currentUser.next(null);
      this.localStorage.removeItem('user');
      this._idle.stop();
    }))
  }

}
