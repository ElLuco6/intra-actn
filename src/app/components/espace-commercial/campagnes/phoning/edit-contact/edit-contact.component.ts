import { Contact } from '@/models/contact';
import { FonctionUser } from '@/models/fonctionUser';
import { UserService } from '@/services/user.service';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-edit-contact',
  templateUrl: './edit-contact.component.html',
  styleUrl: './edit-contact.component.scss'
})
export class EditContactComponent implements OnInit {
  listService: any[] = [];

  fonction: FonctionUser[] = [];

  contactForm = this.fb.group({
    nom: ['', [Validators.required, Validators.maxLength(40)]],
    mail: ['', [Validators.required, Validators.maxLength(70), Validators.email]],
    gsm: ['', [Validators.maxLength(15), Validators.pattern(/^[0-9+_-]+$/)]],
    fixe: ['', [Validators.maxLength(15), Validators.pattern(/^[0-9+_-]+$/)]],
    fonctioncode: ['', []],
    service: [''],
    mailing: [true, []],
    role: false,
    commande: 'N'
  });

  webForm = this.fb.group({
    id: ['', Validators.required],
    mdp: ['', Validators.required]
  });

  constructor(private userService: UserService, private fb: FormBuilder,
    public dialogRef: MatDialogRef<EditContactComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {
      idClient: number,
      isProspect: boolean,
      idCampagne: number,
      mode: 'add' | 'edit',
      oldContact?: Contact
    },
  ) { }

  ngOnInit() {
    this.userService.services.subscribe((data) => {
      data.forEach((d) => {
        if (d.argument != '' && d.argument != ' ') {
          this.listService.push(d);
        }
      });
    });

    this.userService.functionUser.subscribe((data) => {
      data.forEach((d) => {
        if (d.argument != '' && d.argument != ' ') {
          this.fonction.push(d);
        }
      });
    });

    if (this.data.mode === 'edit') {
      this.contactForm.get('mail')?.disable();
      this.fillForm(this.data.oldContact);
    }
  }

  fillForm(contact) {
    this.contactForm.patchValue({
      nom: contact.nom,
      mail: contact.mail,
      fonctioncode: contact.fonctioncode,
      service: contact.service,
      mailing: contact.mailing === 'O',
      gsm: contact.gsm,
      fixe: contact.fixe,
    });
  }

  createContact() {
    if (this.contactForm.valid) {
      if(this.data.idCampagne) {
        this.userService.addClients(this.contactForm, this.webForm, this.data.idClient, this.data.isProspect, this.data.idCampagne).subscribe();
      } else {
        this.userService.addClients(this.contactForm, this.webForm, this.data.idClient, this.data.isProspect).subscribe();
      }
      this.dialogRef.close({ contactForm: this.contactForm.value, webForm: this.webForm.value });
    }
  }

  updateContact() {
    if (this.contactForm.valid) {
      this.contactForm.get('mail')?.enable();
      this.userService.updtClients(this.contactForm, this.webForm, Number(this.data.oldContact.numindividu), this.data.idClient, this.data.isProspect).subscribe();
      this.dialogRef.close({ contactForm: this.contactForm.value, webForm: this.webForm.value });
    }
  }
}
