import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';

import {getRandomShit, PanierComponent} from './panier.component';
import {ValidationPanierComponent} from "@components/panier/validation-panier/validation-panier.component";
import {ConfirmationPanierComponent} from "@components/panier/confirmation-panier/confirmation-panier.component";
import {AuthGardClient} from "@components/espace-client/authGardClient";

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: PanierComponent,
    //canActivate: [AuthGardClient],
    data: {
      filDArianne: [{ url: 'panier', label: 'Panier', guarded: true }],
    },
  },
  {
    path: 'commander/valider',
    component: ValidationPanierComponent,
    data: {
      filDArianne: [
        { url: 'panier', label: 'Panier', guarded: false },
        { url: 'commande', label: 'Commande', guarded: true },
      ],
    },
  },
  {
    path: 'confirmation',
    component: ConfirmationPanierComponent,
    data: {
      filDArianne: [
        { url: 'panier', label: 'Panier', guarded: false },
        { url: 'confirmation', label: 'Confirmation', guarded: true },
      ],
    },
  },
  {
    path: 'commander/devis',
    component: ValidationPanierComponent,
    data: {
      test: 8
    },
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PanierRoutingModule { }
