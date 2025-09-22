import {AfterViewInit, Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {Contact} from "@models/contact";
import {MatTableDataSource} from "@angular/material/table";
import {MatSort} from "@angular/material/sort";
import {FormBuilder, FormControl, Validators} from "@angular/forms";
import {UserService} from "@services/user.service";
import {LogClientService} from "@services/log-client.service";
import {Router} from "@angular/router";
import {FonctionUser} from "@models/fonctionUser";
import {faCalendarAlt} from "@fortawesome/free-solid-svg-icons";

@Component({
  selector: 'app-list-users-contacts',
  templateUrl: './list-users-contacts.component.html',
  styleUrls: ['./list-users-contacts.component.scss']
})
export class ListUsersContactsComponent implements OnInit, AfterViewInit{

  /** Liste des contacts à afficher */
  @Input() contactList: Contact[] = [];
  @Input() isProspect: boolean = false;
  /** Colonnes qui vont êtres affichées */
  columns: string[] = ['nom', 'mail', 'telephone', 'fixe', 'identifiant', 'role', 'commande','fonction', 'servicelib', 'mailing', 'action'];
  columnsProspect: string[] = ['nom', 'mail', 'telephone', 'fixe', 'role', 'commande','fonction', 'servicelib', 'mailing', 'action'];

  /** Formate la data pour que material puisse l'utiliser */
  dataSource;

  /** Initialise le sort de material */
  @ViewChild(MatSort) sort: MatSort;
  @Output() contactListChanged: EventEmitter<boolean> = new EventEmitter<boolean>();
  /** Boolean qui indique si pop up ajout est active */
  addCont: boolean = false;

  /** Boolean qui indique si pop up update est active */
  updtCont: boolean = false;

  /** ID du client connecté ou consulté */
  @Input() idClient: number;

  /** Numéro d'identification d'un user web */
  idIndividu: number;

  /** Savoir ou je suis zbi */
  url: string;

  /** Permet de savoir si on le change en user web ou pas */
  userWebTransform: boolean = false;

  /** Liste des fonctions affectable à un contact */
  fonction: FonctionUser[] = [];

  /** Listes des services et de leurs acronymes */
  listService: any[] = [];

  individu: Contact;

  constructor(private fb: FormBuilder,
              private userService: UserService,
              private router: Router,
              private authClient: LogClientService) { }

  /** Formulaire d'inscription d'un contact */
  contForm = this.fb.group({
    nom: ['', [Validators.required, Validators.maxLength(40)]],
    mail: ['', [Validators.required, Validators.maxLength(70), Validators.email]],
    gsm: ['', [Validators.maxLength(15), Validators.pattern(/^[0-9+_-]+$/)]],
    fixe: ['', [Validators.maxLength(15), Validators.pattern(/^[0-9+_-]+$/)]],
    mailing: [true, []], // forcé a true demande de eric pose aps de question
    fonctioncode: ['', []],
    service: ['', []], //sry théo rico a dit que ct pas obligatoire
    role: false,
    commande: 'N',
  });

  /** Formulaire de modification d'un contact */
  contFormUpdt = this.fb.group({
    nom: ['', [Validators.required, Validators.maxLength(40)]],
    mail: ['', [Validators.required, Validators.maxLength(70), Validators.email]],
    gsm: ['', [Validators.maxLength(15), Validators.pattern(/^[0-9+_-]+$/)]],
    fixe: ['', [Validators.maxLength(15), Validators.pattern(/^[0-9+_-]+$/)]],
    mailing: [true, []],
    fonctioncode: ['', []],
    service: ['', []],
    role: false,
    commande: ''
  });

  /** Form pour ajouter un utilisateur web */
  webForm = this.fb.group({
    id: ['', Validators.required],
    mdp: ['', Validators.required]
  })

  ngOnInit() {

    if(!this.isProspect){
      this.contForm.get('service').setValidators(Validators.required);
    }

    this.dataSource = new MatTableDataSource(this.contactList);
    this.url = this.router.url.split('?', 5)[0];

    /** Va chercher les services et remplis une array */
    this.userService.services.subscribe((data) => {
      data.forEach((d) => {
        if(d.argument != '' && d.argument != ' '){
          this.listService.push(d);
        }
      });
    });
    /** Va chercher les fontcions et remplis une array */
    this.userService.functionUser.subscribe((data) => {
      data.forEach((d) => {
        if(d.argument != '' && d.argument != ' '){
          this.fonction.push(d);
        }
      });
    });
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
    this.contactListChanged.emit(this.dataSource.data != 0);
  }

  /** Créer un contact */
  createCont() {
    if(this.contForm.valid){
      this.userService.addClients(this.contForm, this.webForm, this.idClient, this.isProspect).subscribe(
        () => {
          this.contactList = [];
          this.refresh();
          this.userWebTransform = false;
        }
      );
    }
  }

  /** Modifie un contact */
  onUpdtCont(){
    if(this.contFormUpdt.valid && (this.contFormUpdt.touched || this.webForm.touched)){
      this.userService.updtClients(this.contFormUpdt, this.webForm, this.idIndividu, this.idClient, this.isProspect).subscribe(
          (data) => {
              this.refresh();
              this.userWebTransform = false;
          }
      )
    }
  }

  /** Refresh la list */
  refresh() {
    this.userService.getContact(this.idClient, this.isProspect).subscribe(
      (data) => {
        this.contactListChanged.emit(data.length != 0);
        this.dataSource = new MatTableDataSource(data);
      }
    );
  }

  /** Récupère les infos de la ligne cliquée pour remplir le formulaire de modif */
  updtContSetUp(row){
    this.updtCont = true
    this.idIndividu = row.numindividu;
    this.individu = row;
    if(row.identifiant != ''){
      this.userWebTransform = true;
    }

    let serviceAcro = this.getAcronym(row.servicelib);

    this.contFormUpdt.reset();
    this.contFormUpdt.setValue({
      nom: row.nom,
      mail: row.mail,
      fixe: row.telephone,
      gsm: row.contactgsm,
      mailing: row.mailing === 'O',
      fonctioncode: row.fonction.substring(0, 3),
      service: serviceAcro,
      role: row.role === 'A',
      commande: row.droitcommande
    });
    this.webForm.reset();
    this.webForm.setValue({
      id: row.identifiant,
      mdp: ''
    })
  }

  getAcronym(service: string): string {
    const foundService = this.listService.find((d) => d.libelle === service);

    if (foundService) {
      return foundService.argument;
    } else {
      return '';
    }
  }

  /** Supprime un contact */
  supprCont(mail){
    if(this.isProspect){
      this.userService.supprProspect(mail, this.idClient).subscribe(ret => {
        if (ret) {
          this.refresh();
        }
      });
    }else{
      this.userService.supprClients(this.idIndividu, this.idClient).subscribe(ret => {
        if (ret) {
          this.refresh();
        }
      });
    }

  }

  condSuppr(): boolean{
    if(this.individu.identifiant.length == 0) {
      if(this.individu.service != 'COMPTABILITE'){
        return this.individu.service != 'RECEPT° FACTURE NUMERIQUE';
      }else{
        return false;
      }
    } else {
      return false;
    }
  }

  close() {
    if(this.addCont){
      if(this.contForm.valid){
        this.addCont = false;
        this.userWebTransform = false;
      }
    } else {
      if(this.contFormUpdt.valid){
        this.updtCont = false;
        this.userWebTransform = false;
      }
    }
  }

  cleanAddForm(){
    this.contForm.setValue({
      nom: '',
      mail: '',
      service: '',
      gsm: '',
      fonctioncode: '',
      mailing: true,
      role: false,
      commande: '',
      fixe: ''
    });
  }

  changePswrd(){
    this.userService.changePass(this.individu.mail).subscribe(() => {});
  }

  protected readonly faCalendarAlt = faCalendarAlt;
}
