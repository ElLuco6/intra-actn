import {CUSTOM_ELEMENTS_SCHEMA, NgModule} from '@angular/core';
import {CommonModule, DatePipe} from '@angular/common';
import {EspaceCommercialComponent} from "@components/espace-commercial/espace-commercial.component";
import {RouterOutlet} from "@angular/router";
import {EspaceCommercialRoutingModule} from "@components/espace-commercial/espace-commercial-routing.module";
import {ReliquatsComponent} from './reliquats/reliquats.component';
import {DevisComponent} from './devis/devis.component';
import {CotationsComponent} from './cotations/cotations.component';
import {SuiviRmaComponent} from './suivi-rma/suivi-rma.component';
import {CompteRenduVisiteComponent} from './compte-rendu-visite/compte-rendu-visite.component';
import {CommandesComponent} from './commandes/commandes.component';
import {MatInputModule} from "@angular/material/input";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MatSelectModule} from "@angular/material/select";
import {MatCardModule} from "@angular/material/card";
import {InfiniteScrollModule} from "ngx-infinite-scroll";
import {MatIconModule} from "@angular/material/icon";
import {MatButtonModule} from "@angular/material/button";
import {ComplementaireModule} from "@_complementaire/complementaire.module";
import {UtilModule} from "@components/_util/util.module";
import {FontAwesomeModule} from "@fortawesome/angular-fontawesome";
import {NgApexchartsModule} from 'ng-apexcharts';
import {MatTableModule} from "@angular/material/table";
import {MatSortModule} from "@angular/material/sort";
import {ProspectsComponent} from './prospects/prospects.component';
import {AddProspectsComponent} from './prospects/add-prospects/add-prospects.component';
import {CommandeRapideComponent} from "@components/espace-commercial/commande-rapide/commande-rapide.component";
import {
  ProspectDetailComponent
} from "@components/espace-commercial/prospects/prospect-detail/prospect-detail.component";
import {CompteRenduComponent} from "@components/compte-rendu/compte-rendu.component";
import {GraphModule} from './graph/graph.module';
import {EricFautePipe} from "@components/_util/pipe/eric-faute.pipe";
import {EspaceClientModule} from "@components/espace-client/espace-client.module";


@NgModule({
  declarations: [
    EspaceCommercialComponent,
    CommandesComponent,
    ReliquatsComponent,
    DevisComponent,
    CotationsComponent,
    SuiviRmaComponent,
    CompteRenduVisiteComponent,
    CommandesComponent,
    ProspectsComponent,
    AddProspectsComponent,
    CommandeRapideComponent,
    ProspectDetailComponent,
    CompteRenduComponent
  ],
  exports: [
    CompteRenduVisiteComponent,
    CompteRenduComponent,
    ProspectsComponent
  ],
  imports: [
    CommonModule,
    RouterOutlet,
    EspaceCommercialRoutingModule,
    MatInputModule,
    FormsModule,
    MatSelectModule,
    MatCardModule,
    InfiniteScrollModule,
    MatIconModule,
    ReactiveFormsModule,
    MatButtonModule,
    ComplementaireModule,
    UtilModule,
    FontAwesomeModule,
    NgApexchartsModule,
    MatTableModule,
    MatSortModule,
    GraphModule,
    EricFautePipe,
    EspaceClientModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [DatePipe]
})
export class EspaceCommercialModule {
}
