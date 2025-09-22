import { PeopleOfCampaign } from '@/models/peopleOfCampaign';
import { ClientsService } from '@/services/clients.service';
import { ProspectService } from '@/services/prospect.service';
import { VisiteService } from '@/services/visite.service';
import { DatePipe } from '@angular/common';
import { Component, Inject, Input, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-modif-infos-societe',
  templateUrl: './modif-infos-societe.component.html',
  styleUrl: './modif-infos-societe.component.scss'
})
export class ModifInfosSocieteComponent implements OnInit {
  societe;
  formUpdateProspect;
  maxDate: Date;
  prospect;
  contactsList;
  func;
  groupement;

  constructor(
    public dialogRef: MatDialogRef<ModifInfosSocieteComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { societe: PeopleOfCampaign },
    private clientsService: ClientsService,
    protected prospectService: ProspectService,
    protected visite: VisiteService,
    private fb: FormBuilder,
    private datePipe: DatePipe
  ) { }

  ngOnInit(): void {
    if (this.data.societe.type === 'C') {
      this.clientsService.getClient(this.data.societe.numero).subscribe((client) => {
        this.societe = client[0];
      });
    } else {
      this.prospectService.getProspect(Number(this.data.societe.numero)).subscribe((prospect) => {
        this.societe = prospect[0];
        this.fillFormUpdateProspect();
      });
    }

  }

  fillFormUpdateProspect() {
    this.maxDate = new Date()

    let getProspect$ = this.prospectService.getProspect(this.societe.numprospect);
    let getContact$ = this.visite.getContacts(Number(this.societe.numprospect));
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
          dateRecrutement: this.prospect.daterecrutement,
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
          numprospect: this.societe.numprospect,
          groupe: this.prospect.groupecode
        })
      }
    );
  }

  updateProspect() {
    this.formUpdateProspect.value.dateRecrutement = this.datePipe.transform(new Date(this.formUpdateProspect.value.dateRecrutement), 'yyyy-MM-dd');
    this.prospectService.updProspect(this.formUpdateProspect).subscribe();
    this.dialogRef.close(this.formUpdateProspect.value);
  }

  formateDate(date: any): any {
    let parts = date.split('-');
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  }

}
