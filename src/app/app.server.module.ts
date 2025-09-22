import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ServerModule } from '@angular/platform-server';

import { ServerStateInterceptor } from "@/interceptors/server-state.interceptor";
import { HTTP_INTERCEPTORS } from '@angular/common/http';

import { AppModule } from './app.module';
import { AppComponent } from './app.component';

import { WindowService } from "@services/window.service";
import { ServerWindowService } from "@services/server-window.service";
import {ServerLocalStorageService } from "@services/server-local-storage.service";
import {LocalStorageService} from "@services/local-storage.service";

@NgModule({
  imports: [
    BrowserModule.withServerTransition({ appId: 'actn-intra' }),
    AppModule,
    ServerModule,
  ],
  providers: [
    { provide: LocalStorageService, useClass: ServerLocalStorageService },
    { provide: WindowService, useClass: ServerWindowService },
    { provide: HTTP_INTERCEPTORS, useClass: ServerStateInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppServerModule { }
