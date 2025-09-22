import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import {CampagnesComponent} from "@components/espace-commercial/campagnes/campagnes.component";
import {AddCampagneComponent} from "@components/espace-commercial/campagnes/add-campagne/add-campagne.component";
import {
  CampagneDetailComponent
} from "@components/espace-commercial/campagnes/campagne-detail/campagne-detail.component";
import {UpdCampagneComponent} from "@components/espace-commercial/campagnes/upd-campagne/upd-campagne.component";
import {
  ListeCampagnesComponent
} from "@components/espace-commercial/campagnes/liste-campagnes/liste-campagnes.component";
import {PhoningComponent} from "@components/espace-commercial/campagnes/phoning/phoning.component";

const routes: Routes = [
  {
    path: '',
    component: CampagnesComponent,
    children: [
      {
        path: '',
        component: ListeCampagnesComponent,
        data: {
          filDArianne: [{ label: 'Campagnes' }],
        }
      },
      {
        path: 'enregistrer',
        component: AddCampagneComponent,
        data: {
          filDArianne: [
            { url : 'espace-commercial/campagne', label: 'Campagnes' },
            { url: '', label: 'Enregistrer-Campagne' }
          ],
        },
      },
      {
        path: ':id',
        component: CampagneDetailComponent,
        data: {
          filDArianne: [
            { url : 'espace-commercial/campagne', label: 'Campagnes' },
            { url: 'detail/:id', label: ':id' },
          ],
        }
      },
      {
        path: ':id/modifier',
        component: UpdCampagneComponent,
        data: {
          filDArianne: [
            { url : 'espace-commercial/campagne', label: 'Campagnes' },
            { label: 'Modifier-campagne' }
          ],
        },
      },
      {
        path: ':id/phoning',
        component: PhoningComponent,
        data: {
          filDArianne: [
            { url : 'espace-commercial/campagne', label: 'Campagnes' },
            { label: 'Phoning' }
          ],
        },
      },
      {
        path: ':id/phoning/:idClient',
        component: PhoningComponent,
        data: {
          filDArianne: [
            { url : 'espace-commercial/campagne', label: 'Campagnes' },
            { label: 'Phoning' }
          ],
        },
      }
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CampagnesRoutingModule {}
