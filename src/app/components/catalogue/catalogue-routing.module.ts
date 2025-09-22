import { Routes, RouterModule } from '@angular/router';
import { CatalogueComponent } from './catalogue.component';
import { CatalogueResolverService } from "@services/catalogue-resolver-service.service";
import { NouveautesResolverService } from "@services/nouveautes-resolver-service.service";
import { DestockageResolverService } from "@services/destockage-resolver-service.service";
import { SecondeVieResolverService } from "@services/seconde-vie-resolver-service.service";
import { PacksResolverService } from "@services/packs-resolver-service.service";
import { PromosResolverService } from "@services/promos-resolver-service.service";
import { ProduitResolverService } from './produit-cat/produit-resolver.service';
import { NgModule } from '@angular/core';
import { ProduitCatComponent } from './produit-cat/produit-cat.component';
import { CategorieComponent } from "./categorie/categorie.component";
import { NosMarquesComponent } from './nos-marques/nos-marques.component';
import { MetiersComponent } from './metiers/metiers.component';

const routes: Routes = [
  // default route of the module
  {
    path: '',
    pathMatch: 'full',
    component: CategorieComponent,
    data: {
      filDArianne: [
        { url: 'catalogue', label: 'Catalogue' },
      ]
    }
  },
  {
    path: 'search',
    component: CatalogueComponent,
    resolve: {
      currentCatalogueState: CatalogueResolverService
    },
    runGuardsAndResolvers: 'always',
    data: {
      filDArianne: [
        { url: 'catalogue', label: 'Catalogue' },
        { url: '?search', label: 'Recherche' },
        // { url: '?search', label: 'Recherche "?"' },
        { url: '?niv1', label: 'Métier "?"' },
        { url: '?marque', label: 'Marque "?"' }
      ]
    }
  },
  {
    path: 'fiche-produit/:ref',
    component: ProduitCatComponent,
    data: {
      filDArianne: [
        { url: 'fiche-produit', label: 'Fiche produit' },
        { url: ':ref', label: '' },
      ]
    }
  },
  {
    path: 'nouveautes',
    component: CatalogueComponent,
    resolve: {
      currentCatalogueState: NouveautesResolverService
    },
    runGuardsAndResolvers: 'always',
    data: {
      filDArianne: [
        { url: 'catalogue', label: 'Catalogue' },
        { url: 'nouveautes', label: 'Nouveautés' },
      ]
    }
  },
  {
    path: 'destockage',
    component: CatalogueComponent,
    resolve: {
      currentCatalogueState: DestockageResolverService
    },
    runGuardsAndResolvers: 'always',
    data: {
      filDArianne: [
        { url: 'catalogue', label: 'Catalogue' },
        { url: 'destockage', label: 'Destockage' },
      ]
    }
  },
  {
    path: 'seconde-vie',
    component: CatalogueComponent,
    resolve: {
      currentCatalogueState: SecondeVieResolverService
    },
    runGuardsAndResolvers: 'always',
    data: {
      filDArianne: [
        { url: 'catalogue', label: 'Catalogue' },
        { url: 'seconde-vie', label: 'Seconde vie' },
      ]
    }
  },
  {
    path: 'packs',
    component: CatalogueComponent,
    resolve: {
      currentCatalogueState: PacksResolverService
    },
    runGuardsAndResolvers: 'always',
    data: {
      filDArianne: [
        { url: 'catalogue', label: 'Catalogue' },
        { url: 'packs', label: 'Packs' },
      ]
    }
  },
  {
    path: 'promotions',
    component: CatalogueComponent,
    resolve: {
      currentCatalogueState: PromosResolverService
    },
    runGuardsAndResolvers: 'always',
    data: {
      filDArianne: [
        { url: 'catalogue', label: 'Catalogue' },
        { url: 'promotions', label: 'Promotions' },
      ]
    }
  },
  {
    path: 'nos-marques',
    component: NosMarquesComponent,
    data: {
      filDArianne: [
        { url: 'catalogue', label: 'Catalogue' },
        { url: 'nos-marques', label: 'Nos marques' },
      ]
    }
  },
  {
    path: 'metiers',
    component: MetiersComponent,
    data: {
      filDArianne: [
        { url: 'catalogue', label: 'Catalogue' },
        { url: 'nos-metiers', label: 'Nos Métiers' },
      ]
    }
  },
  {
    path: ':niv1',
    component: CategorieComponent,
    data: {
      filDArianne: [
        { url: 'catalogue', label: 'Catalogue' },
        { url: ':niv1', label: '' },
      ]
    }
  },
  {
    path: ':niv1/:niv2',
    component: CategorieComponent,
    runGuardsAndResolvers: 'always',
    data: {
      filDArianne: [
        { url: 'catalogue', label: 'Catalogue' },
        { url: ':niv1', label: '' },
        { url: ':niv2', label: '' },
      ]
    }
  },
  //Au cas ou la categorie n'a pas de niveau 3, lancer la recherche de produit
  {
    path: ':niv1/:niv2/unique',
    component: CatalogueComponent,
    resolve: {
      currentCatalogueState: CatalogueResolverService
    },
    runGuardsAndResolvers: 'always',
    data: {
      filDArianne: [
        { url: 'catalogue', label: 'Catalogue' },
        { url: ':niv1', label: '' },
        { url: ':niv2', label: '' },
        { url: '?search', label: 'Recherche "?"' },
        { url: '?marque', label: 'Marque "?"' }
      ]
    }
  },
  {
    path: ':niv1/:niv2/:niv3',
    component: CatalogueComponent,
    resolve: {
      currentCatalogueState: CatalogueResolverService
    },
    runGuardsAndResolvers: 'always',
    data: {
      filDArianne: [
        { url: 'catalogue', label: 'Catalogue' },
        { url: ':niv1', label: '' },
        { url: ':niv2', label: '' },
        { url: ':niv3', label: '' },
        { url: '?search', label: 'Recherche "?"' },
        { url: '?marque', label: 'Marque "?"' }
      ]
    }
  },
  {
    path: ':niv1/:niv2/:niv3/:ref',
    component: ProduitCatComponent,
    resolve: {
      produit: ProduitResolverService
    },
    runGuardsAndResolvers: 'always',
    data: {
      filDArianne: [
        { url: 'catalogue', label: 'Catalogue' },
        { url: ':niv1', label: '' },
        { url: ':niv2', label: '' },
        { url: ':niv3', label: '' },
        { url: ':ref', label: '' },
      ]
    }
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CatalogueRoutingModule { }
