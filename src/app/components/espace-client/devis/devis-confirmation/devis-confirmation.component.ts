import { Component, OnInit } from '@angular/core';
import {take} from "rxjs/operators";
import {ActivatedRoute} from "@angular/router";
import {TempCartService} from "@services/temp-cart.service";
import {LicenceService} from "@services/licence.service";

@Component({
  selector: 'app-devis-confirmation',
  templateUrl: './devis-confirmation.component.html',
  styleUrls: ['./devis-confirmation.component.scss']
})
export class DevisConfirmationComponent implements OnInit {

  ncmd = 0;
  ticket = 0;
  transaction = '';
  valideCommande;

  constructor(
    private route: ActivatedRoute,
    public cartService: TempCartService,
    public licenceService: LicenceService
  ) {
    this.cartService.emptyCart();
    this.valideCommande = this.cartService.getValidCommande();

    if (this.valideCommande?.transaction == null) {
      this.route.queryParams.pipe(take(1)).subscribe((params) => {
        this.ncmd = params['ncde'];
        this.ticket = params['ticket'];
        this.transaction = params['transaction'];
      });
    } else {
      this.ncmd = this.valideCommande.ncmd;
      this.ticket = this.valideCommande.ticket;
      this.transaction = this.valideCommande.transaction;
    }

    if (this.ncmd != null) {
      this.licenceService.majEnduser().subscribe();
    }
  }

  ngOnInit(): void { }

  ngOnDestroy(): void {
    this.cartService.eraseValidCommande();
  }

}
