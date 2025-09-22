import {Component, OnInit, QueryList, ViewChildren} from '@angular/core';
import {UserService} from "@services/user.service";
import {ProduitService} from "@services/produit.service";
import {ActivatedRoute, Router} from "@angular/router";
import {CartItem, Produit} from "@/models";
import {Subject, Subscription} from "rxjs";
import {TempCartService} from "@services/temp-cart.service";
import {take, takeUntil} from "rxjs/operators";
import {TransportService} from "@services/transport.service";
import {ValidationPanierComponent} from "@components/panier/validation-panier/validation-panier.component";
import {Client, Licence} from "@models/licence";
import {LicenceService} from "@services/licence.service";

@Component({
  selector: 'app-contrat-modification',
  templateUrl: './contrat-modification.component.html',
  styleUrls: ['./contrat-modification.component.scss']
})
export class ContratModificationComponent implements OnInit {

  @ViewChildren(ValidationPanierComponent)
  private validationPanierComponent: QueryList<ValidationPanierComponent>;

  licence: Licence;
  licenceOfFiltres: any[];
  filtresMarqueOf: any[];
  filtresMarque: any[];

  selectedDuree = '0';
  selectedPosteMul = 1;
  selectedUpgrade = 'Non';

  durees = new Set<string>();
  postes = new Set<string>();

  newLicence: Produit = null;

  // Gestion des licences multiplicatives
  mul = false;
  max = Number.MAX_SAFE_INTEGER;

  montant = 0;
  attention = false;
  added = false;

  swapCart = new Map<string, CartItem>();

  ready = false;
  lockCommande = true;

  showPopupDevis = false;

  entries = {
    type: '',
    duree: '',
    postes: ''
  };

  get type() {
    return this._type;
  }
  set type(newType) {
    this._type = newType;
    this.populateFormulaire();
    this.findLicence();
  }

  get ajoutPoste(): boolean {
    return this._ajoutPoste;
  }
  set ajoutPoste(value: boolean) {
    this.selectedPosteMul = 0;
    this._ajoutPoste = value;
    this.noContinue();
    if (!value) {
      this.resetNbPoste();
      this.findLicence();
    }
  }

  continue = false;
  upgradable = false;
  renew = true;

  private _type: '' | 'renew' | 'upgrade' | 'new' = '';
  private _searching: Subscription;
  private _ajoutPoste = false;
  private _enduserSet = false;
  private _destroy$ = new Subject<void>();

  constructor(
    private produitService: ProduitService,
    public route: ActivatedRoute,
    public router: Router,
    public transportService: TransportService,
    public userService: UserService,
    public licenceService: LicenceService,
    private tempCartService: TempCartService
  ) { }

  ngOnInit(): void {
    if (history.state.licence == null) {
      this.router.navigate(['../'], { relativeTo: this.route });
    } else {
      this.licence = history.state.licence;
      this.licenceOfFiltres = history.state.licenceOfFiltres;
      this.filtresMarqueOf = history.state.filtresMarqueOf;
      this.filtresMarque = history.state.filtresMarque;

      this.tempCartService.emptyCart();

      for (const [key, value] of Object.entries(this.filtresMarque)) {
        switch (value) {
          case 'Nombre':
            this.entries.postes = 'val' + key.substr(key.length - 2, 2);
            break;
          case 'Type d\'achat':
            this.entries.type = 'val' + key.substr(key.length - 2, 2);
            break;
          case 'Durée':
            this.entries.duree = 'val' + key.substr(key.length - 2, 2);
            break;
        }
      }

      this.selectedDuree = this.licenceOfFiltres?.[this.entries.duree];
      this.resetNbPoste();

      // Upgradable ?
      this.upgradable = this.filtresMarqueOf.find(el => el[this.entries.type] === 'UPGRADE' && el['val02'] !== this.licenceOfFiltres['val02']) != null;
      // Nouvelle acquisition ?
      this.type = this.licenceService.isRenewable(this.licence) ? '' : 'new';
      // Notion de renew ?
      this.renew = this.filtresMarqueOf.find(filtreMarqueOf => filtreMarqueOf[this.entries.type] === 'RENEW') != null;

      this.userService.getProfil().subscribe(data => {
        this.transportService.setTVA(data.user.TauxTVA);
        this.transportService.setMail(data.user.TIERSMEL);
        this.transportService.chargerGrille().subscribe(data => {
          this.transportService.grilleTrans = data;
          this.ready = true;
        });
      });
    }
  }

  ngAfterViewInit(): void {
    this.validationPanierComponent.changes
      .pipe(takeUntil(this._destroy$))
      .subscribe((vc: QueryList<ValidationPanierComponent>) => {
        if (!this._enduserSet && vc.first != null) {
          setTimeout(() => {
            vc.first.setCartService(this.tempCartService);
            vc.first.panierForm.value.transporteur = 'MAI';
            this.licence.client.serie = this.licence.serie;
            vc.first.newEnduser = Client.fromObject(this.licence.client);
            vc.first.enduser = Client.fromObject(this.licence.client);
            this.tempCartService.clientFinal = Client.fromObject(this.licence.client);
            this._enduserSet = true;
            vc.first.typesDeLivraisons();
            vc.first.recalcul();
            vc.first.panierForm.patchValue({ref: `RENEW ${this.licence.commande.referencecommande}`});
            vc.first.panierForm.get('ref').setValue(`RENEW ${this.licence.commande.referencecommande}`);
          });
        }
      });
  }

  ngOnDestroy(): void {
    this.noContinue();
    this._destroy$.next();
    this._destroy$.complete();
  }

  onDureeChange(event): void {
    this.selectedDuree = event;
    this.findLicence();
  }

  onUpgradeChange(event): void {
    this.selectedUpgrade = event;
    this.findLicence();
  }

  onNombrePosteChange(event: number): void {
    this.selectedPosteMul = event;
    if (!this.ajoutPoste || this.type === 'new') {
      this.findLicence();
    }
  }

  /**
   * Passage à la caisse.
   */
  onContinue(): void {
    this.lockCommande = true;
    this.continue = true;
    this.tempCartService.emptyCart();

    if (this.mul) {
      this.tempCartService.addProduit(this.newLicence, this.selectedPosteMul);
    } else {
      this.tempCartService.addProduit(this.newLicence, 1);
    }
    this.refreshPanier();
    this.lockCommande = false;
  }

  /**
   * Une modification est apportée au formulaire.
   */
  noContinue(): void {
    this.continue = false;
    this._enduserSet = false;
    this.tempCartService.emptyCart();
    if (this.swapCart.size !== 0) {
      for (const item of this.swapCart.values()) {
        this.tempCartService.addProduit(item.produit, item.qte);
      }
    }
  }

  /**
   * Initialise le nombre de poste à la valeur de la licence à renouveler.
   */
  resetNbPoste(): void {
    if (this.entries.postes !== '') {
      this.mul = this.licenceOfFiltres?.[this.entries.postes].includes('à');
      if (this.mul) {
        this.selectedPosteMul = +this.licence.quantite;
      } else {
        this.selectedPosteMul = +this.licenceOfFiltres?.[this.entries.postes].match(/(\d+)/g)[0];
      }
    }
  }

  /**
   * Remplit le formulaire avec les valeurs de la licence à renouveler.
   */
  populateFormulaire(): void {
    this.postes.clear();
    this.durees.clear();
    this.filtresMarqueOf
      .filter(filtreMarque =>
        (this.entries.type !== '' ? (!this.renew || filtreMarque[this.entries.type] === this._type.toUpperCase()) : true)
        && this.checkOtherFilters(filtreMarque))
      .forEach(filtreMarque => {
        if (this.entries.postes !== '') {
          this.postes.add(filtreMarque[this.entries.postes]);
        }
        if (filtreMarque[this.entries.duree] !== '') {
          this.durees.add(filtreMarque[this.entries.duree]);
        }
      });
  }

  /**
   * Retrouve la licence correspondante aux valeurs du formulaire
   */
  public findLicence(): void {
    this.lockCommande = true;
    this.newLicence = null;
    this.mul = false;
    if (this._searching != null) {
      this._searching.unsubscribe();
    }
    this.noContinue();
    const licence = this.filtresMarqueOf.find((filtreMarque: any[]) => {
      const resCheckNbPoste = this.checkNbPoste(filtreMarque);
      return (this.entries.type !== '' ? (!this.renew || filtreMarque[this.entries.type] === this.type.toUpperCase()) : true)
        && resCheckNbPoste
        && this.licenceOfFiltres['val01'] === filtreMarque['val01']
        && (this.type === 'upgrade' || this.licenceOfFiltres['val02'] === filtreMarque['val02'])
        && this.checkOtherFilters(filtreMarque)
        && filtreMarque[this.entries.duree] === this.selectedDuree;
    });
    if (licence != null) {
      this._searching = this.produitService.getProduitById(licence['produit']).pipe(take(1)).subscribe(produit => {
        if (this.entries.postes !== '') {
          this.mul = licence[this.entries.postes].includes('à');
          if (this.mul) {
            this.montant = +produit.prix * this.selectedPosteMul;
          } else {
            this.montant = +produit.prix;
          }
        } else {
          this.montant = +produit.prix;
        }
        this.newLicence = produit;
      });
    }
  }

  /**
   * Vérifie qu'une licence match tous les critères de la licence à renouveler.
   * @param filtreMarque La licence à vérifier
   */
  private checkOtherFilters(filtreMarque: any[]): boolean {
    for (const [key, value] of Object.entries(filtreMarque)) {
      if (key.startsWith('val')) {
        if (key !== this.entries.duree && key !== this.entries.postes && key !== this.entries.type && key !== 'val02') {
          if (value !== this.licenceOfFiltres[key]) {
            return false;
          }
        }
      }
    }
    return true;
  }

  /**
   * Indique si le nombre de postes sélectionné correspondant à une licence.
   * @param filtreMarque La licence à vérifier
   */
  private checkNbPoste(filtreMarque: any[]): boolean {
    // Vérifie si la licence a une notion de poste
    if (this.entries.postes !== '') {
      // Le nombre de poste renseigné contient des lettres
      if (filtreMarque[this.entries.postes].match(/\D/g)) {
        // Le nombre de poste renseigné est de la forme x à x
        if (filtreMarque[this.entries.postes].includes('à')) {
          const reg = new RegExp(/^(\d+) à (\d+).*$/);
          const res = reg.exec(filtreMarque[this.entries.postes]);
          if (res != null) {
            return this.selectedPosteMul >= +res[1] && this.selectedPosteMul <= +res[2];
          } else {
            return false;
          }
        } else {
          // Le nombre de poste renseigné est sous une autre forme. Ex: Pack de 2
          const reg = new RegExp(/(\d+)/g);
          const res = reg.exec(filtreMarque[this.entries.postes]);
          if (res != null) {
            return this.selectedPosteMul === +res[1];
          } else {
            return false;
          }
        }
      } else {
        // Le nombre de poste renseigné ne contient que des chiffres
        return this.selectedPosteMul == +filtreMarque[this.entries.postes];
      }
    } else {
      return true;
    }
  }

  /**
   * Rafraichit le panier.
   */
  refreshPanier(): void {
    this.lockCommande = true;
    this.validationPanierComponent?.first?.recalcul();
    this.lockCommande = false;
  }

  /**
   * Retourne à la vue des licences.
   */
  backToLicences(): void {
    this.router.navigate(['../'], { relativeTo: this.route });
  }

  /**
   * Envoi une demande de devis.
   */
  demandeDevis(): void {
    this.licenceService.demandeDevis(this.licence, this.selectedPosteMul, this.selectedDuree)
      .pipe(take(1))
      .subscribe(() => {
        this.showPopupDevis = true;
      });
  }

}
