import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SuiviCAComponent } from './suivi-ca/suivi-ca.component';
import { CaJournalierComponent } from './ca-journalier/ca-journalier.component';
import { CaJournalierDetailsComponent } from './ca-journalier-details/ca-journalier-details.component';
import { SuiviObjectifsComponent } from './suivi-objectifs/suivi-objectifs.component';


const routes: Routes = [
  {
    path: '',
    component: SuiviObjectifsComponent,
    data: {
      filDArianne: [{label: 'Suivi objectifs'}]
    }
  },
  {
    path: 'suivi-objectifs',
    component: SuiviObjectifsComponent,
    data: {
      filDArianne: [{label: 'Suivi objectifs'}]
    }
  },
  {
    path: 'suivi-ca',
    component: SuiviCAComponent,
    data: {
      filDArianne: [{label: 'Suivi CA'}]
    },
  },
  {
      path: 'ca-journalier',
      component: CaJournalierComponent,
      data: {
        filDArianne: [{label: 'CA Journalier'}]
      },
    },
    {
      path: 'ca-journalier/:region',
      component: CaJournalierDetailsComponent,
      data: {
        filDArianne: [{url : 'espace-commercial/ca-journalier', label: 'CA Journalier'},
          {url :':region' , label: 'CA Journalier Details' }]
      },
    }

  ]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GraphRoutingModule { }
