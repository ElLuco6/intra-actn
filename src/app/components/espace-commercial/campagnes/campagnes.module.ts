import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UpdCampagneComponent } from "@components/espace-commercial/campagnes/upd-campagne/upd-campagne.component";
import { CampagnesComponent } from "@components/espace-commercial/campagnes/campagnes.component";
import { AddCampagneComponent } from "@components/espace-commercial/campagnes/add-campagne/add-campagne.component";
import {
  CampagneDetailComponent
} from "@components/espace-commercial/campagnes/campagne-detail/campagne-detail.component";
import { RouterOutlet } from "@angular/router";
import { MatInputModule } from "@angular/material/input";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatSelectModule } from "@angular/material/select";
import { MatCardModule } from "@angular/material/card";
import { InfiniteScrollModule } from "ngx-infinite-scroll";
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
import { ComplementaireModule } from "@_complementaire/complementaire.module";
import { UtilModule } from "@components/_util/util.module";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { NgApexchartsModule } from "ng-apexcharts";
import { MatTableModule } from "@angular/material/table";
import { MatSortModule } from "@angular/material/sort";
import { GraphModule } from "@components/espace-commercial/graph/graph.module";
import { CampagnesRoutingModule } from "@components/espace-commercial/campagnes/campagnes-routing.module";
import {
  ListeCampagnesComponent
} from "@components/espace-commercial/campagnes/liste-campagnes/liste-campagnes.component";
import { PhoningComponent } from "@components/espace-commercial/campagnes/phoning/phoning.component";
import { MatDrawer, MatDrawerContainer, MatDrawerContent } from "@angular/material/sidenav";
import {
  PhoningCommDialogComponent
} from "@components/espace-commercial/campagnes/phoning/phoning-comm-dialog/phoning-comm-dialog.component";
import { MatDialogActions, MatDialogClose, MatDialogContent, MatDialogTitle } from "@angular/material/dialog";
import { ClientProspectFournisseurPipe } from "@components/_util/pipe/client-campapgne.pipe";
import { MatPaginatorModule } from "@angular/material/paginator";
import { EspaceClientModule } from "@components/espace-client/espace-client.module";
import { HighlightDirective } from "@components/_util/directives/highlight.directive";
import { ImporterProspectsNonQualifiesComponent } from './campagne-detail/importer-prospects-non-qualifies/importer-prospects-non-qualifies.component';
import { ModifInfosSocieteComponent } from './phoning/modif-infos-societe/modif-infos-societe.component';
import { EditContactComponent } from './phoning/edit-contact/edit-contact.component';



@NgModule({
  declarations: [
    CampagnesComponent,
    AddCampagneComponent,
    CampagneDetailComponent,
    UpdCampagneComponent,
    ListeCampagnesComponent,
    PhoningComponent,
    PhoningCommDialogComponent,
    ImporterProspectsNonQualifiesComponent,
    ModifInfosSocieteComponent,
    EditContactComponent
  ],
  imports: [
    CommonModule,
    RouterOutlet,
    CampagnesRoutingModule,
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
    MatDrawerContainer,
    MatDrawer,
    MatDrawerContent,
    MatDialogTitle,
    MatDialogContent,
    MatDialogClose,
    MatDialogActions,
    ClientProspectFournisseurPipe,
    MatPaginatorModule,
    EspaceClientModule,
    HighlightDirective
  ]
})
export class CampagnesModule { }
