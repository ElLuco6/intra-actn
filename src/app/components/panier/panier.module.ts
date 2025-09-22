import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {PanierComponent} from "@components/panier/panier.component";
import {MatIconModule} from "@angular/material/icon";
import {RouterLink, RouterLinkActive} from "@angular/router";
import {MatProgressSpinnerModule} from "@angular/material/progress-spinner";
import { StepperComponent } from './stepper/stepper.component';
import { LabelPanierComponent } from './label-panier/label-panier.component';
import { PanierRowComponent } from './panier-row/panier-row.component';
import {ComplementaireModule} from "@_complementaire/complementaire.module";
import {PanierRoutingModule} from "@components/panier/panier-routing.module";
import {MatCardModule} from "@angular/material/card";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import { ValidationPanierComponent } from './validation-panier/validation-panier.component';
import {UtilModule} from "@components/_util/util.module";
import { ConfirmationPanierComponent } from './confirmation-panier/confirmation-panier.component';
import {MatDialogModule} from "@angular/material/dialog";
import {CdkDrag, CdkDragPlaceholder, CdkDropList} from "@angular/cdk/drag-drop";



@NgModule({
  declarations: [
    PanierComponent,
    StepperComponent,
    LabelPanierComponent,
    PanierRowComponent,
    ValidationPanierComponent,
    ConfirmationPanierComponent
  ],
  exports: [
      PanierRowComponent,
      LabelPanierComponent,
      ValidationPanierComponent,
      PanierRoutingModule
  ],
    imports: [
        PanierRoutingModule,
        CommonModule,
        MatIconModule,
        RouterLink,
        MatProgressSpinnerModule,
        ComplementaireModule,
        RouterLinkActive,
        MatCardModule,
        ReactiveFormsModule,
        UtilModule,
        MatDialogModule,
        FormsModule,
        CdkDropList,
        CdkDrag,
        CdkDragPlaceholder
    ]
})
export class PanierModule { }
