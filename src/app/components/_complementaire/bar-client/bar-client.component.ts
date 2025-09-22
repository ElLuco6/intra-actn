import { Component, OnInit } from '@angular/core';
import {LogClientService} from "@services/log-client.service";
import {BreakpointObserver} from "@angular/cdk/layout";

@Component({
  selector: 'app-bar-client',
  templateUrl: './bar-client.component.html',
  styleUrls: ['./bar-client.component.scss']
})
export class BarClientComponent implements OnInit {

  phoneFormat;
  /** True = popup deco ouverte / False = popup fermée */
  openConfirmDeco: boolean = false;

  constructor(
    public logClient: LogClientService,
    public breakpointObserver: BreakpointObserver
  ) {}

  ngOnInit(): void {
    this.breakpointObserver
      .observe(['(max-width: 767.98px)'])
      .subscribe((state) => {
        this.phoneFormat = state.matches;
      }
    )
  }
  /** Déconnecte le client */
  logOut() {
    this.logClient.logClientOut().subscribe();
  }

}
