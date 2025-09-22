import {Component, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Adresse, CartItem, User} from '@/models';
import {DomSanitizer, SafeHtml} from '@angular/platform-browser';
import {ActivatedRoute, Router} from '@angular/router';
import {ModifDevisDialogComponent} from '@components/panier/modif-devis-dialog/modif-devis-dialog.component';
import {MatDialog} from '@angular/material/dialog';
import {RmaService} from '@services/rma.service';
import {takeUntil} from 'rxjs/operators';
import {LicenceService} from '@services/licence.service';
import {FormBuilder, FormControl, Validators} from '@angular/forms';
import {UserService} from '@services/user.service';
import {WindowService} from '@services/window.service';
import {Observable, Subject} from 'rxjs';
import {TransportService} from '@services/transport.service';
import {HttpClient} from '@angular/common/http';
import {CartService} from '@services/cart.service';
import {ComponentsInteractionService} from '@services/components-interaction.service';
import {AuthenticationService} from '@services/authentication.service';
import {environment} from '@env/environment';
import {Client} from '@models/licence';
import {EnduserFormComponent} from '@components/_util/components/enduser-form/enduser-form.component';
import {TempCartService} from '@services/temp-cart.service';
import {LogClientService} from '@services/log-client.service';
import {Contact} from '@models/contact';
import {SnackbarService} from '@services/snackbar.service';

@Component({
  selector: 'app-validation-panier',
  templateUrl: './validation-panier.component.html',
  styleUrls: ['./validation-panier.component.scss'],
})
export class ValidationPanierComponent implements OnInit, OnDestroy {
  /** Est-ce que la commande est un renouvellement de licence ? */
  @Input() renewLicence = false;
  @Input() lockCommande = false;
  @Input() lockFormulaire = false;
  /** Titre du panier, affiché en haut du composant */
  @Input() title = 'Votre panier';

  /** Variable contenant un regroupement de variables d'environement vitales au site */
  environment = environment;

  /** Observable renvoyée par la requete 'userService.getAdresses()' */
  adresses$: Observable<unknown>;
  /**
   * Valeurs renvoyée par la requete 'userService.getAdresses()'
   * Liste des adresses de l'Utilisateur
   */
  adresses = [];

  /** Détermine si la page est une page de validation de commande ou de devis */
  page: string;

  /** Est-ce que l'Utilisateur a un escompte ? */
  userHasEscompte: boolean = false;
  /** Est-ce qu'il y a une cotation active sur l'un des produits du panier ? */
  cartHasCotation: boolean = false;
  /** Est-ce que l'Utilisateur est étranger ? */
  userIsEtranger: boolean = false;

  /** Observable renvoyée par la requète de validation du panier */
  formRequest$ = null;
  /** Valeur renvoyée par la requète de validation du panier */
  formRequest;

  panierPort;

  /** Utilisateur connecté */
  user: User;
  client: User;

  /**IBAN ACTN */
  iban: string;
  /**BIC ACTN */
  bic: string;

  /** Code de type de payment
   * 'DEV' => Faire un devis */
  dev: string = 'DEV';
  /** Code de type de payment
   * 'CDW' => Commander sur encours */
  cdw: string = 'CDW';
  /** Code de type de payment
   * 'CCB' => Paiement par carte bancaire  */
  ccb: string = 'CCB';
  vir: string = 'VIR';
  /** Code de type de payment
   * 'WWW' => Recalcul */
  www: string = 'WWW';
  /** Codes des grilles de transport
   * Grille par defaut */
  codeDefautTransport: string = 'DFT';
  /** Codes des grilles de transport
   * Grille hors gabarit (SCHENKER) */
  codeSchenkerTransport: string = 'H21';
  /** Codes des grilles de transport
   * Grille corse */
  codeCorseTransport: string = 'FPC';

  /** Données formatées des produits du panier */
  fPanier;

  /** Le types de livraison est il autorisées ?
   * Livraison mail */
  livraisonEmail: boolean = false;
  /** Le types de livraison est il autorisées ?
   * Retrait en nos locaux */
  livraisonRetrait: boolean = false;
  /** Le types de livraison est il autorisées ?
   * Livraison chronopost */
  livraisonChronopost: boolean = false;
  /** Le types de livraison est il autorisées ?
   * Livraison schenker */
  livraisonSchenker: boolean = false;
  /** Le types de livraison est il autorisées ?
   * Livraison depuis le stock externe */
  livraisonDirecte: boolean = false;

  formErrors = {
    errNoAddress: false,
    errDateWeekEnd: false,
    errFormNotSent: false,
    errNoMail: false,
    errNoRef: false,
    errMail: false,
    errNom: false,
  };

  /** Est-ce que l'on a besoin de recalculer le prix du transport ? */
  needCotationTransport: boolean = false;
  /**
   * Boolean set to true once the page is fully loaded
   * prevent the form submit buttons to be clicked while it's false
   */
  attente = new Subject<void>();
  dejaCharge: boolean = false;
  /** Grille des transport */
  grilleTrans;
  /** Taux de TVA */
  txTVA;
  mindate;
  /** Total hors taxe du panier */
  totalHt: number;
  /** Montant de la TVA du panier */
  ttc: number;
  /**Frai paiement cb */
  fraisCcb: number;
  /** Prevent from lauching multiple commands at once */
  awaitingCommandResponse: boolean = false;
  /** Autorise l'affichage d'une partie des messages d'erreurs */
  submitted: boolean = false;
  adrrrr: Adresse = new Adresse();
  /** Formulaire de validation du panier */
  panierForm = this.fb.group({
    ref: [
      '',
      [
        Validators.required,
        Validators.pattern('^[a-zA-Z0-9 ]*$'),
        Validators.maxLength(25),
      ],
    ],
    email: ['', [Validators.maxLength(100), Validators.email]],
    emails: [
      ['', '', ''],
      [Validators.maxLength(100), this.limitOptionsSelection(3)],
    ],
    envoieDeMail: [true],
    transporteur: ['', [Validators.required]],
    livraison: ['STD', [Validators.required]],
    paiement: ['', [Validators.required]],
    adresse: this.adrrrr,
    dateexpedition: ['', [Validators.required]],
    dateRelance: [this.dateRelance],
  });
  commentaireGeneral = this.fb.group({
    commentaire: [
      '',
      [Validators.required, Validators.maxLength(260), Validators.minLength(1)],
    ],
  });

  listContacts: Contact[] = [];
  @ViewChild(EnduserFormComponent) enduserForm: EnduserFormComponent;
  newEnduser = new Client();
  enduser = new Client();
  /** Service de Panier */
  cartService: CartService = null;
  contacts = new FormControl('');
  public details = new Array<boolean>();

  /** Observable de nettoyage, déclanchée à la destruction du composant */
  protected _destroy$ = new Subject<void>();

  constructor(
    protected permCartService: CartService,
    protected tempCartService: TempCartService,
    public authService: AuthenticationService,
    public componentsInteractionService: ComponentsInteractionService,
    protected userService: UserService,
    protected fb: FormBuilder,
    protected sr: DomSanitizer,
    protected http: HttpClient,
    protected rmaService: RmaService,
    protected transportService: TransportService,
    protected router: Router,
    protected licenceService: LicenceService,
    protected window: WindowService,
    protected route: ActivatedRoute,
    protected authClient: LogClientService,
    protected snackBar: SnackbarService,
    protected dialog: MatDialog
  ) {
  }

  /** Champs de produits, invisibles et destinés au module de paiement. */
  _refInputs: string = '';

  public get refInputs(): SafeHtml {
    return this.sr.bypassSecurityTrustHtml(this._refInputs);
  }

  /** Champs de produits, invisibles et destinés au module de paiement. */
  _marqueInputs: string = '';

  public get marqueInputs(): SafeHtml {
    return this.sr.bypassSecurityTrustHtml(this._marqueInputs);
  }

  /** Champs de produits, invisibles et destinés au module de paiement. */
  _qteInputs: string = '';

  public get qteInputs(): SafeHtml {
    return this.sr.bypassSecurityTrustHtml(this._qteInputs);
  }

  /** Champs de produits, invisibles et destinés au module de paiement. */
  _gabInputs: string = '';

  public get gabInputs(): SafeHtml {
    return this.sr.bypassSecurityTrustHtml(this._gabInputs);
  }

  get dateRelance() {
    let oui = new Date();
    oui.setDate(oui.getDate() + 15);
    return oui;
  }

  get dateRelanceFormate() {
    return this.dateRelance.getFullYear() + '-' + (this.dateRelance.getMonth() + 1) + '-' + this.dateRelance.getDate();
  }

  public setCartService(cartService: CartService): void {
    this.cartService = cartService;
  }

  /**
   * Récupère le taux des frai de port
   */

  logTaxe(): any {
    this.http
      .get<number>(`${environment.apiUrl}/fraisCcb.php`, {
        withCredentials: true,
        responseType: 'json',
      })
      .subscribe((data) => {
        this.fraisCcb = this.totalHt * (data * 0.01);
        return this.fraisCcb;
      });
  }

  itemsArray: CartItem[];

  /**
   * Initialisation du ValidationPanierComponent
   *
   */
  ngOnInit(): void {
    this.itemsArray = Object.values(this.permCartService.cart.items);
    this.itemsArray.sort((a, b) => a.order - b.order);

    if (this.renewLicence) {
      this.cartService = this.tempCartService;
    } else {
      this.cartService = this.permCartService;
    }

    this.panierForm.patchValue({
      ref: this.cartService.getRefDevis()
    });

    this.panierForm.get('envoieDeMail').valueChanges.subscribe((data) => {
      if (!data) {
        this.panierForm.get('email').clearValidators();
        this.panierForm.get('emails').clearValidators();
        this.panierForm.get('emails').reset();
        this.panierForm.get('email').reset();
      } else {
        this.panierForm.get('email').addValidators([Validators.maxLength(100)]);
        this.panierForm
          .get('emails')
          .addValidators([
            Validators.maxLength(100),
            this.limitOptionsSelection(3),
          ]);
        this.panierForm.get('email').reset();
        this.panierForm.get('emails').reset();
      }
    });

    this.page = decodeURIComponent(
      this.route.snapshot.url[this.route.snapshot.url.length - 1].path
    );

    this.cartHasCotation = this.cartService.hasCotation();
    this.userHasEscompte = this.authClient.hasEscompte();
    this.grilleTrans = this.transportService.getGrille();
    this.txTVA = this.transportService.getTxTVA();
    this.contacts.setValue(this.transportService.getMail());
    if (this.txTVA == null || !this.grilleTrans || !this.contacts.value) {
      this.router.navigate(['/panier']).then(() => {
        if (!this.contacts.value) {
          this.snackBar.showSnackbar("Le client n'a pas d'adresse mail valide");
        } else if (!this.grilleTrans) {
          this.snackBar.showSnackbar(
            "La grille de transport n'a pas pu se charger"
          );
        } else {
          this.snackBar.showSnackbar("La tva du client n'a pas pu se charger");
        }
      });
    } else {
      this.client = this.authClient.currentClient;
      this.getFormatedPanier();

      this.adresses$ = this.userService.getAdresses();
      this.userIsEtranger = this.client.TIERSETRANGER == 'O';

      this.adresses$.subscribe((ret: Adresse[]) => {
        const idx = ret.findIndex((adresse) => adresse.defaut === 'P');
        let defaut = [];
        if (idx !== -1) {
          defaut = ret.splice(idx, 1);
        }
        ret = ret.sort((a, b) => a.nom.localeCompare(b.nom));
        ret.splice(0, 0, ...defaut);
        this.adresses = ret;
        this.panierForm.value.adresse =
          idx !== -1 ? this.adresses[0] : new Adresse();
        if (this.panierForm.value.adresse.adresse1 !== '') {
          this.dejaCharge = true;
          this.attente.next();
          this.getPanierPortAdd();
        } else {
          this.dejaCharge = true;
          this.attente.next();
        }
        this.doIneedCotationTransport();
      });

      this._setMinDate();
      this.typesDeLivraisons();

      this.panierForm.controls['transporteur'].valueChanges
        .pipe(takeUntil(this._destroy$))
        .subscribe((event) => {
          this.getPanierPortLivr(event);
        });

      this.panierForm.controls['adresse'].valueChanges
        .pipe(takeUntil(this._destroy$))
        .subscribe((event) => {
          setTimeout(() => {
            this.getPanierPortAdd(event);
          }, 20)
        });
    }
    this.logTaxe();
    this.getIban();
    this.getBic();

    this.http
      .get<Contact[]>(`${environment.apiUrl}/ListeclientsContacts.php`, {
        params: {
          numclient: this.authClient.currentClient.id,
        },
      })
      .subscribe((data) => {
        data.forEach((d) => {
          if (
            d.service != 'COMPTABILITE' &&
            d.service != 'LOGISTIQUE(ENVOI MAIL TRACKING)' &&
            d.service != 'RECEPT° FACTURE NUMERIQUE'
          ) {
            this.listContacts.push(d);
          }
        });
      });

  }

  /** Destruction du ValidationPanierComponent */
  ngOnDestroy(): void {
    if (this.formRequest$ != null) {
      this.formRequest$.unsubscribe();
    }
    this._destroy$.next();
    this._destroy$.complete();
  }

  updateTVA(paysiso: string) {
    let txTVA = 0;
    if (paysiso == 'FR' || paysiso == '') {
      txTVA = 0.2;
    }
    this.transportService.setTVA(txTVA);
    this.recalcul();
  }

  isVirtualOnly(): boolean {
    for (const item of this.itemsArray) {
      if (item.produit.gabarit !== 'V') {
        return false;
      }
    }
    return true;
  }

  /** Vérifie la validité de l'adresse du formulaire en prenant en compte le type de livraison */
  checkAdress(validForm: boolean): boolean {
    this.formErrors.errNoAddress = false;
    if (
      this.panierForm.value.transporteur === 'CHR' ||
      this.panierForm.value.transporteur ===
      'SCH' /*|| this.transporteur === 'COL'*/
    ) {
      if (this.panierForm.value.adresse.adresse1 == null) {
        this.formErrors.errNoAddress = true;
        return false;
      }
    }
    return validForm;
  }

  /**
   * Vérification de toutes les données de validation de la commande
   * Puis envois de la requete de commande s'il s'avère que tout est valide
   */
  submit(typeval: string): boolean {
    this.submitted = true;
    this.resetErrors();

    let validForm = true;

    // Vérification de l'adresse
    validForm = this.checkAdress(validForm);

    // Vérification du formulaire de contacts
    if (this.contacts.invalid) {
      this.formErrors.errNoMail = true;
      validForm = false;
    }

    // Vérification de la référence
    if (this.panierForm.value.ref.length <= 0) {
      this.formErrors.errNoRef = true;
      validForm = false;
    }

    // Vérification de la date d'expédition
    const dateinput = this.panierForm.get('dateexpedition');
    const day = new Date(dateinput.value).getUTCDay();
    if ([6, 0].includes(day)) {
      this.formErrors.errDateWeekEnd = true;
      validForm = false;
    }

    // Vérification du formulaire client final
    if (
      !this.renewLicence &&
      this.showClientFinal() &&
      !this.enduserForm.valid
    ) {
      validForm = false;
    }

    // Vérification du nombre maximal d'e-mails sélectionnés
    if (this.panierForm.get('emails').hasError('maxSelectionExceeded')) {
      validForm = false;
    }

    if (this.panierForm.get('transporteur').errors) validForm = false;

    this.panierForm.markAllAsTouched();

    if (validForm) {
      // Attribution du client final au service de panier
      this.cartService.clientFinal = this.enduser;

      // Envoi de la requête de commande avec un délai
      setTimeout(() => this.submitRequest(typeval));
      return true;
    }
    return false;
  }

  limitOptionsSelection(maxSelections: number) {
    return (control: FormControl) => {
      if (control.value.length > maxSelections) {
        return {maxSelectionExceeded: true};
      }
      return null;
    };
  }

  checkMails() {
    if (!this.panierForm.value.email) {
      this.panierForm.value.email = '';
    }
    if (!this.panierForm.value.emails) {
      this.panierForm.value.emails = [];
    }
    for (let i = 0; i < 3; i++) {
      if (!this.panierForm.value.emails[i]) {
        this.panierForm.value.emails[i] = '';
      }
    }
  }

  /** Formate les données du panier et les stockent dans 'this.fPanier' */
  getFormatedPanier(): void {
    this.fPanier = Object.values(
      this.renewLicence
        ? this.cartService.cart.items
        : this.cartService.cart.items
    ).map((item) => {
      return {
        marque: item.produit.marque,
        quantite: item.qte,
        reference: item.produit.reference,
        gabarit: item.produit.gabarit,
        livraisondirecte: item.produit.livraisondirecte,
        prix: item.produit.prix,
        prixAdd: item.produit.prixAdd,
        d3e: item.produit.prixD3E,
        poidsbrut: item.produit.poidsbrut,
      };
    });
  }

  recalcul(newModeTransport = null): void {
    let nbVirtuel = 0;
    let nbHorsGab = 0;
    let nbStd = 0;
    let totPoids = 0;
    let allPoids = 0;
    let portP = 0;
    let franco = 0;
    let typeEnvoi = '';
    let frais = '';
    let fraisERP = 0;
    const totalMarchandiseHt = this.renewLicence
      ? this.cartService.cart.total
      : this.cartService.cart.total;
    let totalD3E = 0;

    let transporteur = newModeTransport || this.panierForm.value.transporteur;

    const items = Object.values(
      this.renewLicence
        ? this.cartService.cart.items
        : this.cartService.cart.items
    );

    for (const item of items) {
      totalD3E += item.qte * item.produit.prixD3E;
      switch (item.produit.gabarit) {
        case 'H':
          nbHorsGab += 1;
          break;
        case 'V':
          nbVirtuel += 1;
          break;
        default:
          nbStd += 1;
      }
      if (
        item.produit.poidsbrut &&
        !(nbHorsGab > 0 && item.produit.gabarit !== 'H')
      ) {
        totPoids += +item.produit.poidsbrut * item.qte;
      }
      allPoids += +item.produit.poidsbrut * item.qte;
    }

    const transportFeesMapping = {
      ENL: '',
      VTP: '',
      LDF: '',
      COL: 'COL',
      // Add more mappings as needed
    };

    if (transportFeesMapping.hasOwnProperty(transporteur)) {
      frais = transportFeesMapping[transporteur];
    } else if (nbHorsGab > 0) {
      typeEnvoi = 'H';
      frais = this.codeSchenkerTransport;
      portP = items.reduce(
        (acc, item) =>
          acc +
          (item.produit.prixAdd > 0 ? item.produit.prixAdd * item.qte : 0),
        0
      );
    } else if (nbStd > 0) {
      typeEnvoi = 'C';
      frais = this.codeDefautTransport;
    }

    let codePostaleValue = this.panierForm.value.adresse?.codepostal;

    if (
      codePostaleValue !== undefined &&
      codePostaleValue?.slice(0, 2) === '20' &&
      transporteur === 'CHR'
    ) {
      typeEnvoi = 'C';
      frais = this.codeCorseTransport;
    }

    if (nbVirtuel > 0 && nbHorsGab === 0 && nbStd === 0) {
      typeEnvoi = 'V';
    }

    const grilleFiltre = this.grilleTrans.filter(
      (element) => element.codefrais === frais
    );

    franco = grilleFiltre.length > 0 ? +grilleFiltre[0].mtfranco || 0 : 0;

    for (const element of grilleFiltre) {
      if (totPoids <= +element.kgmax && portP === 0) {
        portP = +element.kgmt;
        fraisERP = element.CodeERP;
        break; // Optimisation : Sort de la boucle dès que la condition est remplie
      }
    }

    if (['V', 'E'].includes(typeEnvoi) || totalMarchandiseHt >= franco) {
      portP = 0;
      franco = 0;
    }

    if (transporteur === 'CHR' && this.authService.currentUser.Franco === 'O') {
      portP = 0;
    }

    this.totalHt = portP + totalMarchandiseHt + totalD3E;
    this.txTVA = this.transportService.getTxTVA();
    let tva = this.totalHt * this.txTVA;
    tva = Math.round(tva * 100) / 100;
    const escompte =
      this.totalHt * (+this.authClient.currentClient.Pescompte / 100);
    const ttc = this.totalHt + tva;
    const escompteTotal = this.totalHt - escompte + tva;
    this.panierPort = {
      codeerp: fraisERP,
      typeenvoi: typeEnvoi,
      transporteur: transporteur,
      port: portP,
      portfranco: franco,
      totalMarchandiseht: totalMarchandiseHt,
      Totald3e: totalD3E,
      totalht: this.totalHt,
      tva: tva,
      ttc: ttc,
      amountOfEscompte: escompte,
      totalEscompte: escompteTotal,
      totalpoids: totPoids,
      allpoids: allPoids,
    };

    setTimeout(() => this.checkAdress(true));
  }

  /** Recalcul les frais de port quand l'adresse change dans le formulaire */
  getPanierPortAdd(targetAddress = null): void {
    if (targetAddress && this.panierForm.value.transporteur != 'ENL') {
      this.doIneedCotationTransport(targetAddress);
    } else {
      this.doIneedCotationTransport();
    }
    if (!this.lockFormulaire) {
      this.recalcul();
    }
  }

  /** Recalcul les frais de port quand lle mode de livraison change dans le formulaire */
  getPanierPortLivr(newModeTransport = null): void {
    if (!this.lockFormulaire) {
      this.recalcul(newModeTransport);
    }
  }

  /** Définit quels sont les types de livraisons possibles en fonction des produits présents dans le panier */
  typesDeLivraisons(): void {
    let livraisonType = 0;
    const gabarits = Object.values(
      this.renewLicence
        ? this.cartService.cart.items
        : this.cartService.cart.items
    ).map((it) => it.produit.gabarit);

    for (const gabarit of gabarits) {
      if (livraisonType == 0 && gabarit == '') {
        livraisonType = 1;
      }

      if (livraisonType <= 1 && gabarit == 'H') {
        livraisonType = 2;
        break;
      }
    }

    this.livraisonEmail = true;
    this.livraisonRetrait = false;
    this.livraisonChronopost = false;
    this.livraisonSchenker = false;
    this.livraisonDirecte = false;
    this.panierForm.value.transporteur = 'MAI';

    if (livraisonType >= 1) {
      this.livraisonEmail = false;
      this.livraisonRetrait = true;
      this.livraisonChronopost = true;
      this.livraisonSchenker = false;
      this.panierForm.value.transporteur = 'CHR';
    }

    if (livraisonType >= 2) {
      this.livraisonChronopost = false;
      this.livraisonSchenker = true;
      this.panierForm.value.transporteur = 'SCH';
    }

    const livraisonsDirectes = Object.values(
      this.renewLicence
        ? this.cartService.cart.items
        : this.cartService.cart.items
    ).map((it) => it.produit.livraisondirecte);
    for (let i = livraisonsDirectes.length - 1; i >= 0; i--) {
      if (livraisonsDirectes[i]) {
        this.livraisonDirecte = true;
        break;
      }
    }

    this.getPanierPortLivr();
  }

  /**
   * Reset all the error flags to false
   */
  resetErrors(): void {
    this.formErrors.errNoAddress = false;
    this.formErrors.errDateWeekEnd = false;
    this.formErrors.errFormNotSent = false;
    this.formErrors.errNoMail = false;
    this.formErrors.errNoRef = false;
    this.formErrors.errMail = false;
    this.formErrors.errNom = false;
  }

  /** Renvoie s'il est nécéssaire de recalculer les fraits de transports {boolean} */
  doIneedCotationTransport(target: any = null): boolean {
    let targetAdress = null;

    if (target) {
      targetAdress = target;
    } else {
      targetAdress = this.panierForm.value.adresse;
    }

    if (!this.userIsEtranger && targetAdress.paysiso == 'FR') {
      this.needCotationTransport = false;
      return false;
    }
    this.needCotationTransport = true;
    return true;
  }

  /**
   * Renvoie s'il on doit ou pas afficher le formulaire de client final {boolean}
   * (Au moins un produit dans le panier est virtuel et sa marque figure dans la liste du service de licence)
   */
  showClientFinal(): boolean {
    for (const item of Object.values(
      this.renewLicence
        ? this.cartService.cart.items
        : this.cartService.cart.items
    )) {
      if (
        item.produit.gabarit == 'V' &&
        this.licenceService.marques.has(item.produit.marque)
      ) {
        return true;
      }
    }
    return false;
  }

  getIban() {
    return 'FR76 1780 7000 3505 1663 764';
  }

  copyText(textToCopy: string) {
    const selBox = document.createElement('textarea');
    selBox.style.position = 'fixed';
    selBox.style.left = '0';
    selBox.style.top = '0';
    selBox.style.opacity = '0';
    selBox.value = textToCopy;
    document.body.appendChild(selBox);
    selBox.focus();
    selBox.select();
    document.execCommand('copy');
    document.body.removeChild(selBox);
  }

  /**
   * Chope IBAN `${environment.backend}/iban.txt`
   */
  getBic() {
    return 'CCBPFRPPTLS';
  }

  /** Met à jour la date minimum de livraison possible et l'applique par defaut */
  protected _setMinDate(): void {
    const today = new Date();
    const dd = today.getDate();
    const mm = today.getMonth() + 1;
    const yyyy = today.getFullYear();

    let minday: string | number;
    let minmonth: string | number;
    if (dd < 10) {
      minday = '0' + dd;
    } else {
      minday = dd;
    }
    if (mm < 10) {
      minmonth = '0' + mm;
    } else {
      minmonth = mm;
    }

    this.mindate = yyyy + '-' + minmonth + '-' + minday;
    this.panierForm.controls['dateexpedition'].setValue(this.mindate);

    this.panierForm.get('dateexpedition').valueChanges.subscribe((date) => {
      this.formErrors.errDateWeekEnd = false;
      const day = new Date(date).getUTCDay();
      if ([6, 0].includes(day)) {
        this.formErrors.errDateWeekEnd = true;
      }
    });
  }

  /**
   * Formatage de données puis envoi de la requète PHP validant la commande
   */
  protected submitRequest(typeval: string): void {
    if (this.cartService.getNumDevis() !== "") {
      this.openModifDevisDialog(typeval);
    } else {
      this.sendSubmittedRequest(typeval);
    }
  }

  openModifDevisDialog(typeval: string) {
    const dialogRef = this.dialog.open(ModifDevisDialogComponent, {
      width: '500px',
      data: {
        numDevis: this.cartService.getNumDevis()
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      this.cartService.setNumDevis(result === 'nouveau' ? "" : this.cartService.getNumDevis());
      if (result !== 'annuler') {
        this.sendSubmittedRequest(typeval);
      }
    });
  }

  sendSubmittedRequest(typeval: string) {
    this.checkMails();
    this.awaitingCommandResponse = true;
    let submitAdress = this.panierForm.value.adresse;
    if (submitAdress == null) {
      submitAdress = {
        nom: '',
        adresse1: '',
        adresse2: '',
        codepostal: '',
        ville: '',
        phone: '',
        paysiso: '',
        defaut: '',
        forfait: '',
        pays: '',
        payscode: '',
        payszobe: '',
        codeadresse: '',
      };
    }
    if (typeval === 'CCB') {
      this.panierPort.ttc =
        (this.panierPort.totalht + this.fraisCcb) * this.txTVA +
        (this.panierPort.totalht + this.fraisCcb);
    }
    const sortedCartItems = Object.values(this.cartService.cart.items).sort(
      (a, b) => a.order - b.order
    );
    this.formRequest$ = this.http
      .get(`${environment.apiUrl}/PanierControl.php`, {
        withCredentials: true,
        responseType: 'json',
        params: {
          ref: encodeURIComponent(
            JSON.stringify(sortedCartItems.map((it) => it.produit.reference))
          ),
          marque: JSON.stringify(
            sortedCartItems.map((it) => it.produit.marque)
          ),
          qte: JSON.stringify(sortedCartItems.map((it) => it.qte)),
          gab: JSON.stringify(sortedCartItems.map((it) => it.produit.gabarit)),
          cot: JSON.stringify(sortedCartItems.map((it) => it.cotation || null)),
          com: JSON.stringify(sortedCartItems.map((it) => it.commentaire)),

          compied: this.commentaireGeneral.value.commentaire,
          prixsaisie: JSON.stringify(sortedCartItems.map((it) => it.prixSaisi)),

          typval: typeval,
          mtht: this.totalHt.toString(),
          sauveref: this.rmaService.removeAccents(this.panierForm.value.ref),
          mail: this.panierForm.value.email ?? '',
          mail1: this.panierForm.value.emails[0] ?? '',
          mail2: this.panierForm.value.emails[1] ?? '',
          mail3: this.panierForm.value.emails[2] ?? '',
          transport: this.panierForm.value.transporteur,
          port: this.panierPort.port,
          fraisCB: this.fraisCcb,
          livdir: this.panierForm.value.livraison,

          nom: this.rmaService.removeAccents(submitAdress.nom),
          ad1: this.rmaService.removeAccents(submitAdress.adresse1),
          ad2: this.rmaService.removeAccents(submitAdress.adresse2),
          cp: !!submitAdress.codepostal ? submitAdress.codepostal : '',
          ville: this.rmaService.removeAccents(submitAdress.ville),
          phone: !!submitAdress.phone ? submitAdress.phone : '',
          payx: this.rmaService.removeAccents(submitAdress.paysiso),

          datelivraison: this.panierForm.value.dateexpedition,
          dateRelance: this.dateRelanceFormate,

          vads_amount:
            this.userHasEscompte && typeval == 'CCB'
              ? this.panierPort.totalEscompte.toFixed(2).toString()
              : this.panierPort.ttc.toFixed(2).toString(),
          codeerp: this.panierPort.codeerp,
          numDevis: this.cartService.getNumDevis()
        },
      })
      .subscribe(
        (ret) => {
          this.formRequest = ret;

          if (this.formRequest[1].erreur == 'non') {
            this.cartService.setValideCommande(
              this.formRequest[1].ncmd,
              0,
              this.formRequest[1].transaction
            );
            if (this.formRequest[1].url.includes('ModeCB')) {
              this.window.open(
                this.formRequest[1].url,
                '_self',
                this.renewLicence ? "carttype='temp'" : "carttype='perm'"
              );
            } else {
              this.router.navigate([this.formRequest[1].url], {
                queryParams: {carttype: this.renewLicence ? 'temp' : 'perm'},
              });
            }
          } else {
            if (this.formRequest[1].nom) {
              this.formErrors.errNom = true;
            }
            if (this.formRequest[1].mail) {
              this.formErrors.errMail = true;
            }
          }
          this.awaitingCommandResponse = false;
          this.cartService.setNumDevis("");
          this.cartService.setRefDevis("");
        },
        (error) => {
          console.log(
            "Erreur dans la requete PHP 'PanierControl.php' (submit)",
            error
          );
          this.formErrors.errFormNotSent = true;
          this.awaitingCommandResponse = false;
        }
      );
  }
}
