import {LOCALE_ID, NgModule} from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import {ComplementaireModule} from "@_complementaire/complementaire.module";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MatCardModule} from "@angular/material/card";
import {HttpClient, HttpClientModule} from "@angular/common/http";
import {MatDialogModule} from "@angular/material/dialog";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {MatTableModule} from "@angular/material/table";
import {FontAwesomeModule} from "@fortawesome/angular-fontawesome";
import {CatalogueModule} from "@components/catalogue/catalogue.module";
import {UtilModule} from "@components/_util/util.module";
import {AngularSvgIconModule} from "angular-svg-icon";
import {MatSidenavModule} from "@angular/material/sidenav";
import {InfiniteScrollModule} from "ngx-infinite-scroll";
import { AddFormComponent } from './add-form/add-form.component';
import { EditFormComponent } from './edit-form/edit-form.component';
import { AbonnementsRoutingModule } from './abonnements-routing.module';
import { AbonnementsComponent } from './abonnements.component';
import { TabSortComponent } from '../_util/components/tab-sort/tab-sort.component';
import {MatSortModule} from "@angular/material/sort";
import { MatButtonModule} from '@angular/material/button';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import { FormModelComponent } from './form-model/form-model.component';
import {MatAutocompleteModule} from '@angular/material/autocomplete'; 
import {MatStepperModule} from '@angular/material/stepper'; 
import { DocumentsComponent } from '../espace-client/documents/documents.component';
import { EspaceClientModule } from '../espace-client/espace-client.module';
import { ConfirmDialogComponent } from './form-model/confirm-dialog/confirm-dialog.component';
@NgModule({
  declarations: [
    AddFormComponent,
    EditFormComponent,
    AbonnementsComponent,
    FormModelComponent,
    ConfirmDialogComponent
  ],
    imports: [
      MatAutocompleteModule,
        AbonnementsRoutingModule,
        ComplementaireModule,
        ReactiveFormsModule,
        MatCardModule,
        FormsModule,
        HttpClientModule,
        MatDialogModule,
        MatTableModule,
        MatButtonModule,
        MatSnackBarModule,
        FontAwesomeModule,
        CatalogueModule,
        UtilModule,
        AngularSvgIconModule.forRoot(),
        MatSidenavModule,
        InfiniteScrollModule,
        CommonModule,
        MatSortModule,
        MatStepperModule,
        EspaceClientModule,
        MatDialogModule
        
    ]
})
export class AbonnementsModule { }
