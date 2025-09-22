// src/app/services/data.service.ts
import { Injectable } from '@angular/core';
import { tap } from "rxjs/operators";
import { HttpClient, HttpParams } from "@angular/common/http";
import { CacheService } from "@services/cache.service";
import { Observable, of } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class DataService {
  constructor(private http: HttpClient, private cacheService: CacheService) {}

  getData(url: string, params?: any, limit?: number): Observable<any> {
    const cacheKey = this.cacheService.createCacheKey(url, { ...params, limit });
    const cachedData = this.cacheService.get(cacheKey);

    if (cachedData) {
      return of(cachedData);
    } else {
      let httpParams = new HttpParams();
      if (params) {
        for (const key of Object.keys(params)) {
          httpParams = httpParams.set(key, params[key]);
        }
      }
      if (limit) {
        httpParams = httpParams.set('limit', limit.toString());
      }

      return this.http.get(url, { params: httpParams }).pipe(
        tap((data) => {
          this.cacheService.set(cacheKey, data);
        })
      );
    }
  }
}
