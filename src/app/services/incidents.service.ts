import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {environment} from "../../environments/environment";
import {Observable, of, Subject} from "rxjs";
import {ClientCde} from "../models/clientCde";

@Injectable({
  providedIn: 'root'
})
export class IncidentsService {

  test: Observable<ClientCde[]>

  constructor(
    private http: HttpClient
  ) { }

  public getCdeBloquee(){
    this.test = this.http.get<ClientCde[]>(`${environment.apiUrl}/ListeCdeBloquees.php`, {
      params: {
        fitreregion: 'N'
      }
    });

    return this.test;
  }
}
