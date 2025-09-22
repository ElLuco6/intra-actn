import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {ProspectService} from "@services/prospect.service";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {DatePipe} from "@angular/common";
import {forkJoin} from "rxjs";
import {Contact} from "@models/contact";
import {VisiteService} from "@services/visite.service";
import {FonctionUser} from "@models/fonctionUser";

@Component({
  selector: 'app-prospect-detail',
  templateUrl: './prospect-detail.component.html',
  styleUrl: './prospect-detail.component.scss'
})
export class ProspectDetailComponent {

  prospect: any;
  idProspect: number = this.route.snapshot.params['id'];
  maxDate: Date;
  disabled: boolean = false;
  contactsList: Contact[] = [];
  popUpModif: boolean = false;
  siretNumber: number = Number(this.idProspect);
  func: FonctionUser[] = [];
  groupement: any[] = [];

  formUpdateProspect: FormGroup;
  reportsIsfilledOrNot: boolean = false;
  contactIsfilledOrNot: boolean = false;
  popupDeleteProspect: boolean = false;
  forbiddenDelete: boolean = false;

  constructor(protected route: ActivatedRoute,
              protected prospectService: ProspectService,
              protected visite: VisiteService,
              private fb: FormBuilder,
              private datePipe: DatePipe,
              private router: Router) {


    this.maxDate = new Date();
    let getProspect$ = this.prospectService.getProspect(this.idProspect);
    let getContact$ = this.visite.getContacts(Number(this.idProspect));
    let getFunc$ = this.prospectService.getFunc();
    let getGrp$ = this.prospectService.getGroupement();

    forkJoin([getProspect$, getContact$, getFunc$, getGrp$]).subscribe(
      ([prospects, contacts, func, grp]) => {
        this.prospect = prospects[0];
        this.prospect.daterecrutement = this.formateDate(this.prospect.anneerecrutement);
        this.prospect.daterecrutement = this.formateDate(this.prospect.daterecrutement);
        this.groupement = grp;
        this.contactsList = contacts;
        this.func = func;
        this.formUpdateProspect = this.fb.group({
          numSiret: [this.prospect.siret, [Validators.required, Validators.maxLength(14), Validators.minLength(9), Validators.pattern(/^[0-9]{9,14}$/)]],
          nomSociete: [this.prospect.nom, Validators.required],
          adresse: this.prospect.adresse1,
          numTelephone: [this.prospect.telephone, [Validators.maxLength(15), Validators.pattern(/^[0-9+_-]{1,15}$/)]],
          nom: this.prospect.contactnom,
          prenom: this.prospect.contactprenom,
          fonction: this.prospect.fonction,
          mail: this.prospect.contactmail,
          numApe: this.prospect.ape,
          origine: this.prospect.origine,
          dateRecrutement: this.prospect.daterecrutement, // Si seulement on avait écris le format de date qu'on allez utilisez sur tous le site au hasard sur le tableau, A BA IL A DISPAUT MONSIEUR MACRON
          region: [this.prospect.region, Validators.required],
          siteWeb: this.prospect.siteweb,
          departement: this.prospect.departement,
          codePostal: [this.prospect.codepostal, [Validators.required, Validators.maxLength(5), Validators.pattern(/^[0-9]{5}$/)]],
          ville: [this.prospect.ville, [Validators.required, Validators.maxLength(30), Validators.pattern(/^[a-zA-Z0-9 éèêàâîïÉÈÊÀÂÎÏ'-]{1,30}$/)]],
          qualite: this.prospect.qualite,
          interlocuteur: this.prospect.origine,
          ste: this.prospect.status,
          activite: this.prospect.activite,
          commentaire: this.prospect.commentaire,
          numprospect: this.idProspect, //pas ouf voir a term pour avoir this.prospect.numprospect pour l'instant c pas alimenter,
          groupe: this.prospect.groupe
        })
      }
    );

  }

  changeDateFormat(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${day}-${month}-${year}`;
  }

  formateDate(date: any): any {
    let parts = date.split('-');
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  }

  onReportsListFilled(isFilled: boolean) {
    this.reportsIsfilledOrNot = isFilled;
  }

  onContactListFilled(isFilled: boolean) {
    this.contactIsfilledOrNot = isFilled;
  }

  openDeleteProspectPopup() {
    if (!this.contactIsfilledOrNot) {
      this.popupDeleteProspect = true;
    } else {
      this.forbiddenDelete = true;
    }
  }

  deleteProspect() {
    this.prospectService.delProspect(this.idProspect).subscribe(() => {
      this.router.navigate(['/espace-commercial/prospects'])
    });
  }

  updateProspect() {
    this.formUpdateProspect.value.dateRecrutement = this.datePipe.transform(new Date(this.formUpdateProspect.value.dateRecrutement), 'yyyy-MM-dd');
    this.prospectService.updProspect(this.formUpdateProspect).subscribe(() => {
      // Refresh the prospect list after adding
      this.prospectService.getProspect(this.idProspect).subscribe(
        (prospects) => {
          this.prospect = prospects[0];
          this.popUpModif = false;
        })
    });
  }
}
