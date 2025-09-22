import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { EspaceCommercialComponent } from '@components/espace-commercial/espace-commercial.component';
import { ReliquatsComponent } from '@components/espace-commercial/reliquats/reliquats.component';
import { SuiviRmaComponent } from '@components/espace-commercial/suivi-rma/suivi-rma.component';
import { DevisComponent } from '@components/espace-commercial/devis/devis.component';
import { CompteRenduVisiteComponent } from '@components/espace-commercial/compte-rendu-visite/compte-rendu-visite.component';
import { CotationsComponent } from '@components/espace-commercial/cotations/cotations.component';
import { CommandesComponent } from '@components/espace-commercial/commandes/commandes.component';
import { ProspectsComponent } from '@components/espace-commercial/prospects/prospects.component';
import { AddProspectsComponent } from '@components/espace-commercial/prospects/add-prospects/add-prospects.component';
import { CommandeRapideComponent } from '@components/espace-commercial/commande-rapide/commande-rapide.component';
import { ProspectDetailComponent } from '@components/espace-commercial/prospects/prospect-detail/prospect-detail.component';

const routes: Routes = [
  {
    path: '',
    component: EspaceCommercialComponent,
    children: [
      {
        path: 'suivi-activite',
        loadChildren: () =>
          import('@components/espace-commercial/graph/graph.module').then(
            (mod) => mod.GraphModule
          ),
      },
      {
        path: 'commande-rapide',
        component: CommandeRapideComponent,
        data: {
          filDArianne: [{ label: 'Commande Rapide' }],
        },
      },
      {
        path: 'commandes',
        component: CommandesComponent,
        data: {
          filDArianne: [{ label: 'Commandes' }],
        },
      },
      {
        path: 'reliquats',
        component: ReliquatsComponent,
        data: {
          filDArianne: [{ label: 'Reliquats' }],
        },
      },
      {
        path: 'suivi-rma',
        component: SuiviRmaComponent,
        data: {
          filDArianne: [{ label: 'Suivi RMA' }],
        },
      },
      {
        path: 'devis',
        component: DevisComponent,
        data: {
          filDArianne: [{ label: 'Devis' }],
        },
      },
      {
        path: 'compte-rendu-visite',
        component: CompteRenduVisiteComponent,
        data: {
          filDArianne: [{ label: 'Comptes rendu de visite' }],
        },
      },
      {
        path: 'cotation',
        component: CotationsComponent,
        data: {
          filDArianne: [{ label: 'Cotation' }],
        },
      },


      {
        path: 'campagne',
        loadChildren: () =>
          import('@components/espace-commercial/campagnes/campagnes.module').then(
            (mod) => mod.CampagnesModule
          ),
      },
      /*{
        path: 'campagnes',
        component: CampagnesComponent,
        data: {
          filDArianne: [{ label: 'Campagnes' }],
        },
      },
      {
        path: 'campagnes/add',
        component: AddCampagneComponent,
        data: {
          filDArianne: [{ label: 'Ajout-Campagne' }],
        },
      },
      {
        path: 'campagnes/detail/:id',
        component: CampagneDetailComponent,
        data: {
          filDArianne: [{ label: 'Detail-campagne' }],
        },
      },*/

      {
        path: 'prospects',
        component: ProspectsComponent,
        data: {
          filDArianne: [
            { url: 'espace-commercial/prospects', label: 'Prospects' },
          ],
        },
      },
      {
        path: 'prospects/add',
        component: AddProspectsComponent,
        data: {
          filDArianne: [
            { label: 'Prospects' },
            { label: "Ajout d'un prospects" },
          ],
        },
      },
      {
        path: 'prospects/detail/:id',
        component: ProspectDetailComponent,
        data: {
          filDArianne: [{ label: 'Prospects' }, { label: 'Detail' }],
        },
      },
      {
        path: 'cotations',
        component: CotationsComponent,
        data: {
          filDArianne: [{ label: 'Cotations' }],
        },
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EspaceCommercialRoutingModule {}
