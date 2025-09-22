import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {Contact} from "@models/contact";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {Campagne} from "@models/campagne";
import {Action} from "@models/action";
import {CampagnesService} from "@services/campagnes.service";

@Component({
  selector: 'app-phoning-comm-dialog',
  templateUrl: './phoning-comm-dialog.component.html',
  styleUrl: './phoning-comm-dialog.component.scss'
})
export class PhoningCommDialogComponent {

  maxDate: Date = new Date();
  numPeople: string;
  campagne: Campagne;
  actions: Action[] = [];
  people: Contact;
  type: string;
  compteRenduForm: FormGroup;

  constructor(@Inject(MAT_DIALOG_DATA) public data: any,
              public dialogRef: MatDialogRef<PhoningCommDialogComponent>,
              private campagneService: CampagnesService) {
    this.numPeople = data['numPeople'];
    this.campagne = data['campagne'];
    this.actions = data['actions'];
    this.people = data['people'];
    this.type = data['type'];
    this.compteRenduForm = new FormGroup({
      date: new FormControl({value: new Date(), disabled: true}),
      commentaire: new FormControl('', Validators.required),
      action: new FormControl('', Validators.required),
      numPeople: new FormControl(data['numPeople'])
    });
  }

  onSubmit() {
    if (this.people) {
      this.register(this.people.nom, this.people.mail, this.people.gsm);
    } else {
      this.campagneService.getPeopleByCampaign(this.campagne.campagne).subscribe((people) => {
        this.campagneService.groupContacts(people).forEach((person) => {
          if (person.numero === this.numPeople) {
            person.contacts.forEach((contact) => {
              this.register(contact.nom, contact.mail, contact.gsm);
            })
          }
        })
      })
    }

  }

  register(nom: string, mail: string, gsm: string) {
    const infosContact = {
      numclient: this.numPeople,
      campagne: this.campagne.campagne,
      nom: nom,
      mail: mail,
      tel: gsm
    }
    if (this.compteRenduForm.valid) {
      this.campagneService.addCompteRenduClient(infosContact, this.compteRenduForm, this.type == 'C').subscribe(() => {
        this.dialogRef.close();
      });
    }
  }

  onNoClick(): void {
    this.dialogRef.close();
  }
}
