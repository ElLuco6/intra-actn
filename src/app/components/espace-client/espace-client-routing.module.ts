import { Routes, RouterModule } from '@angular/router';

// import { TicketComponent } from './retours/ticket/ticket.component'; // REMOVED
import { NgModule } from '@angular/core';
import { EspaceClientComponent } from './espace-client.component';
import {DevisComponent} from "@components/espace-client/devis/devis.component";
import {ValidationDevisComponent} from "@components/espace-client/devis/validation-devis/validation-devis.component";
import {
  DevisConfirmationComponent
} from "@components/espace-client/devis/devis-confirmation/devis-confirmation.component";
import {CommandesComponent} from "@components/espace-client/commandes/commandes.component";
import {CotationComponent} from "@components/espace-client/cotation/cotation.component";
import {ReliquatsComponent} from "@components/espace-client/reliquats/reliquats.component";
import {RetourComponent} from "@components/espace-client/retour/retour.component";
import {SuiviRetourComponent} from "@components/espace-client/retour/suivi-retour/suivi-retour.component";
import {ContratsComponent} from "@components/espace-client/contrats/contrats.component";
import {
  ContratModificationComponent
} from "@components/espace-client/contrats/contrat-modification/contrat-modification.component";
import {TarifMarqueComponent} from "@components/espace-client/tarif-marque/tarif-marque.component";
import {NumerosDeSerieComponent} from "@components/espace-client/numeros-de-serie/numeros-de-serie.component";
import {UtilisateursComponent} from "@components/espace-client/utilisateurs/utilisateurs.component";
import {StatsComponent} from "@components/espace-client/stats/stats.component";
import {AdresseComponent} from "@components/espace-client/adresse/adresse.component";
import {AddFormComponent} from "@components/espace-client/adresse/add-form/add-form.component";
import {EditFormComponent} from "@components/espace-client/adresse/edit-form/edit-form.component";
import {GrilleTransportComponent} from "@components/espace-client/grille-transport/grille-transport.component";
import {AuthGardClient} from "@components/espace-client/authGardClient";
import {
  ConditionsTarifairesComponent
} from "@components/espace-client/conditions-tarifaires/conditions-tarifaires.component";
import {DocumentsComponent} from "@components/espace-client/documents/documents.component";
import { PistageComponent } from './pistage/pistage.component';


const routes: Routes = [
  {
    path: '',
    component: EspaceClientComponent,
    data: {
      filDArianne: [{label: 'Espace Client'}]
    },
    canActivate: [AuthGardClient],
    children: [
      {
        path: 'remise',
        component: ConditionsTarifairesComponent
      },
      {
        path: 'commandes',
        component: CommandesComponent,
        data: {
          filDArianne: [{ url: 'commandes', label: 'Commandes', guarded: true }]
        }
      },
      {
        path: 'cotation',
        component: CotationComponent,
        data: {
          filDArianne: [{ url: 'cotation', label: 'Cotation', guarded: true }]
        }
      },
      {
        path: 'reliquats',
        component: ReliquatsComponent,
        data: {
          filDArianne: [{ url: 'reliquats', label: 'Reliquats', guarded: true }]
        },
      },
      {
        path: 'devis',
        component: DevisComponent,
        data: {
          filDArianne: [{ url: 'devis', label: 'Devis', guarded: true }]
        }
      },
      {
        path: 'devis/validation',
        component: ValidationDevisComponent,
        data: {
          filDArianne: [
            { url: 'devis', label: 'Devis' },
            { url: 'validation', label: 'Validation de devis', guarded: true }
          ]
        }
      },
      {
        path: 'devis/confirmation',
        component: DevisConfirmationComponent,
        data: {
          filDArianne: [
            { url: 'devis', label: 'Devis', guarded: true },
            { url: 'confirmation', label: 'Confirmation de devis', guarded: true }
          ]
        }
      },
      {
        path: 'pistage',
        component: PistageComponent
      },
      {
        path: 'retours',
        component: RetourComponent,
        data: {
          filDArianne: [{ url: 'retours', label: 'Demande RMA', guarded: true }]
        }
      },
      {
        path: 'suivi',
        component: SuiviRetourComponent,
        data: {
          filDArianne: [{ url: 'suivi', label: 'Suivi RMA', guarded: true }]
        }
      },
      {
        path: 'contrats',
        component: ContratsComponent,
        data: {
          filDArianne: [{ url: 'contrats', label: 'Contrats et Licences', guarded: true }]
        }
      },
      {
        path: 'contrats/modification',
        component: ContratModificationComponent,
        data: {
          filDArianne: [
            { url: 'contrats', label: 'Contrats et Licences' },
            { url: 'modification', label: 'Modification de licence', guarded: true }
          ]
        }
      },
      {
        path: 'tarif-marque',
        component: TarifMarqueComponent,
        data: {
          filDArianne: [{ url: 'tarif-marque', label: 'Tarif Marque', guarded: true }]
        }
      },
      {
        path: 'numeros-de-serie',
        component: NumerosDeSerieComponent,
        data: {
          filDArianne: [{ url: 'numeros-de-serie', label: 'Numéros de série', guarded: true }]
        }
      },
      {
        path: 'utilisateurs',
        component: UtilisateursComponent,
        data: {
          filDArianne: [
            { url: 'utilisateurs', label: 'Gestion des utilisateurs', guarded: true }
          ]
        }
      },
      {
        path: 'suivi-activite/:id',
        component: StatsComponent,
        data: {
          filDArianne: [{ url: 'suivi-activite', label: 'Suivi d\'activité', guarded: true }]
        }
      },
      {
        path: 'adresses',
        component: AdresseComponent,
        data: {
          filDArianne: [{ url: 'adresses', label: 'Adresses client', guarded: true }]
        }
      },
      {
        path: 'adresses/ajout-adresse',
        component: AddFormComponent,
        data: {
          filDArianne: [
            { url: 'adresses', label: 'Adresses client' },
            { url: 'ajout-adresse', label: 'Ajout d\'adresse', guarded: true }
          ]
        }
      },
      {
        path: 'adresses/modifier-adresse/:id',
        component: EditFormComponent,
        data: {
          filDArianne: [
            { url: 'adresses', label: 'Adresses client' },
            { url: 'modifier-adresse', label: 'Modification d\'adresse', guarded: true }
          ]
        }
      },
      {
        path: 'frais-de-livraison',
        component: GrilleTransportComponent,
      },
      {
        path: 'documents',
        component: DocumentsComponent,
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EspaceClientRoutingModule { }
