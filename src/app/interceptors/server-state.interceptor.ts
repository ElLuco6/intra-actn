import { HttpEvent, HttpHandler, HttpRequest, HttpResponse } from '@angular/common/http';

import { Injectable } from '@angular/core';

import { makeStateKey, TransferState } from '@angular/core';

import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class ServerStateInterceptor {

    constructor(private transferState: TransferState) { }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

        return next.handle(request).pipe(
            tap(event => {
                if (event instanceof HttpResponse) {
                    // this.transferState.set(makeStateKey(request.url), event.body);
                }
            })
        );

    }

}
