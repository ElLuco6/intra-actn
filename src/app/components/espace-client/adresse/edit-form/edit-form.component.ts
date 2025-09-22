import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {ActivatedRoute, Router} from "@angular/router";
import {AdresseService} from "@services/adresse.service";
import {RmaService} from "@services/rma.service";
import {shareReplay} from "rxjs/operators";
import {AuthenticationService} from "@services/authentication.service";

@Component({
  selector: 'app-edit-form',
  templateUrl: './edit-form.component.html',
  styleUrls: ['./edit-form.component.scss']
})
export class EditFormComponent implements OnInit {

  constructor(
    private rmaService: RmaService,
    public authService: AuthenticationService,
    public adresseService: AdresseService,
    private route: ActivatedRoute
  ) { }

  pays$ = null;
  editForm: FormGroup;
  addressName = '';

  ngOnInit(): void {
    this.pays$ = this.adresseService.getCountries().pipe(shareReplay(1));
    this.getAddress();
  }

  getAddress() {
    this.adresseService.adressesList$.subscribe((d) => {
      const adresse = d.find((d) => d.codeadresse == this.route.snapshot.params['id']);
      this.addressName = adresse.nom;
      this.editForm = new FormGroup({
        idAddr: new FormControl(adresse.codeadresse),
        nomAddr: new FormControl(adresse.nom, [Validators.required, Validators.maxLength(40), Validators.pattern(/^[a-zA-Z0-9 éèêàâîïÉÈÊÀÂÎÏ'-]{1,40}$/)]),
        addr1: new FormControl(adresse.adresse1, [Validators.required, Validators.maxLength(30), Validators.pattern(/^[a-zA-Z0-9 éèêàâîïÉÈÊÀÂÎÏ'-]{1,30}$/)]),
        addr2: new FormControl(adresse.adresse2, [Validators.maxLength(30), Validators.pattern(/^[a-zA-Z0-9 éèêàâîïÉÈÊÀÂÎÏ'-]{1,30}$/)]),
        codePostal: new FormControl(adresse.codepostal, [Validators.required, Validators.maxLength(5), Validators.pattern(/^[0-9]/)]),
        ville: new FormControl(adresse.ville, [Validators.required, Validators.maxLength(26), Validators.pattern(/^[a-zA-Z0-9 éèêàâîïÉÈÊÀÂÎÏ'-]{1,26}$/)]),
        telephone: new FormControl(adresse.phone, [Validators.required, Validators.maxLength(15), Validators.pattern(/^[0-9+_-]{1,15}$/)]),
        pays: new FormControl('FR', Validators.required),
        defaut: new FormControl(adresse.defaut)
      });
    });
  }

  editAddress() {
    if(this.editForm.valid){
      const formattedAddress = this.formatAddressFields(this.editForm.value);
      this.adresseService.editAddressRequest(formattedAddress);
    }
  }

  formatAddressFields(formValues: any) {
    const formattedValues = {};
    for (const key in formValues) {
      if (formValues.hasOwnProperty(key)) {
        formattedValues[key] = this.rmaService.removeAccents(formValues[key]).toUpperCase();
      }
    }
    return formattedValues;
  }

}
