import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AddFormComponent } from './add-form/add-form.component';
import { EditFormComponent } from './edit-form/edit-form.component';
import { AbonnementsComponent } from './abonnements.component';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: AbonnementsComponent,
    data: {
      filDArianne: [{ url: 'abonnements', label: '' }]
    }
  },
  {
    path: 'ajouter-utilisateur',
    component: AddFormComponent,
    data: {
      filDArianne: [{ url: 'abonnements', label: 'Abonnements' }]
    }
  },
  {
    path: 'editer-utilisateur/:id/:step',
    component: EditFormComponent,
    data: {
      filDArianne: [{ url: 'abonnements', label: 'Abonnements' }]
    }
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AbonnementsRoutingModule { }
