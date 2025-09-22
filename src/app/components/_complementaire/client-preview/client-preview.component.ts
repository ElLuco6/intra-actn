import {Component, Input, OnInit} from '@angular/core';
import {Client} from "@/models";
import {Router} from "@angular/router";
import {ClientCde} from "@/models";
import {environment} from "@env/environment";
import {LogClientService} from "@services/log-client.service";
import {Prospect} from "@models/prospect";

@Component({
  selector: 'app-client-preview',
  templateUrl: './client-preview.component.html',
  styleUrls: ['./client-preview.component.scss']
})
export class ClientPreviewComponent implements OnInit {

  @Input() clients: Client;
  @Input() clientCde: ClientCde;
  @Input() prospects: Prospect;
  environment = environment;
  constructor(
    public logCLient: LogClientService
  ) { }

  ngOnInit(): void {
    if(this.clients){
      this.clients[0].numclient = Number(this.clients[0].numclient);
      this.clients[0]['risqueGlobal'] = Number(this.clients[0].EncoursBL) + Number(this.clients[0].EncoursCompta);
      this.clients[1].forEach((e) => {
        e.num = Number(e.num);
      });
    }
    if(this.clientCde){
      this.clientCde[0]['numclient'] = Number(this.clientCde[0]['numclient']);
    }

  }

  delogRelog(numClient: number){
    this.logCLient.logClientOut().subscribe(
      () => {
        this.logCLient.logClient(numClient).subscribe()
      }
    );
  }
}
