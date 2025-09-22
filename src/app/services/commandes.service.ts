import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Commande} from "@/models";
import {Observable} from "rxjs";
import {environment} from "@env/environment";

@Injectable({
  providedIn: 'root'
})
export class CommandesService {
  constructor(private httpClient: HttpClient) { }

  /**
   * Renvoie les en-têtes de toutes les commandes passées par le client.
   */
  getCommandes(client): Observable<Array<Commande>> {
    return this.httpClient.get<Commande[]>(`${environment.apiUrl}/CommandesEntete.php`,
      {
        withCredentials: true,
        params: {
          client: client
        }
      });
  }
}
