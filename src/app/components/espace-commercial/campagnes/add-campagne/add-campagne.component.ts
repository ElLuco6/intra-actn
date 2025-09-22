import { Component } from '@angular/core';
import {CampagnesService} from "@services/campagnes.service";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {Router} from "@angular/router";
import {AuthenticationService} from "@services/authentication.service";

@Component({
  selector: 'app-add-campagne',
  templateUrl: './add-campagne.component.html',
  styleUrl: './add-campagne.component.scss'
})
export class AddCampagneComponent {

  campagneForm: FormGroup;

  constructor(private campagnesService: CampagnesService, private formBuilder: FormBuilder, private router: Router) {
    this.campagneForm = this.formBuilder.group({
      campagne: ['', Validators.required],
      libelle: ['', Validators.required],
      datedeb: [''],
      datefin: [''],
      user1: [''],
      user2: [''],
      user3: [''],
      user4: [''],
      texte: ['']
    });
  }

  addCampagne() {
    if (this.campagneForm.valid) {
      this.campagneForm.value.datefin = this.convertDate(this.campagneForm.value.datefin);
      if (this.campagneForm.value.datedeb === '') {
        this.campagneForm.value.datedeb = new Date();
      }
      this.campagneForm.value.datedeb = this.convertDate(this.campagneForm.value.datedeb);
      this.campagneForm.value.campagne = this.campagneForm.value.campagne
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, '')
        .toUpperCase();
      this.campagnesService.addCampagne(this.campagneForm.value).subscribe(() => {
        this.router.navigate(['/espace-commercial/campagne/' + this.campagneForm.value.campagne]);
      });
    }
  }

  convertDate(dateToConvert){
    let date = new Date(dateToConvert);
    let day = date.getDate().toString().padStart(2, '0');
    let month = (date.getMonth() + 1).toString().padStart(2, '0');
    let year = date.getFullYear();

    return `${day}/${month}/${year}`;
  }
}
