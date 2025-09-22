import { AdresseService } from '@/services/adresse.service';
import { AuthenticationService } from '@/services/authentication.service';
import { RmaService } from '@/services/rma.service';
import { registerLocaleData } from '@angular/common';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, OnInit, Output, Renderer2, ViewChild, ViewEncapsulation } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from '@env/environment';
import localeFr from '@angular/common/locales/fr';
import { PredictionResultsClient, LogClientService } from '@/services/log-client.service';
import { Observable, Subject, takeUntil } from 'rxjs';
import { MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { Client, Produit } from '@/models';
import { MatStepper, MatStepperNext } from '@angular/material/stepper';
import { AbonnementsService } from '../abonnements.service';
import { ClientsService } from '@/services/clients.service';
import { ProduitService } from '@/services/produit.service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from './confirm-dialog/confirm-dialog.component';
import { siretValidator } from '@/validators/siret-validator';

// Enregistrement des informations de localisation pour le français
registerLocaleData(localeFr)


export const _filter = (opt: Produit[], value: string): Produit[] => {
  const filterValue = value.toLowerCase();

  return opt.filter(item => item.reference.toLowerCase().includes(filterValue));
};

@Component({
  selector: 'app-form-model',
  templateUrl: './form-model.component.html',
  styleUrls: ['./form-model.component.scss'],
  encapsulation: ViewEncapsulation.None,
})



export class FormModelComponent {

  @Output() EventLogIn = new EventEmitter<void>();
  @Output() hasFocusedInputChange = new EventEmitter<boolean>();
  connectionFailure = false;
  private _destroy$ = new Subject<void>();
  autoCompleteOptions$: Observable<PredictionResultsClient>;
  searching: string;
  openSearch = false;

  // nClientACTN = new FormControl('', Validators.required);
  @ViewChild(MatAutocompleteTrigger) autocomplete: MatAutocompleteTrigger;
  @ViewChild(MatStepper) stepper: MatStepper;
  @ViewChild('formRef') formRef: ElementRef;
  constructor(public rmaService: RmaService, public fb: FormBuilder, public router: Router, public http: HttpClient, private _snackBar: MatSnackBar, public authService: AuthenticationService,
    public adresseService: AdresseService, private renderer: Renderer2, private produitService: ProduitService, private cdr: ChangeDetectorRef, private dialog: MatDialog,
    private route: ActivatedRoute, private predictionService: LogClientService, private AbonnementsService: AbonnementsService, private clientService: ClientsService

  ) { }
  isLinear = false;

  formErr: boolean = false;
  @Input() mode: string
  spin: boolean
  addrData: any = {};
  loading = true;
  numberOfitem = ['']
  //searching;
  checked = false;
  revName: string;
  // private _destroy$ = new Subject<void>();
  isEditable = false;
  isEditableProduct = false;
  test: any;
  preselectedValue;
  zukex: any = {};
  products: Produit[] = [];
  filteredProducts: any[] = []
  formProductArray: FormGroup[] = [];
  dataArray: any[] = [];
  heures: any[] = [];
  disabledBtn: boolean = false;
  showSuppCompt: boolean = false;

  clientActuel: any
  revendeurActuel: Client = new Client();

  ngOnInit(): void {

    this.spin = true;
    this.heures = this.AbonnementsService.heure;
    if (this.mode == 'edit') {
      this.getClients();
      this.isEditable = true;
      this.facturationProduct2()
    }

    // this.addProduct();

  }

  lastStep(): void {
    this.isEditableProduct = true;
    this.stepper.next()
  }

  getProduct() {
    this.produitService.getProduitsAbonnements().subscribe(data => {
      this.products = data;
    });
  }

  _filterGroup(value: string): Produit[] {
    if (value) {
      return this.products
        .filter(group => group.reference, value);
    }

    return this.products;
  }
  loginClient(client) {

    this.zukex = client;
    this.addrForm.controls.nClientACTN.patchValue(client)
    this.addrForm.controls.nomRevendeur.patchValue(client.designation.split(' ')[0])
    this.inputUnFocused();
  }
  inputUnFocused() {
    this.hasFocusedInputChange.emit(false);
  }
  displayClientCode(client: any): string {
    return client ? client.code : '';
  }
  inputFocused() {
    this.hasFocusedInputChange.emit(true);
  }
  addProduct() {

    const form = this.fb.group({
      produit: ["", Validators.required],
      quantite: ["", Validators.required],
      nature: ["", Validators.required],
      periodefac: ["", Validators.required],
      datedeb: ["", Validators.required],
      actif: ["", Validators.required],
      ligne: [""],
      datedernierefact: [""]
    })
    this.formProductArray.push(form);
  }

  deleteLigne(index?: number) {

    if (index >= 0 && index < this.formProductArray.length) {

      this.formProductArray.splice(index, 1);

      // this.formProductArray.pop(index)

      // this.formProductArray.slice(index,1);
      // this.formProductArray.slice(0, index).concat(this.formProductArray.slice(index + 1));
      //this.formProductArray.splice(index,1)
    } else {
      this.formProductArray.pop()
    }
  }



  addrForm = this.fb.group({
    nDossier: ["", [Validators.required, Validators.maxLength(30), Validators.pattern(/^[a-zA-Z0-9 éèêàâîïÉÈÊÀÂÎÏÔôöÖòóÚúüÜÁáàÉéèÍíìÓóòÚúùÑñÇç'-]{1,30}$/)]],
    nClientACTN: ["", Validators.required],

    nomRevendeur: ["", [Validators.maxLength(30), Validators.pattern(/^[a-zA-Z0-9 éèêàâîïÉÈÊÀÂÎÏÔôöÖòóÚúüÜÁáàÉéèÍíìÓóòÚúùÑñÇç'-]{1,30}$/)]],
    mailRevendeur: ["", [Validators.required, Validators.maxLength(100), Validators.pattern(/^[a-zA-Z0-9 éèêàâîïÉÈÊÀÂÎÏÔôöÖòóÚúüÜÁáàÉéèÍíìÓóòÚúùÑñÇç.'-_]+@[a-z0-9.-]+\.[a-z]{1,100}$/)]],
    nDevisActn: ["", [Validators.maxLength(6), Validators.pattern(/^[0-9+_-]{1,6}$/)]],
    numeroLigne: ["", [Validators.maxLength(20), Validators.pattern(/^[0-9+_-]{1,20}/)]],
    // clientraisonsociale: ["", [Validators.maxLength(30), Validators.pattern(/^[a-zA-Z0-9 éèêàâîïÉÈÊÀÂÎÏ'-]{1,30}$/)]],
    telephoneRevendeur: ["", [Validators.maxLength(20), Validators.pattern(/^[0-9+_-]{1,20}/)]],
    nomClientFinal: ["", [Validators.required, Validators.maxLength(40), Validators.pattern(/^[a-zA-Z0-9 éèêàâîïÉÈÊÀÂÎÏÔôöÖòóÚúüÜÁáàÉéèÍíìÓóòÚúùÑñÇç'-]{1,40}$/)]],
    adresseClientFinal: ["", [Validators.maxLength(60), Validators.pattern(/^[a-zA-Z0-9 éèêàâîïÉÈÊÀÂÎÏÔôöÖòóÚúüÜÁáàÉéèÍíìÓóòÚúùÑñÇç'-]{1,60}$/)]],
    codePostal: ["", [Validators.maxLength(5), Validators.pattern(/^[0-9+_-]{1,5}$/)]],
    ville: ["", [Validators.maxLength(60), Validators.pattern(/^[a-zA-Z0-9 éèêàâîïÉÈÊÀÂÎÏÔôöÖòóÚúüÜÁáàÉéèÍíìÓóòÚúùÑñÇç'-]{1,60}$/)]],
    telephoneClientFinal: ["", [Validators.maxLength(20), Validators.pattern(/^[0-9+_-]{1,20}/)]],
    votreReference: ["", [Validators.maxLength(30), Validators.pattern(/^[a-zA-Z0-9 éèêàâîïÉÈÊÀÂÎÏÔôöÖòóÚúüÜÁáàÉéèÍíìÓóòÚúùÑñÇç'-]{1,30}$/)]],
    clientsiret: ["", [Validators.maxLength(14), siretValidator()]],
    services: ["", [Validators.maxLength(40), Validators.pattern(/^[a-zA-Z0-9 éèêàâîïÉÈÊÀÂÎÏÔôöÖòóÚúüÜÁáàÉéèÍíìÓóòÚúùÑñÇç'-]{1,40}$/)]],
    nRio: ["", [Validators.maxLength(20), Validators.pattern(/^[A-Z0-9 +]{5,20}$/)]],
    datePortabilite: ["",], //Validators.maxLength(10), Validators.pattern(/^[a-zA-Z0-9 éèêàâîïÉÈÊÀÂÎÏ'-]{1,10}$/)]
    heure: ["", [Validators.maxLength(6), Validators.pattern(/^[a-zA-Z0-9 éèêàâîïÉÈÊÀÂÎÏÔôöÖòóÚúüÜÁáàÉéèÍíìÓóòÚúùÑñÇç':-]{1,6}$/)]],
    login: ["", [Validators.maxLength(30), Validators.pattern(/^[a-zA-Z0-9 éèêàâîïÉÈÊÀÂÎÏÔôöÖòóÚúüÜÁáàÉéèÍíìÓóòÚúùÑñÇç ''@._+-]{1,30}$/)]],
    mdp: ["", [Validators.maxLength(30), Validators.pattern(/^[a-zA-Z0-9 éèêàâîïÉÈÊÀÂÎÏÔôöÖòóÚúüÜÁáàÉéèÍíìÓóòÚúùÑñÇç'-]{1,30}$/)]],
    IpPublique: ["", [
      Validators.maxLength(255),
      Validators.pattern(
        /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$|^([0-9A-Fa-f]{1,4}:){7}[0-9A-Fa-f]{1,4}$/
      )
    ]],
    nomDomaine: ["", [Validators.maxLength(200)]],
    nSecours: ["", [Validators.maxLength(20), Validators.pattern(/^[0-9+_-]{1,20}$/)]],
    /*  debutAbo: ["", [Validators.maxLength(10)]],
     finAbo: ["", [Validators.maxLength(10), Validators.pattern(/^[a-zA-Z0-9 éèêàâîïÉÈÊÀÂÎÏÔôöÖòóÚúüÜÁáàÉéèÍíìÓóòÚúùÑñÇç'-]{1,10}$/)]], */
    statutdemande: ["", [Validators.required]],
    statut: ["", [Validators.required]],
    commentaire: ["", [Validators.maxLength(200)]],//, Validators.pattern(/^[a-zA-Z0-9 éèêàâîïÉÈÊÀÂÎÏÔôöÖòóÚúüÜÁáàÉéèÍíìÓóòÚúùÑñÇç'-]{1,200}$/)
  });


  addrFormSaved = this.fb.group({
    nDossier: ["", [Validators.required, Validators.maxLength(30), Validators.pattern(/^[a-zA-Z0-9 éèêàâîïÉÈÊÀÂÎÏÔôöÖòóÚúüÜÁáàÉéèÍíìÓóòÚúùÑñÇç'-]{1,30}$/)]],
    nClientACTN: ["", Validators.required],

    nomRevendeur: ["", [Validators.maxLength(30), Validators.pattern(/^[a-zA-Z0-9 éèêàâîïÉÈÊÀÂÎÏÔôöÖòóÚúüÜÁáàÉéèÍíìÓóòÚúùÑñÇç'-]{1,30}$/)]],
    mailRevendeur: ["", [Validators.required, Validators.maxLength(100), Validators.pattern(/^[a-zA-Z0-9 éèêàâîïÉÈÊÀÂÎÏÔôöÖòóÚúüÜÁáàÉéèÍíìÓóòÚúùÑñÇç.'-_]+@[a-z0-9.-]+\.[a-z]{1,100}$/)]],
    nDevisActn: ["", [Validators.maxLength(6), Validators.pattern(/^[0-9+_-]{1,6}$/)]],
    numeroLigne: ["", [Validators.maxLength(20), Validators.pattern(/^[0-9+_-]{1,20}/)]],
    // clientraisonsociale: ["", [Validators.maxLength(30), Validators.pattern(/^[a-zA-Z0-9 éèêàâîïÉÈÊÀÂÎÏ'-]{1,30}$/)]],
    telephoneRevendeur: ["", [Validators.maxLength(20), Validators.pattern(/^[0-9+_-]{1,20}/)]],
    nomClientFinal: ["", [Validators.required, Validators.maxLength(40), Validators.pattern(/^[a-zA-Z0-9 éèêàâîïÉÈÊÀÂÎÏÔôöÖòóÚúüÜÁáàÉéèÍíìÓóòÚúùÑñÇç'-]{1,40}$/)]],
    adresseClientFinal: ["", [Validators.maxLength(60), Validators.pattern(/^[a-zA-Z0-9 éèêàâîïÉÈÊÀÂÎÏÔôöÖòóÚúüÜÁáàÉéèÍíìÓóòÚúùÑñÇç'-]{1,60}$/)]],
    codePostal: ["", [Validators.maxLength(5), Validators.pattern(/^[0-9+_-]{1,5}$/)]],
    ville: ["", [Validators.maxLength(60), Validators.pattern(/^[a-zA-Z0-9 éèêàâîïÉÈÊÀÂÎÏÔôöÖòóÚúüÜÁáàÉéèÍíìÓóòÚúùÑñÇç'-]{1,60}$/)]],
    telephoneClientFinal: ["", [Validators.maxLength(10), Validators.pattern(/^[0-9+_-]{1,20}/)]],
    votreReference: ["", [Validators.maxLength(30), Validators.pattern(/^[a-zA-Z0-9 éèêàâîïÉÈÊÀÂÎÏÔôöÖòóÚúüÜÁáàÉéèÍíìÓóòÚúùÑñÇç'-]{1,30}$/)]],
    clientsiret: ["", [Validators.maxLength(14), siretValidator()]],
    services: ["", [Validators.maxLength(40), Validators.pattern(/^[a-zA-Z0-9 éèêàâîïÉÈÊÀÂÎÏÔôöÖòóÚúüÜÁáàÉéèÍíìÓóòÚúùÑñÇç'-]{1,40}$/)]],
    nRio: ["", [Validators.maxLength(20), Validators.pattern(/^[A-Z0-9 +]{5,20}$/)]],
    datePortabilite: ["",], //Validators.maxLength(10), Validators.pattern(/^[a-zA-Z0-9 éèêàâîïÉÈÊÀÂÎÏ'-]{1,10}$/)]
    heure: ["", [Validators.maxLength(6), Validators.pattern(/^[a-zA-Z0-9 éèêàâîïÉÈÊÀÂÎÏÔôöÖòóÚúüÜÁáàÉéèÍíìÓóòÚúùÑñÇç'-:]{1,6}$/)]],
    login: ["", [Validators.maxLength(30), Validators.pattern(/^[a-zA-Z0-9 éèêàâîïÉÈÊÀÂÎÏÔôöÖòóÚúüÜÁáàÉéèÍíìÓóòÚúùÑñÇç ''@._+-]{1,30}$/)]],
    mdp: ["", [Validators.maxLength(30), Validators.pattern(/^[a-zA-Z0-9 éèêàâîïÉÈÊÀÂÎÏÔôöÖòóÚúüÜÁáàÉéèÍíìÓóòÚúùÑñÇç'-]{1,30}$/)]],
    IpPublique: ["", [
      Validators.maxLength(255),
      Validators.pattern(
        /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$|^([0-9A-Fa-f]{1,4}:){7}[0-9A-Fa-f]{1,4}$/
      )
    ]],
    nomDomaine: ["", [Validators.maxLength(200)]],
    nSecours: ["", [Validators.maxLength(20), Validators.pattern(/^[0-9+_-]{1,20}$/)]],
    /*  debutAbo: ["", [Validators.maxLength(10)]],
     finAbo: ["", [Validators.maxLength(10), Validators.pattern(/^[a-zA-Z0-9 éèêàâîïÉÈÊÀÂÎÏÔôöÖòóÚúüÜÁáàÉéèÍíìÓóòÚúùÑñÇç'-]{1,10}$/)]], */
    statutdemande: ["", [Validators.required]],
    statut: ["", [Validators.required]],
    commentaire: ["", [Validators.maxLength(200)]] //Validators.pattern(/^[a-zA-Z0-9 éèêàâîïÉÈÊÀÂÎÏÔôöÖòóÚúüÜÁáàÉéèÍíìÓóòÚúùÑñÇç'-]{1,200}$/)
  });

  handleChange() {
    this.checked = !this.checked;
  }

  addAClientSimple(pass?: boolean) {
    // type NClientACTNType = string | { code: string , designation:string};
    this.disabledBtn = true;

    if (this.checkFormValidity(this.addrForm)) {
      this.formErr = false;

      this.addAddressFormate()

      if (this.checked === true) {
        this.mailClient(this.addrForm.value.mailRevendeur);
      }


      if (this.mode == 'add') {
        this.addClientRequest('ADD', '0', pass)
      } else if (this.mode == 'edit') {
        this.addClientRequest('UPD', this.addrData.numero, pass)
      }

    } else {
      this.disabledBtn = false;
      this.formErr = true
      this.openSnackBar('Le formulaire contient une erreur', 'OK');
      this.submitForm(this.addrForm);
    }
  }

  fakeValue() {

    this.addrForm.setValue({
      nDossier: '11',
      nClientACTN: '11 zooooooozo',
      nomRevendeur: 'LUCASSSSSS',
      nomClientFinal: '111',

      numeroLigne: "0666666666666666",
      //    clientraisonsociale: 'this test name',
      mailRevendeur: '111@11.fr',
      nDevisActn: '11111',
      services: 'service',
      adresseClientFinal: 'adresseClientFinal',
      codePostal: '09100',
      ville: 'pamiers',
      telephoneRevendeur: '0674415256',
      telephoneClientFinal: '0674415256',
      votreReference: '1111',
      clientsiret: '11111111111111',
      nRio: '11111',
      datePortabilite: '1111',
      heure: '111',
      statutdemande: 'En attente',
      statut: 'En production',
      commentaire: 'commentaire',
      login: 'login',
      mdp: 'mdp',
      IpPublique: '9.255.255.255',
      nomDomaine: "zozo",
      nSecours: '1111',
      // debutAbo: '',//new Date('22062023').toISOString() https://stackoverflow.com/questions/55660262/how-can-i-set-my-reactive-form-date-input-value  electro
      //  finAbo: 'fin'
    })
  }
  ngAfterViewInit() {
    this.route.params.subscribe(params => {
      this.stepper.selectedIndex = Number(params['step']);
      this.cdr.detectChanges();
    });
    //Fonction pour complèter le champ en autocompletion nClientACTN (sa valeur = un client de la boite et on pré remplie des infos avec)
    this.getProduct();

    this.addrForm.controls['nClientACTN'].valueChanges.subscribe(searchString => {

      this.searching = searchString;
      this.predictionService.searchString = searchString;
    });
    this.predictionService.searchString$.pipe(takeUntil(this._destroy$)).subscribe(value => {

      if (this.searching !== value) {
        return
      } else {
        this.autoCompleteOptions$ = this.predictionService.getPredict(value);
        this.zukex = this.autoCompleteOptions$
        this.searching = value.toUpperCase();

      }

    })

  }

  submitForm(form: FormGroup) {

    if (form.invalid) {
      // Trouve le premier champ avec une erreurdans le form
      const invalidControl = this.getFirstInvalidControl();
      if (invalidControl) {
        this.renderer.selectRootElement(invalidControl).focus();
      }
      return;
    }



  }

  getFirstInvalidControl() {
    const controls = this.addrForm.controls;
    for (const key in controls) {
      if (controls[key].invalid) {
        return document.querySelector(`[formControlName="${key}"]`);
      }
    }
    return null;
  }
  start(mot: string): string {
    // verification de la recherche présente dans le mot
    if (mot.includes(this.searching)) {
      // découpage du mot pour ne renvoyer que le début (avant l'occurence de la recherche)
      return mot.slice(0, mot.indexOf(this.searching, 0));
    }
    else {
      // si la recherche n'est pas dans le mot (cas possible que lors d'une recherche reference/deignation),
      // la fonction start renvoie le mot et la fonction end renvoie la chaine vide afin de ne pas avoir de modification du mot
      return mot;
    }
  }
  // meme fonction qui permet de renvoyer la fin du mot
  end(mot: string): string {
    if (mot.includes(this.searching)) {
      return mot.slice(mot.indexOf(this.searching, 0) + this.searching.length);
    }
    else {
      // si la recherche n'est pas dans le mot (cas possible que lors d'une recherche reference/deignation),
      // la fonction start renvoie le mot et la fonction end renvoie la chaine vide afin de ne pas avoir de modification du mot
      return '';
    }
  }


  getClients() {
    return this.http
      .get(
        `${environment.apiUrl}/OnlyWanMaj.php`,
        {
          withCredentials: true, responseType: 'text',
          params: {
            mode: 'SEL'
          }
        }

      )
      .subscribe(
        (data) => {
          this.addrData = JSON.parse(data);

          this.addrData.forEach((val) => {
            if (val.numero == this.route.snapshot.params['id']) {
              this.addrData = val;
            }
          })
          this.zukex = this.addrData.client;
          this.preselectedValue = this.zukex
          this.clientActuel = this.addrData;//

          //this.revendeurActuel =  this.clientService.getOneClient(this.addrData.client)
          /*  this.clientService.getOneClient(this.addrData.client).subscribe(data=>{

              this.revendeurActuel = data[0]
            });
            */


          this.editStart(this.addrData);
          this.addrForm.patchValue({
            nDossier: this.addrForm.value.nDossier,
            nClientACTN: this.addrForm.value.nClientACTN, //+ ' ' + this.addrForm.value.clientraisonsociale,
            nomRevendeur: this.addrForm.value.nomRevendeur,
            numeroLigne: this.addrForm.value.numeroLigne,

            //clientraisonsociale:this.addrForm.value.clientraisonsociale,
            nomClientFinal: this.addrForm.value.nomClientFinal,
            mailRevendeur: this.addrForm.value.mailRevendeur,
            nDevisActn: this.addrForm.value.nDevisActn,
            services: this.addrForm.value.services,
            adresseClientFinal: this.addrForm.value.adresseClientFinal,
            codePostal: this.addrForm.value.codePostal,
            ville: this.addrForm.value.ville,
            telephoneRevendeur: this.addrForm.value.telephoneRevendeur,
            telephoneClientFinal: this.addrForm.value.telephoneClientFinal,
            votreReference: this.addrForm.value.votreReference,
            clientsiret: this.addrForm.value.clientsiret,
            nRio: this.addrForm.value.nRio,
            datePortabilite: this.addrForm.value.datePortabilite,
            heure: this.addrForm.value.heure,
            statutdemande: this.addrForm.value.statutdemande,
            statut: this.addrForm.value.statut,
            commentaire: this.addrForm.value.commentaire,
            login: this.addrForm.value.login,
            mdp: this.addrForm.value.mdp,
            IpPublique: this.addrForm.value.IpPublique,
            nomDomaine: this.addrForm.value.nomDomaine,
            nSecours: this.addrForm.value.nSecours,
            /*  debutAbo: this.addrForm.value.debutAbo,
             finAbo: this.addrForm.value.finAbo */

          })

          //  this. facturationProduct2();
          this.spin = false;
          this.loading = false;
        },
        (error) => {
          this.loading = false;
          this.spin = false;
        }
      );
  }


  openSnackBar(message: string, action: string) {
    this._snackBar.open(message, action, {
      duration: 5000,
      panelClass: ['custom-snackbar'],
    });
  }

  editStart(client) {
    this.addrForm.value.nDossier = client.dossier,
      this.addrForm.value.nClientACTN = client.client,
      this.addrForm.value.nomRevendeur = client.revendeurnom,
      this.addrForm.value.nomClientFinal = client.clientraisonsociale,
      this.addrForm.value.numeroLigne = client.numeroligne,
      this.addrForm.value.mailRevendeur = client.revendeurmail,
      this.addrForm.value.nDevisActn = client.devis,
      this.addrForm.value.services = client.services,
      this.addrForm.value.adresseClientFinal = client.clientadresse,
      this.addrForm.value.codePostal = client.clientcodepostal,
      this.addrForm.value.ville = client.clientville,
      this.addrForm.value.telephoneRevendeur = client.revendeurtel,
      this.addrForm.value.telephoneClientFinal = client.clienttel,
      this.addrForm.value.votreReference = client.clientreference,
      this.addrForm.value.clientsiret = client.clientsiret,
      this.addrForm.value.nRio = client.rio,
      this.addrForm.value.datePortabilite = client.dateportabiliteclient//this.patchDateValue(client.dateportabiliteclient),
    this.addrForm.value.heure = client.heureportabilite,
      this.addrForm.value.statutdemande = client.statutdemande,
      this.addrForm.value.statut = client.statut,
      this.addrForm.value.commentaire = client.commentaire,
      this.addrForm.value.login = client.login,
      this.addrForm.value.mdp = client.mdp,
      this.addrForm.value.IpPublique = client.ippublique,
      this.addrForm.value.nomDomaine = client.cdomaine,
      this.addrForm.value.nSecours = client.numsecours

    /* this.addrForm.value.debutAbo = this.patchDateValue(client.abodebut),
    this.addrForm.value.finAbo = client.abofin  */
  }

  isFormControl(control: AbstractControl): control is FormGroup {
    return control instanceof FormGroup;
  }

  checkFormValidity(form: FormGroup): boolean {
    let isValid = true;

    function checkControlValidity(control: FormGroup | any): void {
      if (control instanceof FormGroup) {
        Object.values(control.controls).forEach(checkControlValidity);
      } else {
        if (!control.valid) {
          isValid = false;
          control.markAsTouched(); // Mark the control as touched to show error messages
        }
      }
    }

    checkControlValidity(form);

    if (!isValid) {
      this.openSnackBar('Le formulaire contient une erreur', 'OK');

    }
    return isValid;
  }

  convertNumberToDate(number) {

    const excelDate = new Date((number - 25569) * 86400 * 1000);
    const day = excelDate.getDate().toString().padStart(2, '0');
    const month = (excelDate.getMonth() + 1).toString().padStart(2, '0');
    const year = excelDate.getFullYear().toString();
    const formattedDate = `${year}-${month}-${day}`;
    return formattedDate
  }



  addAddressFormate() {
    //On traite la data on elnvève on passe en maj pour etre clean dans la bdd,  si besoinshis.rmaService.removeAccentsAbonnements
    //On enelève les accents dans le futur enlever remove Accents quand ce sera bon pour la bdd :)
    let numClientAtcn: any;
    numClientAtcn = this.addrForm.value.nClientACTN
    //   const code = fb.nClientACTN?.code
    if (numClientAtcn?.code) {
      numClientAtcn = numClientAtcn.code
    }



    this.addrFormSaved.value.nDossier = this.rmaService.removeAccentsAbonnements(this.addrForm.value.nDossier).toUpperCase();
    this.addrFormSaved.value.nClientACTN = numClientAtcn// this.addrForm.value.nClientACTN;
    this.addrFormSaved.value.nomRevendeur = this.rmaService.removeAccentsAbonnements(this.addrForm.value.nomRevendeur).toUpperCase();
    this.addrFormSaved.value.nomClientFinal = this.rmaService.removeAccentsAbonnements(this.addrForm.value.nomClientFinal).toUpperCase();
    this.addrFormSaved.value.numeroLigne = this.addrForm.value.numeroLigne.toUpperCase();
    //this.addrFormSaved.value.clientraisonsociale = this.rmaService.removeAccentsAbonnements(this.addrForm.value.clientraisonsociale).toUpperCase();
    this.addrFormSaved.value.mailRevendeur = this.addrForm.value.mailRevendeur;
    this.addrFormSaved.value.nDevisActn = this.rmaService.removeAccentsAbonnements(this.addrForm.value.nDevisActn).toUpperCase();
    this.addrFormSaved.value.services = this.addrForm.value.services.toUpperCase();
    this.addrFormSaved.value.adresseClientFinal = this.rmaService.removeAccentsAbonnements(this.addrForm.value.adresseClientFinal).toUpperCase();
    this.addrFormSaved.value.codePostal = this.addrForm.value.codePostal.toUpperCase();
    this.addrFormSaved.value.ville = this.rmaService.removeAccentsAbonnements(this.addrForm.value.ville).toUpperCase();
    this.addrFormSaved.value.telephoneRevendeur = this.addrForm.value.telephoneRevendeur.toUpperCase();
    this.addrFormSaved.value.telephoneClientFinal = this.addrForm.value.telephoneClientFinal.toUpperCase();
    this.addrFormSaved.value.votreReference = this.rmaService.removeAccentsAbonnements(this.addrForm.value.votreReference).toUpperCase();
    this.addrFormSaved.value.clientsiret = this.addrForm.value.clientsiret;
    this.addrFormSaved.value.nRio = this.addrForm.value.nRio.toUpperCase();
    this.addrFormSaved.value.datePortabilite = this.addrForm.value.datePortabilite.toUpperCase();
    this.addrFormSaved.value.heure = this.addrForm.value.heure.toUpperCase();
    this.addrFormSaved.value.statutdemande = this.rmaService.removeAccentsAbonnements(this.addrForm.value.statutdemande).toUpperCase();
    this.addrFormSaved.value.statut = this.rmaService.removeAccentsAbonnements(this.addrForm.value.statut).toUpperCase();
    this.addrFormSaved.value.commentaire = this.rmaService.removeAccentsAbonnements(this.addrForm.value.commentaire).toUpperCase();
    this.addrFormSaved.value.login = this.addrForm.value.login;
    this.addrFormSaved.value.mdp = this.addrForm.value.mdp;
    this.addrFormSaved.value.IpPublique = this.addrForm.value.IpPublique;
    this.addrFormSaved.value.nomDomaine = this.rmaService.removeAccentsAbonnements(this.addrForm.value.nomDomaine).toUpperCase();
    this.addrFormSaved.value.nSecours = this.addrForm.value.nSecours.toUpperCase();

    /*  this.addrFormSaved.value.debutAbo = this.rmaService.removeAccentsAbonnements(this.addrForm.value.debutAbo).toUpperCase();
        this.addrFormSaved.value.finAbo = this.rmaService.removeAccentsAbonnements(this.addrForm.value.finAbo).toUpperCase();
     */

  }

  /**Fonction pour envoyer un mail au clien pour le tenir informer de l'etat de son dossier */
  mailClient(mail: string) {
    return this.http.get(`${environment.apiUrl}/mailAbonnements.php`, {
      withCredentials: true,
      responseType: 'text',
      params: {
        etat: this.addrFormSaved.value.statutdemande,

        nDossier: this.addrFormSaved.value.nDossier,
        client: this.addrFormSaved.value.nClientACTN,
        revendeur: this.addrFormSaved.value.nomRevendeur,
        mail: mail,
        telephoneRevendeur: this.addrFormSaved.value.telephoneRevendeur,

        clientnom: this.addrFormSaved.value.nomClientFinal,
        adresseClientFinal: this.addrFormSaved.value.adresseClientFinal,
        ville: this.addrFormSaved.value.ville,
        codePostal: this.addrFormSaved.value.codePostal,
        telephoneClientFinal: this.addrFormSaved.value.telephoneClientFinal,
        votreReference: this.addrFormSaved.value.votreReference,
        clientsiret: this.addrFormSaved.value.clientsiret,

        numeroLigne: this.addrFormSaved.value.numeroLigne,
        statutPortabilite: this.addrFormSaved.value.statut,
        nRio: this.addrFormSaved.value.nRio,
        datePortabilite: this.addrFormSaved.value.datePortabilite,
        heure: this.addrFormSaved.value.heure
      }
    }).subscribe();
  }


  /* Appel PHP avec la data formaté */
  addClientRequest(mode: string, numero, pass?: boolean) {
    this.disabledBtn = true;
    this.isEditable = true;
    this.isEditableProduct = true;

    return this.http
      .get<any[]>(`${environment.apiUrl}/OnlywanMaj.php`, {
        withCredentials: true,
        responseType: 'json',

        params: {
          mode: mode,
          numero: numero,
          client: this.addrFormSaved.value.nClientACTN,
          codePostal: this.addrFormSaved.value.codePostal,
          ville: this.addrFormSaved.value.ville,

          telephoneRevendeur: this.addrFormSaved.value.telephoneRevendeur,
          telephoneClientFinal: this.addrFormSaved.value.telephoneClientFinal,
          numeroLigne: this.addrFormSaved.value.numeroLigne,
          //    clientraisonsociale: this.addrFormSaved.value.clientraisonsociale,
          votreReference: this.addrFormSaved.value.votreReference,
          siret: this.addrFormSaved.value.clientsiret,
          dossier: this.addrFormSaved.value.nDossier,
          revendeur: this.addrFormSaved.value.nomRevendeur,
          clientnom: this.addrFormSaved.value.nomClientFinal,
          revendeurmail: this.addrFormSaved.value.mailRevendeur,
          devis: this.addrFormSaved.value.nDevisActn,
          services: this.addrFormSaved.value.services,
          adresseClientFinal: this.addrFormSaved.value.adresseClientFinal,
          rio: this.addrFormSaved.value.nRio,
          dateportabiliteclient: this.addrFormSaved.value.datePortabilite,
          heureportabilite: this.addrFormSaved.value.heure,
          statutdemande: this.addrFormSaved.value.statutdemande,
          statut: this.addrFormSaved.value.statut,
          commentaire: this.addrFormSaved.value.commentaire,
          login: this.addrFormSaved.value.login,
          mdp: this.addrFormSaved.value.mdp,
          ippublique: this.addrFormSaved.value.IpPublique,
          domaine: this.addrFormSaved.value.nomDomaine,
          numsecours: this.addrFormSaved.value.nSecours,
          /*abodebut: this.addrFormSaved.value.debutAbo,
            abofin: this.addrFormSaved.value.finAbo */
        }
      })
      .subscribe((data) => {

        this.disabledBtn = false

        /* if (pass == true) { */
        this.isEditable = true;
        this.isEditableProduct = true;
        if (this.mode == 'add') {
          this.addrData.numero = data[0].numero;
        }
        this.stepper.next();
        this.router.navigate(['/abonnements/editer-utilisateur/' + this.addrData.numero + '/1']);
        this.openSnackBar('La tâche a été accomplie avec succès', 'OK');
        this.loading = false;
        return
        //}
        /*
         if (this.mode == 'add' && pass == undefined) {
           this.openSnackBar('Votre dossier a été créé avec succès.', 'OK');
           this.isEditable = true;
           this.isEditableProduct = true;
           this.router.navigate(['/abonnements/'])
           //this.router.navigate(['/abonnements/'])

         } else {
           this.openSnackBar('Votre dossier a été mis a jour.', 'OK');
           this.pass();
          // this.router.navigate(['/abonnements/'])
         } */


        // this.router.navigate(['/abonnements/'])

      })

  }

  /*
  pass() {
    this.isEditable = true
    this.isEditableProduct = true

    this.stepper.next();
    // this.isEditable = false
  }
    */

  areAllFormsValid() {
    return this.formProductArray.every(form => form.valid);
  }

  getFirstInvalidControlProduit(index: number) {
    const controls = this.formProductArray[index];
    for (const key in controls) {
      if (controls[key].invalid) {
        return document.querySelector(`[formControlName="${key}"]`);
      }
    }
    return null;
  }


  async sendAll() {
    this.disabledBtn = true
    const promises = [];

    for (let i = 0; i < this.formProductArray.length; i++) {
      if (!this.formProductArray[i].valid) {
        this.openSnackBar('Erreur dans le formulaire', 'Fermer');
        return;
        //  throw new Error('Formulaire invalide');

      }
      promises.push(this.facturationProduct(i));
    }

    try {
      await Promise.all(promises);
      this.disabledBtn = false
      this.openSnackBar('Le dossier à été mis à jour', 'Fermer');
      this.router.navigate(['/abonnements']);
    } catch (error) {
      this.disabledBtn = false;
      this.openSnackBar('Une erreur s\'est produite', 'Fermer');
      throw error;
    }
  }
  getCurrentClient(client: string) {

  }

  /* Appel PHP OnlywanMajDetail avec la data formaté pour le produit  produit: string,quantite: string,nature:string,periodefac:string,datedeb:string*/
  facturationProduct(index: number): Promise<any> {
    return new Promise((resolve, reject) => {
      if (this.checkFormValidity(this.formProductArray[index])) {
        const factForm = this.formProductArray[index];
        if (!factForm) {
          reject('Le formulaire n\'existe pas');
          return;
        }

        const numero = this.route.snapshot.params['id'];
        const produit = factForm.value.produit;
        const quantite = factForm.value.quantite;
        const nature = factForm.value.nature;
        const periodefac = factForm.value.periodefac;
        const datedeb = factForm.value.datedeb;
        const datedernierefact = factForm.value.datedernierefact;
        const actif = factForm.value.actif;
        let mode = 'ADD'
        const paramsObject: MyParams = {
          mode: mode,
          numero: numero,
          produit: produit,
          quantite: quantite,
          nature: nature,
          periode: periodefac,
          datedeb: datedeb,
          datedernierefact: datedernierefact,
          marque: 'ONLY',
          actif: actif
        };

        if (factForm.value.ligne) {
          paramsObject.mode = 'UPD';
          paramsObject.ligne = factForm.value.ligne;
        }
        const params = new HttpParams({ fromObject: paramsObject });

        this.http
          .get<any[]>(`${environment.apiUrl}/OnlywanMajDetail.php`, {
            withCredentials: true,
            responseType: 'json',
            params: params
          })
          .toPromise()
          .then((data) => {

            resolve(data);
          })
          .catch((error) => {
            reject(error);
          });
      } else {
        reject('Le formulaire n\'est pas valide');
      }
    });
  }

  deleteProduct(index: number) {
    const factForm = this.formProductArray[index]; // Récupérez le formulaire correspondant à l'index
    if (!factForm) {
      // Gérez l'erreur si le formulaire n'existe pas
      return '';
    }

    return this.http
      .get(`${environment.apiUrl}/OnlywanMajDetail.php`, {
        withCredentials: true,
        responseType: 'json',
        params: {
          mode: 'DEL',
          ligne: factForm.value.ligne,

          numero: this.route.snapshot.params['id']
        }
      })
      //On supp le produit
      .subscribe((data) => {

        this.openSnackBar('Le produit a été supprimé avec succès.', 'OK');
        this.deleteLigne(index)

      })

  }


  facturationProduct2() {
    return this.http
      .get<any[]>(`${environment.apiUrl}/OnlywanMajDetail.php`, {
        withCredentials: true,
        responseType: 'json',
        params: {
          mode: 'SEL',

          numero: this.route.snapshot.params['id']
        }
      })
      //On get les produit puis on fait 1 form par formulaires
      .subscribe((data) => {
        this.dataArray = data;
        let i = 0
        data.forEach((e) => {
          this.addProduct()

          this.formProductArray[i].patchValue({
            produit: e.produit,
            quantite: e.quantite,
            nature: e.nature,
            periodefac: e.periodefac,
            datedeb: e.datedeb, //this.patchDateValue2(
            actif: e.actif,
            ligne: e.ligne,
            datedernierefact: e.datedernierefact,
          })
          //this.formProductArray[i].push(form);

          i++

        })


      })


  }

  copyText(textToCopy: string) {
    const selBox = document.createElement("textarea");
    selBox.style.position = "fixed";
    selBox.style.left = "0";
    selBox.style.top = "0";
    selBox.style.opacity = "0";
    selBox.value = textToCopy;
    document.body.appendChild(selBox);
    selBox.focus();
    selBox.select();
    document.execCommand("copy");
    document.body.removeChild(selBox);
    this.openSnackBar('Copié.', 'OK');
  }

  openDeletePopup(): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: { message: 'Êtes-vous sûr de vouloir supprimer cet abonnement ?' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.deleteClient(this.clientActuel.numero, this.clientActuel.nDossier);
      }
    });
  }

  deleteClient(numero: string, nDossier: string) {
    this.http.get(`${environment.apiUrl}/OnlywanMaj.php`, {
      withCredentials: true,
      params: {
        mode: 'DEL',
        numero: numero,
        dossier: nDossier
      }
    }).subscribe(() => {
      this.router.navigateByUrl('/abonnements');
    });
  }
}

interface MyParams {
  mode: string;
  numero: any;
  produit: any;
  quantite: any;
  nature: any;
  periode: any;
  datedeb: string;
  datedernierefact: string;
  marque: string;
  actif: any;
  ligne?: any; // Make 'ligne' an optional property
  [key: string]: string | number | boolean | undefined;
}
