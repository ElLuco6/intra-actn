import { Injectable } from '@angular/core';
import {HttpRequest, HttpHandler, HttpEvent, HttpInterceptor} from '@angular/common/http';
import { Observable } from 'rxjs';
import { LoadingService } from "@services/loading.service";
import { finalize } from 'rxjs/operators';

@Injectable()
export class LoadingInterceptorService implements HttpInterceptor{

  private activeRequests = 0;

  constructor(private loadingService: LoadingService) { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!request.url.endsWith('StayingAlive.php')) {
      if (this.activeRequests === 0) {
        this.loadingService.startLoading();
      }
      this.activeRequests++;
    }

    return next.handle(request).pipe(
      finalize(() => {
        if (!request.url.endsWith('StayingAlive.php')) {
          this.activeRequests--;
          if (this.activeRequests === 0) {
            this.loadingService.stopLoading();
          }
        }
      })
    );
  }
}
