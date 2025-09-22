import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {IncidentsComponent} from "@components/incidents/incidents.component";
import {ClientsBloquesComponent} from "@components/incidents/clients-bloques/clients-bloques.component";
import {CommandesBloquesComponent} from "@components/incidents/commandes-bloques/commandes-bloques.component";
import {RmaBloqueComponent} from "@components/incidents/rma-bloque/rma-bloque.component";


const routes: Routes = [
  {
    path: '',
    component: IncidentsComponent,
    children: [
      {
        path: 'clients-bloques',
        component: ClientsBloquesComponent
      },
      {
        path: 'commandes-bloques',
        component: CommandesBloquesComponent
      },
      {
        path: 'rma',
        component: RmaBloqueComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class IncidentsRoutingModule { }
