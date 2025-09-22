import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SuiviActiviteComponent } from './suivi-activite/suivi-activite.component';
import { UtilModule } from '@/components/_util/util.module';
import { ComplementaireModule } from "../../_complementaire/complementaire.module";
import { NgApexchartsModule } from 'ng-apexcharts';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { GraphRoutingModule } from './graph-routing.module';
import { MatTableModule } from '@angular/material/table';
import { CaJournalierComponent } from './ca-journalier/ca-journalier.component';
import { CaJournalierDetailsComponent } from './ca-journalier-details/ca-journalier-details.component';
import { MatDialogContent, MatDialogModule, MatDialogTitle } from '@angular/material/dialog';
import { SuiviObjectifsComponent } from './suivi-objectifs/suivi-objectifs.component';
import { TableauObjectifsComponent } from './suivi-objectifs/tableau-objectifs/tableau-objectifs.component';
import { MatCardModule } from '@angular/material/card';
import { SuiviCAComponent } from './suivi-ca/suivi-ca.component';
import { SuiviCADialogComponent } from './suivi-ca/suivi-ca-dialog/suivi-ca-dialog.component';
import {FilterPipe} from "@components/_util/pipe/filter.pipe";
import {MatSortModule} from "@angular/material/sort";

@NgModule({
  declarations: [
    SuiviActiviteComponent,
    SuiviObjectifsComponent,
    SuiviCAComponent,
    SuiviCADialogComponent,
    TableauObjectifsComponent,
    CaJournalierComponent,
    CaJournalierDetailsComponent
  ],
  imports: [
    CommonModule,
    UtilModule,
    ComplementaireModule,
    NgApexchartsModule,
    FormsModule,
    ReactiveFormsModule,
    GraphRoutingModule,
    MatTableModule,
    MatDialogModule,
    MatDialogContent,
    MatDialogTitle,
    MatCardModule,
    MatSortModule,
    FilterPipe
  ]
})
export class GraphModule { }
