import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {DevisComponent} from "@components/espace-client/devis/devis.component";
import {EspaceClientRoutingModule} from "@components/espace-client/espace-client-routing.module";
import {EspaceClientComponent} from "@components/espace-client/espace-client.component";
import {DevisActnComponent} from "@components/espace-client/devis/devis-actn/devis-actn.component";
import {MatPaginatorModule} from "@angular/material/paginator";
import {FontAwesomeModule} from "@fortawesome/angular-fontawesome";
import {ComplementaireModule} from "@_complementaire/complementaire.module";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import { DevisConfirmationComponent } from './devis/devis-confirmation/devis-confirmation.component';
import { ValidationDevisComponent } from './devis/validation-devis/validation-devis.component';
import {PanierModule} from "@components/panier/panier.module";
import {UtilModule} from "@components/_util/util.module";
import { CommandesComponent } from './commandes/commandes.component';
import { CotationComponent } from './cotation/cotation.component';
import { ReliquatsComponent } from './reliquats/reliquats.component';
import { RetourComponent } from './retour/retour.component';
import { SuiviRetourComponent } from './retour/suivi-retour/suivi-retour.component';
import { ContratsComponent } from './contrats/contrats.component';
import { ContratsCommandesComponent } from './contrats/contrats-commandes/contrats-commandes.component';
import { ContratModificationComponent } from './contrats/contrat-modification/contrat-modification.component';
import { TarifMarqueComponent } from './tarif-marque/tarif-marque.component';
import { NumerosDeSerieComponent } from './numeros-de-serie/numeros-de-serie.component';
import { UtilisateursComponent } from './utilisateurs/utilisateurs.component';
import { StatsComponent } from './stats/stats.component';
import {NgApexchartsModule} from "ng-apexcharts";
import { AdresseComponent } from './adresse/adresse.component';
import { AddFormComponent } from './adresse/add-form/add-form.component';
import { EditFormComponent } from './adresse/edit-form/edit-form.component';
import { GrilleTransportComponent } from './grille-transport/grille-transport.component';
import {MatCardModule} from "@angular/material/card";
import {
  ConditionsTarifairesComponent
} from "@components/espace-client/conditions-tarifaires/conditions-tarifaires.component";
import {MatTableModule} from "@angular/material/table";
import {MatSortModule} from "@angular/material/sort";
import { DocumentsComponent } from './documents/documents.component';
import { PistageComponent } from './pistage/pistage.component';


@NgModule({
    declarations: [
      DevisComponent,
      EspaceClientComponent,
      DevisActnComponent,
      DevisConfirmationComponent,
      ValidationDevisComponent,
      CommandesComponent,
      CotationComponent,
      ReliquatsComponent,
      RetourComponent,
      SuiviRetourComponent,
      ContratsComponent,
      ContratsCommandesComponent,
      ContratModificationComponent,
      TarifMarqueComponent,
      NumerosDeSerieComponent,
      UtilisateursComponent,
      StatsComponent,
      AdresseComponent,
      AddFormComponent,
      EditFormComponent,
      GrilleTransportComponent,
      ConditionsTarifairesComponent,
      DocumentsComponent,
      PistageComponent
    ],
    exports: [
        UtilisateursComponent,
        StatsComponent,
        CommandesComponent,
        DevisComponent,
        ReliquatsComponent,
        CotationComponent,
        GrilleTransportComponent,
        ConditionsTarifairesComponent,
        DocumentsComponent,
        PistageComponent,
        SuiviRetourComponent
    ],
  imports: [
    CommonModule,
    EspaceClientRoutingModule,
    MatPaginatorModule,
    FontAwesomeModule,
    ComplementaireModule,
    FormsModule,
    PanierModule,
    ReactiveFormsModule,
    UtilModule,
    NgApexchartsModule,
    MatCardModule,
    MatTableModule,
    MatSortModule,
  ]
})
export class EspaceClientModule { }
