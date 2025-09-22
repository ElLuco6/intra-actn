import {AfterViewInit, Component, EventEmitter, NgZone, OnDestroy, OnInit, Output} from '@angular/core';
import {FormBuilder} from "@angular/forms";
import {AdresseService} from "@services/adresse.service";
import {ProduitService} from "@services/produit.service";
import {WindowService} from "@services/window.service";
import {ActivatedRoute, Router} from "@angular/router";
import {SortAndFilterService} from "@services/sort-and-filter.service";
import {ContratsComponent} from "@components/espace-client/contrats/contrats.component";
import {LicenceCommandesService} from "@services/licence-commandes.service";
import {
  faBell,
  faBellSlash,
  faCheckCircle, faHistory,
  faMinusCircle,
  faPenSquare,
  faPlusCircle,
  faTimesCircle
} from "@fortawesome/free-solid-svg-icons";
import {LogClientService} from "@services/log-client.service";

@Component({
  selector: 'app-contrats-commandes',
  templateUrl: './contrats-commandes.component.html',
  styleUrls: ['../contrats.component.scss', './contrats-commandes.component.scss']
})
export class ContratsCommandesComponent extends ContratsComponent implements OnInit, OnDestroy, AfterViewInit {

  @Output() public selectedTabIndexChange = new EventEmitter<number>();

  constructor(
    public override licenceService: LicenceCommandesService,
    public override produitService: ProduitService,
    protected override fb: FormBuilder,
    protected override router: Router,
    protected override activatedRoute: ActivatedRoute,
    public override adresseService: AdresseService,
    protected override ngZone: NgZone,
    protected override window: WindowService,
    protected override saf: SortAndFilterService,
    protected override authClient: LogClientService
  ) {
    super(licenceService, produitService, fb, router, activatedRoute, adresseService, ngZone, window, saf, authClient);
    this._pageID = 'licence-commande';
  }

  protected override readonly faPenSquare = faPenSquare;
  protected override readonly faCheckCircle = faCheckCircle;
  protected override readonly faTimesCircle = faTimesCircle;
  protected override readonly faPlusCircle = faPlusCircle;
  protected override readonly faMinusCircle = faMinusCircle;
  protected override readonly faHistory = faHistory;
  protected override readonly faBellSlash = faBellSlash;
  protected override readonly faBell = faBell;
}

