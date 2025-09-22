import { Component, OnInit } from '@angular/core';
import {Router} from "@angular/router";
import {Alive, AuthenticationService} from "@services/authentication.service";
import {Subject} from "rxjs";
import { Location } from '@angular/common';

@Component({
  selector: 'app-heartbeat-sensor',
  templateUrl: './heartbeat-sensor.component.html',
  styleUrls: ['./heartbeat-sensor.component.scss']
})
export class HeartbeatSensorComponent implements OnInit {
  /** Bool Définissant si l'on affiche le popup Heartbeat */
  showPopUp: boolean = false;

  /** Observable de nettoyage, déclanchée à la destruction du HeartbeatSensorComponent */
  private _destroy$ = new Subject<void>();

  constructor(
    public auth: AuthenticationService
  ) { }

  /** Initialisation du HeartbeatSensorComponent */
  ngOnInit(): void {
    this.auth.warn$.subscribe((data) => {
      if(data != 'alive'){
        this.showPopUp = true;
      }
    });
  }

  /** Destruction du HeartbeatSensorComponent */
  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  deconnexion(){
    this.auth.logOut().subscribe();
    this.showPopUp = false;
    window.location.reload();
  }

  stayAlive(){
    this.auth.idleWarn.next('alive');
    this.auth.isIdleOrNot();
    this.showPopUp = false;
  }

}
