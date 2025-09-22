import { Component, OnInit } from '@angular/core';
import {take} from "rxjs/operators";
import {ActivatedRoute} from "@angular/router";
import {CartService} from "@services/cart.service";
import {TempCartService} from "@services/temp-cart.service";
import {LicenceService} from "@services/licence.service";

@Component({
  selector: 'app-confirmation-panier',
  templateUrl: './confirmation-panier.component.html',
  styleUrls: ['./confirmation-panier.component.scss']
})
export class ConfirmationPanierComponent implements OnInit {


  ncmd = 0;
  ticket = 0;
  transaction = '';
  validCommande;

  carttype: string = "perm";

  cartService: CartService = null;

  constructor(
    private route: ActivatedRoute,
    public permCartService: CartService,
    public tempCartService: TempCartService,
    public licenceService: LicenceService
  ) {
    // on regarde dans quel type de panier il faut récupérer les données de la commande réussie.
    this.route.queryParams.pipe(take(1)).subscribe((params) => {
      this.carttype = params['carttype'];
    });
    if (this.carttype == "temp") {
      this.cartService = tempCartService;
    } else {
      this.cartService = permCartService;
    }

    this.cartService.emptyCart();
    this.validCommande = this.cartService.getValidCommande();

    if (this.validCommande?.transaction == null) {
      this.route.queryParams.pipe(take(1)).subscribe((params) => {
        this.ncmd = params['ncde'];
        this.ticket = params['ticket'];
        this.transaction = params['transaction'];
      });
    } else {
      this.ncmd = this.validCommande.ncmd;
      this.ticket = this.validCommande.ticket;
      this.transaction = this.validCommande.transaction;
    }

    if (this.ncmd != null) {
      this.licenceService.majEnduser().subscribe();
    }
  }

  ngOnInit() { }

  ngOnDestroy() {
    this.cartService.eraseValidCommande();
  }

}
