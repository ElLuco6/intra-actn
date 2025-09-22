import {Component, EventEmitter, Inject, Input, OnInit, Output} from '@angular/core';
import {takeUntil} from "rxjs/operators";
import {CotationService} from "@services/cotation.service";
import {UserService} from "@services/user.service";
import {LicenceService} from "@services/licence.service";
import {Router} from "@angular/router";
import {ComponentsInteractionService} from "@services/components-interaction.service";
import {AuthenticationService} from "@services/authentication.service";
import {Subject} from "rxjs";
import {LogClientService} from "@services/log-client.service";
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from "@angular/material/dialog";
import {
  faBarcode, faBolt, faChartLine,
  faEuroSign,
  faFileInvoice, faHome, faNewspaper,
  faReceipt,
  faShoppingCart,
  faSignOutAlt, faTag, faTruck, faUndo,
  faUser, faUserCog, faUserFriends, faWrench, faCalendarAlt, faFolderBlank, faCampground, faChartSimple,faCoins, faEarthEurope
} from "@fortawesome/free-solid-svg-icons";
import {faDochub} from "@fortawesome/free-brands-svg-icons";


@Component({
  selector: 'app-side-nav-client',
  templateUrl: './side-nav-client.component.html',
  styleUrls: ['./side-nav-client.component.scss']
})
export class SideNavClientComponent implements OnInit {
  @Input() currentMenu = '';
  @Output() currentMenuChange = new EventEmitter<string>();
  /**
   * Event de connection pour recharger les ressources du header
   */
  @Output() EventLog = new EventEmitter<void>();

  /**
   * True si le panneau doit resté ouvert.
   */
  locked = false;
  menuRMA = false;

  interactionServiceSub;
  showPopupCom: boolean = false;

  userID = '';
  showPopup: boolean = false;

  private _destroy$ = new Subject<void>();

  constructor(
    public authServiceClient: LogClientService,
    public componentsInteractionService: ComponentsInteractionService,
    public licenceService: LicenceService,
    public cotationService: CotationService,
    public userService: UserService,
    public dialog: MatDialog,
    public authCom: AuthenticationService
  ) { }

  /**
   * Fermer le panneau de navigation latéral. Fermeture bloquée si locked est à true.
   */
  close(): void {
    this.currentMenuChange.next(this.locked ? this.currentMenu : '');
    this.menuRMA = false;
  }
  show(): void {
		this.menuRMA = !this.menuRMA;
	}

  logOut(): void {
    this.authServiceClient.logClientOut().subscribe();
    this.close();
    this.EventLog.emit();
  }

  ngOnInit(): void {
    // Subscription sur l'évenement "onOpenSideNav" pouvant être déclenché par des composants distants.
    this.interactionServiceSub = this.componentsInteractionService.sideNavigationLine.onOpenSideNav$
      .pipe(takeUntil(this._destroy$))
      .subscribe(selectedMenu => {
        if (selectedMenu == 'toggleEspaceClient') {
          if (this.currentMenu == 'espaceClient') { selectedMenu = ''; }
          else { selectedMenu = 'espaceClient'; }
        }

        if (selectedMenu == 'toggleEspaceCommercial') {
          if (this.currentMenu == 'espaceCommercial') { selectedMenu = ''; }
          else { selectedMenu = 'espaceCommercial'; }
        }
        this.currentMenuChange.next(selectedMenu);
      });
    this.authServiceClient._currentCient$
      .pipe(takeUntil(this._destroy$))
      .subscribe(user => {
        if (user) {
          this.userID = user.id.toString().replace(/^0*/g, '');
        } else {
          this.userID = '';
        }
      });
  }

  ngOnDestroy(): void {
    this.interactionServiceSub.unsubscribe();
    this._destroy$.next();
    this._destroy$.complete();
  }

  logOutComm(){
    this.authCom.logOut().subscribe(() => window.location.reload(), (error) => console.log(error));
  }

  protected readonly faUser = faUser;
  protected readonly faSignOutAlt = faSignOutAlt;
  protected readonly faShoppingCart = faShoppingCart;
  protected readonly faFileInvoice = faFileInvoice;
  protected readonly faReceipt = faReceipt;
  protected readonly faEuroSign = faEuroSign;
  protected readonly faUndo = faUndo;
  protected readonly faWrench = faWrench;
  protected readonly faTag = faTag;
  protected readonly faBarcode = faBarcode;
  protected readonly faUserCog = faUserCog;
  protected readonly faChartLine = faChartLine;
  protected readonly faHome = faHome;
  protected readonly faTruck = faTruck;
  protected readonly faNewspaper = faNewspaper;
  protected readonly faUserFriends = faUserFriends;
  protected readonly faBolt = faBolt;
  protected readonly faCalendarAlt = faCalendarAlt;
  protected readonly faFolderBlank = faFolderBlank;
  protected readonly faCampground = faCampground;
  protected readonly faChartSimple = faChartSimple;
  protected readonly faCoins = faCoins;
  protected readonly faEarthEurope = faEarthEurope;
}
