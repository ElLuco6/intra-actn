import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {ClientsBloquesComponent} from "@components/incidents/clients-bloques/clients-bloques.component";
import {RouterLink, RouterLinkActive} from "@angular/router";
import {MatCardModule} from "@angular/material/card";
import {MatButtonModule} from "@angular/material/button";
import {IncidentsRoutingModule} from "@components/incidents/incidents-routing.module";
import { IncidentsCardsComponent } from './incidents-cards/incidents-cards.component';
import {MatSlideToggleModule} from "@angular/material/slide-toggle";
import {MatTableModule} from "@angular/material/table";
import {MatSortModule} from "@angular/material/sort";
import {MatPaginatorModule} from "@angular/material/paginator";
import {ComplementaireModule} from "@_complementaire/complementaire.module";
import { CommandesBloquesComponent } from './commandes-bloques/commandes-bloques.component';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import { RmaBloqueComponent } from './rma-bloque/rma-bloque.component';
import {FontAwesomeModule} from "@fortawesome/angular-fontawesome";



@NgModule({
  declarations: [
    ClientsBloquesComponent,
    IncidentsCardsComponent,
    CommandesBloquesComponent,
    RmaBloqueComponent
  ],
  exports: [
    IncidentsCardsComponent
  ],
    imports: [
        IncidentsRoutingModule,
        CommonModule,
        RouterLink,
        MatCardModule,
        RouterLinkActive,
        MatButtonModule,
        MatSlideToggleModule,
        MatTableModule,
        MatSortModule,
        MatPaginatorModule,
        ComplementaireModule,
        ReactiveFormsModule,
        FontAwesomeModule,
        FormsModule
    ]
})
export class IncidentsModule { }
