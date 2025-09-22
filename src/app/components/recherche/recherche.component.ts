import {Component, Input, OnInit} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {HttpClient} from "@angular/common/http";
import {Observable, of} from "rxjs";
import {SearchService} from "@services/search.service";
import {Client, ClientCde, Produit, User} from "@/models"
import { Chips } from "@components/_complementaire/chips-list/chips-list.component";
import {LogClientService} from "@services/log-client.service";

@Component({
  selector: 'app-recherche',
  templateUrl: './recherche.component.html',
  styleUrls: ['./recherche.component.scss']
})
export class RechercheComponent implements OnInit {

  @Input() toDisplay: number = 10;
  searchParam: any;
  errorSearch: boolean = false;
  all$: Observable<Array<any>>
  aucunRes: boolean = false;
  produits;
  produitsFiltered: Produit[] = [];
  clients;
  clientsFiltered: Client[] = [];
  clientCde;
  clientCdeFiltered: ClientCde[] = [];
  chips: Chips[] = [];
  produitCount: number = 0;
  clientCount: number = 0;
  cdeCount: number = 0;
  produitSelected: boolean = false;
  clientSelected: boolean = false;
  cdeSelected: boolean = false;
  tabAllResult: any[] = [];
  currentUser: User;
  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private search: SearchService,
    private auth: LogClientService
  ) {
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.searchParam = params['search']
    });
    this.getAllResults();

    setTimeout(() => {
      this.currentUser = this.auth.currentClient;
    }, 500);

    setTimeout(() => {
      this.auth._currentCient$.subscribe(user => {
        if (this.currentUser?.id !== user?.id) {
          this.currentUser = this.auth.currentClient;
          this.getAllResults();
        }
      });
    }, 1000);
  }

  test = null;
  sousTableau = [];
  tab = [];
  tabCde = [];

  testClient = null;
  sousTableauClient = [];
  tabClient = [];
  tabClientFinal = [];

  getAllResults() {
    this.produitsFiltered = [];
    this.tabClientFinal = [];
    this.tab = [];
    this.all$ = this.search.getResultSearchAll(this.searchParam);
    this.all$.subscribe(
      (data) => {
        this.tabAllResult = data;
        data.forEach((e) => {
          if(e.type == 'PRODUIT'){
            this.produitsFiltered.push(e);
          }
          if(e.type == 'CLIENT'){
            this.clientsFiltered.push(e);
          }
          if(e.type == 'COMMANDE'){
            this.clientCdeFiltered.push(e);
          }
        });
        this.aucunRes = true;
        this.clientCdeFiltered.forEach((e) => {
           if(e.nom != this.test){
             this.sousTableau = [];
             this.tabCde = [];
             this.tabCde.push(e['clientCde']);
             this.sousTableau.push(e);
             this.sousTableau.push(this.tabCde);
             this.test = e.nom;
             if(this.sousTableau){
               this.tab.push(this.sousTableau);
             }
           }else{
             this.sousTableau[1].push(e['clientCde']);
           }
        });

        this.clientsFiltered.forEach((e) => {
          if(e.numclient != this.testClient){
            this.sousTableauClient = [];
            this.tabClient = [];
            this.tabClient.push(e['contact']);
            this.sousTableauClient.push(e);
            this.sousTableauClient.push(this.tabClient);
            this.testClient = e.numclient;
            if(this.sousTableauClient){
              this.tabClientFinal.push(this.sousTableauClient);
            }
          }else{
            this.sousTableauClient[1].push(e['contact'])
          }
        })
        this.produitsFiltered.sort((a, b) => b.classe - a.classe);
        this.count();
      }
    )
  }

  private count(){
    this.clientCdeFiltered.forEach(() => {
      this.cdeCount += 1;
    });
    this.produitsFiltered.forEach(() => {
      this.produitCount += 1;
    });
    this.tabClientFinal.forEach(() => {
      this.clientCount += 1;
    });
  }

  public btnFiltreProduit(){
    this.produitSelected = !this.produitSelected;
  }

  public btnFiltreClient(){
    this.clientSelected = !this.clientSelected;
  }

  public btnFiltreCommande(){
    this.cdeSelected = !this.cdeSelected;
  }

  onScrollDown() {
    this.toDisplay += 5;
  }
  onScrollUp() {
    this.toDisplay -= this.toDisplay > 5 ? 5 : 0;
  }

}
