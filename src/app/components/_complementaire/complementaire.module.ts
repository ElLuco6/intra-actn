import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MapFiltreComponent} from './map-filtre/map-filtre.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MaterialModule} from './material/material.module';
import {NotFoundComponent} from './not-found/not-found.component';
import {SpinnerComponent} from './spinner/spinner.component';
import {TitleWLineComponent} from './title-w-line/title-w-line.component';
import {FontAwesomeModule} from "@fortawesome/angular-fontawesome";
import {CircleDiagramComponent} from './circle-diagram/circle-diagram.component';
import {NgApexchartsModule} from "ng-apexcharts";
import {RechercheToutComponent} from './recherche-tout/recherche-tout.component';
import {RechercheComponent} from "../recherche/recherche.component";
import {ActuComponent} from './actu/actu.component';
import {MatCardModule} from "@angular/material/card";
import {ButtonModule} from 'primeng/button';
import {CarouselModule} from "primeng/carousel";
import {ToastModule} from 'primeng/toast';
import {RippleModule} from "primeng/ripple";
import {InputNumberComponent} from './input-number/input-number.component';
import {TooltipComponent} from './tooltip/tooltip.component';
import {AngularSvgIconModule} from "angular-svg-icon";
import {ComparateurButtonComponent} from './comparateur-button/comparateur-button.component';
import {FavorisButtonComponent} from './favoris-button/favoris-button.component';
import {ShareComponent} from './share/share.component';
import {InfiniteScrollModule} from "ngx-infinite-scroll";
import {ProduitPreviewComponent} from './produit-preview/produit-preview.component';
import {RouterLink, RouterLinkActive, RouterModule} from "@angular/router";
import {ClientPreviewComponent} from './client-preview/client-preview.component';
import {ChipsComponent} from './chips/chips.component';
import {SlidingListeComponent} from './sliding-liste/sliding-liste.component';
import {BackToTopComponent} from './back-to-top/back-to-top.component';
import {CommandeDetailComponent} from './commande-detail/commande-detail.component';
import {MatTableModule} from "@angular/material/table";
import {MatMenuModule} from "@angular/material/menu";
import {ProduitsComponent} from './produits/produits.component';
import {BanniereComponent} from './banniere/banniere.component';
import {NewSpinnerComponent} from './new-spinner/new-spinner.component';
import {ImgFallbackDirective} from "@/directives/img-fallback.directive";
import {PdfIconComponent} from './pdf-icon/pdf-icon.component';
import {ChipsListComponent} from "@_complementaire/chips-list/chips-list.component";
import {UtilModule} from "@components/_util/util.module";
import {YoutubeComponent, SafePipe} from './youtube/youtube.component';
import {CookiesComponent} from './cookies/cookies.component';
import {SideNavClientComponent} from './side-nav-client/side-nav-client.component';
import {MatSidenavModule} from "@angular/material/sidenav";
import {LogClientComponent} from "@components/log-client/log-client.component";
import {AddToCartFormComponent} from './add-to-cart-form/add-to-cart-form.component';
import {DigitOnlyModule} from "@uiowa/digit-only";
import {BarClientComponent} from './bar-client/bar-client.component';
import {RollingHeaderComponent} from './rolling-header/rolling-header.component';
import {MatDialogModule} from "@angular/material/dialog";
import {MatNativeDateModule} from '@angular/material/core';
import {WhatsNewComponent} from './whats-new/whats-new.component';
import {CircleGraphComponent} from './circle-graph/circle-graph.component';
import {LineGraphComponent} from './line-graph/line-graph.component';
import {BandeauClientComponent} from './bandeau-client/bandeau-client.component';
import {ListUsersContactsComponent} from './list-users-contacts/list-users-contacts.component';
import {MatSortModule} from "@angular/material/sort";
import {FilterComponent} from "@_complementaire/filter/filter.component";
import {FilterPipe} from "@components/_util/pipe/filter.pipe";

@NgModule({
  declarations: [
    MapFiltreComponent,
    NotFoundComponent,
    SpinnerComponent,
    TitleWLineComponent,
    CircleDiagramComponent,
    RechercheToutComponent,
    ActuComponent,
    InputNumberComponent,
    TooltipComponent,
    ComparateurButtonComponent,
    FavorisButtonComponent,
    ShareComponent,
    ProduitPreviewComponent,
    ClientPreviewComponent,
    ChipsComponent,
    SlidingListeComponent,
    BackToTopComponent,
    CommandeDetailComponent,
    ProduitsComponent,
    BanniereComponent,
    NewSpinnerComponent,
    ImgFallbackDirective,
    PdfIconComponent,
    ChipsListComponent,
    YoutubeComponent,
    SafePipe,
    CookiesComponent,
    SideNavClientComponent,
    LogClientComponent,
    AddToCartFormComponent,
    BarClientComponent,
    RollingHeaderComponent,
    WhatsNewComponent,
    CircleGraphComponent,
    LineGraphComponent,
    BandeauClientComponent,
    ListUsersContactsComponent,
    FilterComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    FontAwesomeModule,
    NgApexchartsModule,
    MatCardModule,
    CarouselModule,
    ButtonModule,
    ToastModule,
    RippleModule,
    AngularSvgIconModule,
    InfiniteScrollModule,
    RouterLink,
    RouterLink,
    MatTableModule,
    MatMenuModule,
    RouterLinkActive,
    UtilModule,
    MatSidenavModule,
    DigitOnlyModule,
    MatDialogModule,
    MatNativeDateModule,
    MatSortModule,
    FilterPipe,
  ],
  exports: [
    MapFiltreComponent,
    MaterialModule,
    SpinnerComponent,
    TitleWLineComponent,
    CircleDiagramComponent,
    RechercheToutComponent,
    ActuComponent,
    ProduitPreviewComponent,
    ClientPreviewComponent,
    ChipsComponent,
    SlidingListeComponent,
    BackToTopComponent,
    ProduitsComponent,
    NewSpinnerComponent,
    ChipsListComponent,
    TooltipComponent,
    ComparateurButtonComponent,
    FavorisButtonComponent,
    ShareComponent,
    SafePipe,
    YoutubeComponent,
    CookiesComponent,
    SideNavClientComponent,
    AddToCartFormComponent,
    InputNumberComponent,
    ImgFallbackDirective,
    BarClientComponent,
    RollingHeaderComponent,
    CircleGraphComponent,
    LineGraphComponent,
    BandeauClientComponent,
    ListUsersContactsComponent,
    FilterComponent
  ],
  providers: [
    CircleDiagramComponent,
    RechercheComponent
  ]
})
export class ComplementaireModule {
}
