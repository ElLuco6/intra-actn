import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Client} from "@/models";
import {environment} from "@env/environment";
import { Observable } from 'rxjs';
import {Contact} from "@models/contact";

@Injectable({
  providedIn: 'root'
})
export class ClientsService {

  constructor(private http: HttpClient) { }

  getClients(): Observable<Client[]> {
    return this.http.get<Client[]>(`${environment.apiUrl}/ListeClients.php`, {
      withCredentials: true,
      params: { region: 'ALL' }
    });
  }

  getClient(numClient){
    return this.http.get<Client>(`${environment.apiUrl}/ListeClientsDetail.php`, {
      params: {
        numclient: numClient
      },
      withCredentials: true
    })
  }

  getContacts(numClient){
    return this.http.get<Contact[]>(`${environment.apiUrl}/ListeclientsContacts.php`, {
      params: {
        numclient: numClient
      }
    });
  }
}
