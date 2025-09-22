import { NgModule } from '@angular/core';
import {MetiersComponent} from "@components/catalogue/metiers/metiers.component";
import {NosMarquesComponent} from "@components/catalogue/nos-marques/nos-marques.component";
import {CatalogueComponent} from "@components/catalogue/catalogue.component";
import {CatalogueRoutingModule} from "@components/catalogue/catalogue-routing.module";
import {SharedModule} from "primeng/api";
import {ClipboardModule} from "@angular/cdk/clipboard";
import {ProduitCatComponent} from "@components/catalogue/produit-cat/produit-cat.component";
import {
  AsyncPipe, CommonModule,
  CurrencyPipe, DatePipe,
  DecimalPipe,
  KeyValuePipe,
  NgClass,
  NgForOf,
  NgIf,
  NgTemplateOutlet
} from "@angular/common";
import {MatIconModule} from "@angular/material/icon";
import {FontAwesomeModule} from "@fortawesome/angular-fontawesome";
import {MatInputModule} from "@angular/material/input";
import {MatSelectModule} from "@angular/material/select";
import {ReactiveFormsModule} from "@angular/forms";
import {ComplementaireModule} from "@_complementaire/complementaire.module";
import {BanniereComponent} from "@components/banniere/banniere.component";
import {UtilModule} from "@components/_util/util.module";
import {MatTableModule} from "@angular/material/table";
import {CategorieComponent} from "@components/catalogue/categorie/categorie.component";
import {EspaceCommercialModule} from "@components/espace-commercial/espace-commercial.module";
import {ProduitDetailService} from "@services/produit-detail.service";
import {ClientProspectFournisseurPipe} from "@components/_util/pipe/client-campapgne.pipe";


@NgModule({
    declarations: [
        CatalogueComponent,
        NosMarquesComponent,
        MetiersComponent,
        ProduitCatComponent,
      CategorieComponent
    ],
    imports: [
        CatalogueRoutingModule, // import routing
        SharedModule,
        CommonModule,
        ClipboardModule,
        NgClass,
        MatIconModule,
        AsyncPipe,
        FontAwesomeModule,
        MatInputModule,
        MatSelectModule,
        ReactiveFormsModule,
        KeyValuePipe,
        ComplementaireModule,
        DecimalPipe,
        CurrencyPipe,
        UtilModule,
        MatTableModule,
        DatePipe,
        EspaceCommercialModule,
        ClientProspectFournisseurPipe
    ]
})
export class CatalogueModule { }
