import {CUSTOM_ELEMENTS_SCHEMA, LOCALE_ID, NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {LocationStrategy, PathLocationStrategy} from '@angular/common';
import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {ComplementaireModule} from "@_complementaire/complementaire.module";
import {AboutClientComponent} from "@components/about-client/about-client.component";
import {AccueilComponent} from "@components/accueil/accueil.component";
import {ClientsComponent} from "@components/clients/clients.component";
import {FooterComponent} from "@components/footer/footer.component";
import {HeaderComponent} from "@components/header/header.component";
import {IncidentsComponent} from "@components/incidents/incidents.component";
import {LoginComponent} from "@components/login/login.component";
import {MapComponent} from "@components/map/map.component";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MatCardModule} from "@angular/material/card";
import {HttpClientModule} from "@angular/common/http";
import {MatDialogModule} from "@angular/material/dialog";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {RechercheComponent} from '@components/recherche/recherche.component';
import {MatTableModule} from "@angular/material/table";
import {FontAwesomeModule} from "@fortawesome/angular-fontawesome";
import {ClientDetailComponent} from '@components/client-detail/client-detail.component';
import {CatalogueModule} from "@components/catalogue/catalogue.module";
import {AppResolverService} from "@services/app-resolver.service";
import {UtilModule} from "@components/_util/util.module";
import {AngularSvgIconModule} from "angular-svg-icon";
import {FavorisComponent} from "@components/favoris/favoris.component";
import {FilDArianneComponent} from "@_complementaire/fil-d-arianne/fil-d-arianne.component";
import {MatSidenavModule} from "@angular/material/sidenav";
import {ComparateurComponent} from "@components/comparateur/comparateur.component";
import {InfiniteScrollModule} from "ngx-infinite-scroll";
import {OutilsComponent} from "@/components/outils/outils.component";
import {registerLocaleData} from '@angular/common';
import localeFr from '@angular/common/locales/fr';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MAT_DATE_LOCALE, MatNativeDateModule} from "@angular/material/core";
import {EspaceClientModule} from "@components/espace-client/espace-client.module";
import {AbonnementsModule} from '@components/abonnements/abonnements.module';
import {EspaceCommercialModule} from "@components/espace-commercial/espace-commercial.module";
import {HeartbeatSensorComponent} from "@components/heartbeat-sensor/heartbeat-sensor.component";
import {MAT_FORM_FIELD_DEFAULT_OPTIONS, MatFormFieldModule} from "@angular/material/form-field";
import {MatSortModule} from "@angular/material/sort";
import {CustomPaginator} from "@/class/CustomPaginatorConfiguration";
import {MatPaginatorIntl} from "@angular/material/paginator";
import {IncidentsModule} from "@components/incidents/incidents.module";

registerLocaleData(localeFr);
import {
  IPublicClientApplication,
  PublicClientApplication,
  BrowserCacheLocation
} from '@azure/msal-browser';
import {
  MsalModule,
  MsalService,
  MSAL_INSTANCE
} from '@azure/msal-angular';
import {OAuthSettings} from "@models/oauth";
import {NgbModule} from "@ng-bootstrap/ng-bootstrap";
import {AlertsComponent} from "@components/alerts/alerts.component";
import {GrilleTarifMarqueComponent} from "@components/grille-tarif-marque/grille-tarif-marque.component";
import {WorkaroundMatFormAccessorDirective} from "@/directives/workaround-mat-form-accessor.directive";
import {NgIdleKeepaliveModule} from "@ng-idle/keepalive";
import {FinanceComponent} from "@components/finance/finance.component";
import {MatBadge} from "@angular/material/badge";
import {BreadcrumbComponent} from "@components/breadcrumb/breadcrumb.component";
import {MailDeRelanceComponent} from "@components/finance/mail-de-relance/mail-de-relance.component";

let msalInstance: IPublicClientApplication | undefined = undefined;

export function MSALInstanceFactory(): IPublicClientApplication {
  msalInstance = msalInstance ?? new PublicClientApplication({
    auth: {
      clientId: OAuthSettings.appId,
      redirectUri: OAuthSettings.redirectUri,
      postLogoutRedirectUri: OAuthSettings.redirectUri
    },
    cache: {
      cacheLocation: BrowserCacheLocation.LocalStorage,
    }
  });

  return msalInstance;
}


@NgModule({
  declarations: [
    AlertsComponent,
    AppComponent,
    AboutClientComponent,
    ClientsComponent,
    FooterComponent,
    HeaderComponent,
    IncidentsComponent,
    LoginComponent,
    MapComponent,
    AccueilComponent,
    RechercheComponent,
    ClientDetailComponent,
    FavorisComponent,
    FilDArianneComponent,
    ComparateurComponent,
    OutilsComponent,
    HeartbeatSensorComponent,
    GrilleTarifMarqueComponent,
    WorkaroundMatFormAccessorDirective,
    FinanceComponent,
    BreadcrumbComponent
  ],
  imports: [
    BrowserModule,
    NgIdleKeepaliveModule.forRoot(),
    BrowserAnimationsModule,
    AppRoutingModule,
    ComplementaireModule,
    ReactiveFormsModule,
    MatCardModule,
    FormsModule,
    HttpClientModule,
    MatDialogModule,
    MatTableModule,
    FontAwesomeModule,
    CatalogueModule,
    UtilModule,
    AngularSvgIconModule.forRoot(),
    MatSidenavModule,
    InfiniteScrollModule,
    AbonnementsModule,
    NgbModule,
    MsalModule,
    MatDatepickerModule,
    MatNativeDateModule,
    EspaceClientModule,
    EspaceCommercialModule,
    MatSortModule,
    IncidentsModule,
    MatBadge,
    MailDeRelanceComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  exports: [
    IncidentsComponent
  ],
  providers: [
    AppResolverService,
    {provide: LOCALE_ID, useValue: 'fr-FR'},
    {provide: LocationStrategy, useClass: PathLocationStrategy},
    {provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: {appearance: 'fill'}},
    {provide: MatPaginatorIntl, useValue: CustomPaginator()},
    {provide: MSAL_INSTANCE, useFactory: MSALInstanceFactory},
    MsalService
  ],
  bootstrap: [AppComponent],
})
export class AppModule {
}
