import { NgModule } from '@angular/core';
import {PreloadAllModules, RouterModule, Routes} from '@angular/router';
import { NotFoundComponent } from '@components/_complementaire/not-found/not-found.component';
import {ClientsComponent} from "@components/clients/clients.component";
import {AboutClientComponent} from "@components/about-client/about-client.component";
import {LoginComponent} from "@components/login/login.component";
import {MapComponent} from "@components/map/map.component";
import {AccueilComponent} from "@components/accueil/accueil.component";
import {RechercheComponent} from "@components/recherche/recherche.component";
import {ClientDetailComponent} from "@components/client-detail/client-detail.component";
import {CommandeDetailComponent} from "@components/_complementaire/commande-detail/commande-detail.component";
import {FavorisComponent} from "@components/favoris/favoris.component";
import {LogClientComponent} from "@components/log-client/log-client.component";
import {ComparateurComponent} from "@components/comparateur/comparateur.component";
import {OutilsComponent} from "@/components/outils/outils.component";
import {WhatsNewComponent} from "@_complementaire/whats-new/whats-new.component";
import {GrilleTarifMarqueComponent} from "@components/grille-tarif-marque/grille-tarif-marque.component";
import {FinanceComponent} from "@components/finance/finance.component";


const routes: Routes = [
  {
    path: 'grille-tarif/:marque',
    component: GrilleTarifMarqueComponent
  },
  {
    path: 'finance/:id',
    component: FinanceComponent
  },
  {
    path: 'nouveautes',
    component: WhatsNewComponent
  },
  {
    path: 'outils',
    component: OutilsComponent,
    data: {
      filDArianne: [{ url: 'outils', label: 'Outils', guarded: true }]
    }
  },
  {
    path: 'comparateur',
    component: ComparateurComponent,
    data: {
      filDArianne: [{ url: 'comparateur', label: 'Comparateur', guarded: true }]
    }

  },
  {
    path: 'espace-client',
    loadChildren: () =>
      import('@components/espace-client/espace-client.module').then(
        (mod) => mod.EspaceClientModule
      ),
  },
  {
    path: 'espace-commercial',
    loadChildren: () =>
      import('@components/espace-commercial/espace-commercial.module').then(
        (mod) => mod.EspaceCommercialModule
      ),
  },
  {
    path: 'abonnements',
    loadChildren: () =>
      import('@components/abonnements/abonnements.module').then(
        (mod) => mod.AbonnementsModule
      ),
  },
  {
    path: 'panier',
    loadChildren: () =>
      import('@components/panier/panier.module').then(
        (mod) => mod.PanierModule
      ),
  },
  {
    path: 'log-client',
    component: LogClientComponent
  },
  {
    path: 'favoris',
    component: FavorisComponent,
    data: {
      filDArianne: [{ url: 'favoris', label: 'Favoris', guarded: true }]
    }
  },
  {
    path: 'commande-detail',
    component: CommandeDetailComponent,
    data: {
      filDArianne: [{ url: 'commande-detail', label: 'Detail commande', guarded: true }]
    }
  },
  {
    path: 'catalogue',
    loadChildren: () => import('@components/catalogue/catalogue.module').then((mod) => mod.CatalogueModule)
  },
  {
    path: 'client-detail/:client',
    component: ClientDetailComponent
  },
  {
    path: 'client-detail/:client/:display',
    component: ClientDetailComponent
  },
  {
    path: 'clients',
    component: ClientsComponent,
    data: {
      filDArianne: [{ url: 'clients', label: 'Liste des clients & prospects', guarded: true }]
    }
  },
  {
    path: 'recherche',
    component: RechercheComponent
  },
  {
    path: 'incidents',
    loadChildren: () => import('@components/incidents/incidents.module').then((mod) => mod.IncidentsModule)
  },
  {
    path: 'about-client',
    component: AboutClientComponent
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'map',
    component: MapComponent
  },
  {
    path: '',
    component: AccueilComponent,
    data: {
      breadcrumb: 'Accueil'
    },
  },
  {
    path: '**',
    component: NotFoundComponent
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes,
      {
        preloadingStrategy: PreloadAllModules,
        useHash: false,
        anchorScrolling: 'enabled',
        onSameUrlNavigation: 'reload',
        enableTracing: false,
        initialNavigation: 'enabledNonBlocking'
      })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
