import {APP_ID, APP_INITIALIZER, NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import { BrowserStateInterceptor } from "@/interceptors/browser-state.interceptor";
import { HTTP_INTERCEPTORS } from '@angular/common/http';

import { AppModule } from './app.module';
import { AppComponent } from './app.component';
import { LoadingInterceptorService } from "@services/loading-interceptor.service";
import { AppResolverService } from "@services/app-resolver.service";
import {MonitorInterceptor} from "@/interceptors/MonitorInterceptor";

export function initializeConfiguration(appResolver: AppResolverService) {
  return (): Promise<any> => {
    return appResolver.init();
  };
}

@NgModule({
  imports: [
    AppModule,
  ],
  providers: [
    { provide: APP_ID,  useValue: 'actn-intra' },
    { provide: APP_INITIALIZER, useFactory: initializeConfiguration, deps: [AppResolverService], multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: LoadingInterceptorService, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: BrowserStateInterceptor, multi: true, },
    //{ provide: HTTP_INTERCEPTORS, useClass: MonitorInterceptor, multi: true, }
  ],
  bootstrap: [AppComponent],
})
export class AppBrowserModule { }
