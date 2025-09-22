import { HttpEvent, HttpHandler, HttpRequest, HttpResponse } from '@angular/common/http';
import {Injectable, StateKey} from '@angular/core';
import { TransferState, makeStateKey } from '@angular/core';
import { AuthenticationService } from "@services/authentication.service";
import { Observable, of } from 'rxjs';

@Injectable()
export class BrowserStateInterceptor {

  constructor(
    private transferState: TransferState,
    private authenticationService: AuthenticationService
  ) { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (request.method !== 'GET' || this.authenticationService.currentUser != null) {
      return next.handle(request);
    }

    const key: StateKey<void> = makeStateKey(request.url);

    if (this.transferState.hasKey(key)) {
      const storedResponse = this.transferState.get(key, null);
      this.transferState.remove(key);
      const response = new HttpResponse({ body: storedResponse, status: 200 });
      return of(response);
    } else {
      return next.handle(request);
    }
  }
}
