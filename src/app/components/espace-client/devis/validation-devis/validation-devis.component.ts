import { Component, OnInit } from '@angular/core';
import {Adresse, CartItem, Produit} from "@/models";
import {BehaviorSubject} from "rxjs";
import {FormBuilder} from "@angular/forms";
import {UserService} from "@services/user.service";
import {ProduitService} from "@services/produit.service";
import {DomSanitizer} from "@angular/platform-browser";
import {ActivatedRoute, Router} from "@angular/router";
import {TempCartService} from "@services/temp-cart.service";
import {filter, take, takeUntil} from "rxjs/operators";
import {Devis} from "@services/devis.service";
import {TransportService} from "@services/transport.service";
import {HttpClient} from "@angular/common/http";
import {RmaService} from "@services/rma.service";
import {ComponentsInteractionService} from "@services/components-interaction.service";
import {AuthenticationService} from "@services/authentication.service";
import {LicenceService} from "@services/licence.service";
import {ValidationPanierComponent} from "@components/panier/validation-panier/validation-panier.component";
import {Client} from "@models/licence";
import {environment} from "@env/environment";
import {LogClientService} from "@services/log-client.service";
import {SnackbarService} from "@services/snackbar.service";
import {MatDialog} from "@angular/material/dialog";

@Component({
  selector: 'app-validation-devis',
  templateUrl: './validation-devis.component.html',
  styleUrls: ['./validation-devis.component.scss']
})
export class ValidationDevisComponent extends ValidationPanierComponent implements OnInit {

  public get ready(): number { return this._ready$.getValue(); }
  public set ready(value: number) { this._ready$.next(value); }

  public devis: Devis = null;
  public produits = new Array<CartItem>();

  private _ready$ = new BehaviorSubject<number>(0);

  constructor(
    public override authService: AuthenticationService,
    public override userService: UserService,
    public override componentsInteractionService: ComponentsInteractionService,
    protected override fb: FormBuilder,
    protected override sr: DomSanitizer,
    protected override http: HttpClient,
    protected override rmaService: RmaService,
    protected override licenceService: LicenceService,
    protected override router: Router,
    protected override route: ActivatedRoute,
    protected override tempCartService: TempCartService,
    protected override transportService: TransportService,
    protected produitService: ProduitService,
    protected override authClient: LogClientService,
    protected override snackBar: SnackbarService,
    protected override dialog: MatDialog
    // protected clipboard: Clipboard
  ) {
    super(tempCartService, tempCartService, authService, componentsInteractionService, userService, fb, sr, http, rmaService, transportService, router, licenceService, window, route, authClient, snackBar, dialog);
    this.cartService = tempCartService;
    // Récupère le devis à valider
    if (history.state.devis) {
      this.devis = history.state.devis;
      this.newEnduser = new Client();
      this.newEnduser.nom = this.devis.enduser.nom;
      this.newEnduser.adresse1 = this.devis.enduser.adresse1;
      this.newEnduser.adresse2 = this.devis.enduser.adresse2;
      this.newEnduser.ville = this.devis.enduser.ville;
      this.newEnduser.codepostal = this.devis.enduser.codepostal;
      this.newEnduser.pays = this.devis.enduser.payscode;
      this.newEnduser.telephone = this.devis.enduser.telephone;
      this.newEnduser.mail = this.devis.enduser.mail;
      this.cartService.clientFinal = this.newEnduser;
      if(this.newEnduser.adresse1 == null){

      }
    } else {
      this.router.navigate(['espace-client', 'devis']);
      return;
    }
  }

  override ngOnInit(): void
  {
    // Remplit un panier temporaire pour passer la commande
    this.cartService.emptyCart();

    this.produitService.getProduitsById(this.devis.produits.reduce((acc: Array<string>, value) => acc.concat(value.prod), []))
      .pipe(take(1), takeUntil(this._destroy$))
      .subscribe(produits => {

        this.devis.produits.forEach(produit => {
          let unProduit = produits.find(p => p.reference === produit.prod);
          if (unProduit) {
            unProduit.prixD3E = produit.prixd3e;
            unProduit.prix = produit.prixnet;
          } else {
            unProduit = new Produit();
            unProduit.marque = produit.marque;
            unProduit.marquelib = produit.marquelib;
            unProduit.photo = produit.prod;
            unProduit.reference = produit.prod;
            unProduit.designation = produit.designation;
            unProduit.prix = produit.prixnet;
            unProduit.prixD3E = produit.prixd3e;
          }
          const cartItem = new CartItem();
          cartItem.produit = unProduit;
          cartItem.qte = produit.quantitecommande;
          this.produits.push(cartItem);
          this.cartService.addProduit(unProduit, produit.quantitecommande);
        });
        this.ready++;
      });

    // Récupère les infos nécessaires au passage de la commande
    this.userService.getProfil().pipe(take(1), takeUntil(this._destroy$)).subscribe(data => {
      this.transportService.setMail(data.user.TIERSMEL);
      this.transportService.chargerGrille().subscribe(data => {
        this.transportService.grilleTrans = data;
        this.grilleTrans = this.transportService.getGrille();
        this.txTVA = this.transportService.getTxTVA();
        this.panierForm.controls['email'].setValue(this.transportService.getMail());
        this.ready++;
      });
    });

    this.user = this.authClient.currentClient;

    this._setMinDate();
    this._init();

    // préremplir la référence du devis
    this.panierForm.controls['ref'].setValue(this.devis.numcommande + " " + this.devis.referencecommande);

    this.logTaxe();
    //On chope IBAN
    this.getIban();
    // get BIC
    this.getBic();
  }

  override ngOnDestroy(): void
  {
    this._destroy$.next();
    this._destroy$.complete();
  }

  private _init(): void
  {
    this._ready$
      .pipe(filter(n => n === 2), take(1))
      .subscribe(
        () => {
          this.panierForm.controls['transporteur'].setValue(this.devis.transporteur);
          const adr = new Adresse();
          adr.adresse1 = this.devis.wadresse1;
          adr.adresse2 = this.devis.wadresse2;
          adr.codepostal = this.devis.wcodepostal;
          adr.nom = this.devis.wnom;
          adr.pays = this.devis.wpays;
          adr.phone = this.devis.wphone;
          adr.ville = this.devis.wville;
          this.panierForm.controls['adresse'].setValue(adr);

          //  this.panierForm.value.livraison = adr ,
          this.getFormatedPanier();
          this.recalcul();

          this.panierPort.totalMarchandiseht = this.devis.mthtcommande - this.devis.mtfraisdeport - this.devis.produits.reduce((acc, val) => acc += val.prixd3e * val.quantitecommande, 0);
          this.panierPort.totalht = this.devis.mthtcommande;
          this.panierPort.tva = this.devis.mthtcommande * this.user.TauxTVA;
          this.panierPort.ttc = this.devis.mtttccommande;
          this.panierPort.port = this.devis.mtfraisdeport;
          this.fraisCcb = this.logTaxe();
        }
      );
  }

  override submitRequest(typeval: string): void {
    this.awaitingCommandResponse = true;

    this.formRequest$ = this.http.get(
      `${environment.apiUrl}/DevisControl.php`,
      {
        withCredentials: true,
        responseType: 'json',
        params: {
          numdevis: this.devis.numcommande,
          typval: typeval,
          mtht: this.totalHt.toString(),
          sauveref: this.panierForm.value.ref,
          mail: this.panierForm.value.email,
          port: this.panierPort.port,
          livdir: this.panierForm.value.livraison,
          datelivraison: this.panierForm.value.dateexpedition,
          vads_amount: this.panierPort.ttc.toFixed(2).toString(),
          codeerp: this.panierPort.codeerp
        }
      })
      .subscribe(
        (ret) => {
          this.formRequest = ret;
          // delais pour contrer l'asynchrone de JS
          setTimeout(
            () => {
              if (this.formRequest[1].erreur == 'non') {
                this.cartService.setValideCommande(this.formRequest[1].ncmd, 0, this.formRequest[1].transaction);
                if (this.formRequest[1].url.includes('ModeCB')) {
                  this.window.open(this.formRequest[1].url, '_self', "carttype='temp'");
                } else {
                  this.router.navigate([this.formRequest[1].url], { queryParams: { carttype: "temp" }});
                }
              }
              else {
                if (this.formRequest[1].nom) {
                  this.formErrors.errNom = true;
                }
                if (this.formRequest[1].mail) {
                  this.formErrors.errMail = true;
                }
              }
            },
            200);
          this.awaitingCommandResponse = false;
        },
        (error) => {
          console.log('Erreur dans la requete PHP \'DevisControl.php\' (submit)', error);
          this.formErrors.errFormNotSent = true;
          this.awaitingCommandResponse = false;
        }
      );
  }
}
