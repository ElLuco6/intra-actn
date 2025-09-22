import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AboutClientComponent } from './about-client.component';

const routes: Routes = [
  //{path:'',component: AboutClientComponent},
  {path:':id',component: AboutClientComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AboutClientRoutingModule { }
