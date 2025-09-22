import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from "@angular/router";
import { HttpClient } from "@angular/common/http";
import { Client } from "@/models";
import { animate, state, style, transition, trigger } from "@angular/animations";
import { DateAdapter } from "@angular/material/core";
import { LogClientService } from "@services/log-client.service";
import { ClientsService } from "@services/clients.service";
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-client-detail',
  templateUrl: './client-detail.component.html',
  styleUrls: ['./client-detail.component.scss'],
  animations: [
    trigger('expandVertical', [
      state('open', style({ height: '*' })),
      state('closed', style({ height: '0' })),
      transition('open => closed', animate('300ms ease-in-out')),
      transition('closed => open', animate('300ms ease-in-out'))
    ])
  ]
})
export class ClientDetailComponent implements OnInit, OnDestroy {
  maxDate: Date;
  action: string;
  collapsedIdsArray: string[] = [];
  client: Client;
  isLoading: boolean;
  nomFiltre: string;
  whatToDisplay: string;
  listContacts: any[] = null;
  private routeSub: Subscription;
  clientConnected: boolean;
  numClient: number;
  contactLoaded: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private _adapter: DateAdapter<any>,
    public authClient: LogClientService,
    private clientService: ClientsService
  ) { }

  ngOnInit(): void {
    this.routeSub = this.route.params.subscribe(params => {
      this.numClient = params['client'];
      this.route.queryParams.subscribe(queryParams => {
        this.whatToDisplay = queryParams['display'] || localStorage.getItem('selectedTab') || 'fiche';
      });
      this.initializeComponent();
    });
  }

  private initializeComponent(): void {
    this._adapter.setLocale('fr');
    this.contactLoaded = false;
    this.isLoading = true;

    this.clientService.getClient(this.numClient).subscribe(
      (data: Client) => {
        this.client = data[0];
        const re = new RegExp(' ');
        this.nomFiltre = this.client.nom.replace(re, '');
        this.client.risqueGlobal = Number(this.client.EncoursCompta) + Number(this.client.EncoursBL);
        this.isLoading = false;
      }
    );

    this.clientService.getContacts(this.numClient).subscribe(
      (data) => {
        this.listContacts = data;
        this.contactLoaded = true;
      }
    );

    this.maxDate = new Date();

    this.authClient._currentCient$.subscribe(
      (data) => {
        this.clientConnected = data != null;
      }
    );
  }

  ngOnDestroy(): void {
    if (this.routeSub) {
      this.routeSub.unsubscribe();
    }
  }

  toggleCollapseDivById(event, id: string): void {
    if (!event.srcEvent) {
      if (this.collapsedIdsArray.includes(id)) {
        this.collapsedIdsArray.splice(this.collapsedIdsArray.indexOf(id), 1);
      } else {
        this.collapsedIdsArray.push(id);
      }
    }
  }

  jumpToAnchor(anchor: string): void {
    const offset = this.clientConnected ? 140 : 115;
    window.scrollTo({ behavior: 'smooth', top: window.scrollY + document.querySelector('#' + anchor).getBoundingClientRect().top - offset });
  }

  // Method to handle tab click and store the selected tab in local storage
  onTabClick(tab: string): void {
    this.whatToDisplay = tab;
    localStorage.setItem('selectedTab', tab);
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { display: tab },
      queryParamsHandling: 'merge'
    });
  }
}

export class MotifCompteRendu {
  argument: string;
  argumentlibelle: string;
  libelle: string;
}
