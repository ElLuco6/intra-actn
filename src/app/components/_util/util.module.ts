import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { library } from '@fortawesome/fontawesome-svg-core';
import {
  faBolt,
  faUserFriends,
  faCopy,
  faBars,
  faCartPlus,
  faShoppingCart,
  faUser,
  faSearch,
  faCogs,
  faUsersCog,
  faCloud,
  faMoneyCheck,
  faUndo,
  faFileInvoice,
  faWrench,
  faNewspaper,
  faFilePdf,
  faTruck,
  faReceipt,
  faPhone,
  faArrowRight,
  faCaretDown,
  faBalanceScaleLeft,
  faChevronRight,
  faChevronUp,
  faChevronDown,
  faThList,
  faThLarge,
  faArrowLeft,
  faSignOutAlt,
  faKey,
  faHome,
  faQuestionCircle,
  faPlusCircle,
  faMinusCircle,
  faExclamationTriangle,
  faTimesCircle,
  faCalendarAlt,
  faTimes,
  faSave,
  faTag,
  faHistory,
  faShareAlt,
  faEnvelope,
  faClipboard,
  faHeart,
  faBookmark,
  faBell,
  faBellSlash,
  faStar,
  faPenSquare,
  faCheckCircle,
  faSlidersH,
  faRedoAlt,
  faTrash,
  faPen,
  faCheck,
  faPaperPlane,
  faChartLine,
  faProjectDiagram,
  faPlayCircle,
  faPlus,
  faMinus,
  faInfoCircle,
  faDollarSign,
  faCalculator,
  faEuroSign,
  faUpload,
  faCommentDots,
  faClipboardList,
  faCalendar,
  faClone,
  faHeadset,
  faIdCard,
  faUserTie,
  faBarcode,
  faTicketAlt,
  faCircle,
  faChartPie,
  faTable,
  faInfo,
  faCoins,
  faChartSimple,
  faEarthEurope
} from '@fortawesome/free-solid-svg-icons';

import {
  faHeart as farHeart,
  faBookmark as farBookmark,
  faStar as farStar,
  faQuestionCircle as farQuestionCircle,
  faTimesCircle as farTimesCircle,
  faNewspaper as faNewsPaper
} from '@fortawesome/free-regular-svg-icons';

import {
  faFacebookSquare,
  faTwitterSquare
} from '@fortawesome/free-brands-svg-icons';
import {MatInputModule} from "@angular/material/input";
import {MatSelectModule} from "@angular/material/select";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import { EnduserFormComponent } from './components/enduser-form/enduser-form.component';
import {MatAutocompleteModule} from "@angular/material/autocomplete";
import { TabSortComponent } from './components/tab-sort/tab-sort.component';
import { CotationRowComponent } from './components/cotation-row/cotation-row.component';
import {MatCheckboxModule} from "@angular/material/checkbox";
import {StylePaginatorDirective} from "@components/_util/directives/style-paginator.directive";
import {AddClassOnChangeDirective} from "@components/_util/directives/add-class-on-change.directive";
import {ExposeHeightSetterDirective} from "@components/_util/directives/expose-height-setter.directive";
import { AnimatedBoxComponent } from './components/animated-box/animated-box.component';
import { MatNativeDateModule } from '@angular/material/core';
import {RouterLink} from "@angular/router";
import { TruncatePipe } from './pipe/truncate.pipe';
import { SnackbarComponent } from './components/snackbar/snackbar.component';
import {FontAwesomeModule} from "@fortawesome/angular-fontawesome";
import { MoulaPipePipe } from './pipe/moula-pipe.pipe';
import { ZerosPipe } from './pipe/zero.pipe';
import { UploadDirective } from './directives/upload.directive';
import { PaginatorPipe } from './pipe/paginator.pipe';
import { HighlightSearchPipe } from './pipe/highlight-search.pipe';
import { EricdateFormatPipe } from './pipe/ericdate-format.pipe';
import {
  ConfirmationDeleteDialogComponent
} from "@components/_util/components/confirmation-delete-dialog/confirmation-delete-dialog.component";
import {MatButton} from "@angular/material/button";
import {MatDialogActions, MatDialogClose, MatDialogContent, MatDialogTitle} from "@angular/material/dialog";
import {CampaignDialogComponent} from "@components/_util/components/campaign-dialog/campaign-dialog.component";


@NgModule({
  declarations: [
    EnduserFormComponent,
    TabSortComponent,
    CotationRowComponent,
    StylePaginatorDirective,
    AddClassOnChangeDirective,
    ExposeHeightSetterDirective,
    AnimatedBoxComponent,
    TruncatePipe,
    SnackbarComponent,
    MoulaPipePipe,
    ZerosPipe,
    UploadDirective,
    PaginatorPipe,
    HighlightSearchPipe,
    EricdateFormatPipe,
    ConfirmationDeleteDialogComponent,
    CampaignDialogComponent
  ],
  imports: [
    CommonModule,
    AngularSvgIconModule,
    MatInputModule,
    MatSelectModule,
    FormsModule,
    ReactiveFormsModule,
    MatAutocompleteModule,
    MatCheckboxModule,
    MatNativeDateModule,
    RouterLink,
    FontAwesomeModule,
    MatButton,
    MatDialogActions,
    MatDialogContent,
    MatDialogTitle,
    MatDialogClose,
    
  ],
  exports: [
    EnduserFormComponent,
    TabSortComponent,
    CotationRowComponent,
    StylePaginatorDirective,
    AddClassOnChangeDirective,
    ExposeHeightSetterDirective,
    AnimatedBoxComponent,
    TruncatePipe,
    MoulaPipePipe,
    SnackbarComponent,
    ZerosPipe,
    UploadDirective,
    PaginatorPipe,
    HighlightSearchPipe,
    EricdateFormatPipe,
    
  ]
})
export class UtilModule {
  constructor() {
    // Add an icon to the library for convenient access in other components
    // Permet d'appeler ces icons fontawesome dans les fichiers HTML.
    // Supprimer les icones non nécessaires avant mise en production.
    library.add(faCopy);
    library.add(faBolt);
    library.add(faUserFriends);
    library.add(faInfo);
    library.add(faBars);
    library.add(faHeart);
    library.add(farHeart);
    library.add(faBookmark);
    library.add(farBookmark);
    library.add(faCartPlus);
    library.add(faShoppingCart);
    library.add(faUser);
    library.add(faSearch);
    library.add(faCogs);
    library.add(faUsersCog);
    library.add(faCloud);
    library.add(faMoneyCheck);
    library.add(faUndo);
    library.add(faFileInvoice);
    library.add(faWrench);
    library.add(faNewspaper);
    library.add(faFilePdf);
    library.add(faTruck);
    library.add(faReceipt);
    library.add(faPhone);
    library.add(faArrowRight);
    library.add(faArrowLeft);
    library.add(faCaretDown);
    library.add(faBalanceScaleLeft);
    library.add(faChevronRight);
    library.add(faChevronUp);
    library.add(faChevronDown);
    library.add(faThList);
    library.add(faThLarge);
    library.add(faSignOutAlt);
    library.add(faKey);
    library.add(faHome);
    library.add(faQuestionCircle);
    library.add(farQuestionCircle);
    library.add(faPlusCircle);
    library.add(faMinusCircle);
    library.add(faExclamationTriangle);
    library.add(faTimesCircle);
    library.add(faNewsPaper);
    library.add(faCalendarAlt);
    library.add(faTimes);
    library.add(faSave);
    library.add(faTag);
    library.add(faHistory);
    library.add(faShareAlt);
    library.add(faFacebookSquare);
    library.add(faTwitterSquare);
    library.add(faEnvelope);
    library.add(faClipboard);
    library.add(faBell);
    library.add(faBellSlash);
    library.add(faStar);
    library.add(faPenSquare);
    library.add(faCheckCircle);
    library.add(faTimesCircle);
    library.add(faSlidersH);
    library.add(farStar);
    library.add(faRedoAlt);
    library.add(faTrash);
    library.add(faPen);
    library.add(faCheck);
    library.add(faPaperPlane);
    library.add(faPlayCircle);
    library.add(farTimesCircle);
    library.add(faChartLine);
    library.add(faProjectDiagram);
    library.add(faPlus);
    library.add(faMinus);
    library.add(faInfoCircle);
    library.add(faDollarSign);
    library.add(faCalculator);
    library.add(faEuroSign);
    library.add(faUpload);
    library.add(faCommentDots);
    library.add(faClipboardList);
    library.add(faCalendar);
    library.add(faClone);
    library.add(faHeadset);
    library.add(faIdCard);
    library.add(faUserTie);
    library.add(faBarcode);
    library.add(faTicketAlt);
    library.add(faCircle);
    library.add(faChartPie);
    library.add(faTable);
    library.add(faCoins);
    library.add(faChartSimple);
    library.add(faEarthEurope);
  }
}
