import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {map} from "rxjs/operators";
import {environment} from "@env/environment";

@Injectable({
  providedIn: 'root'
})
export class DepartementAndRegionService {

  constructor(private http: HttpClient) { }

  getDepartements(){
    return this.http.get<any[]>(`${environment.apiUrl}/departement.php`);
  }
}
