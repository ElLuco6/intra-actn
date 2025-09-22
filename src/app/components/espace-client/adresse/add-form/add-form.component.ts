import { Component, OnInit } from '@angular/core';
import {environment} from "@env/environment";
import {FormBuilder, Validators} from "@angular/forms";
import {AdresseService} from "@services/adresse.service";
import {HttpClient} from "@angular/common/http";
import {RmaService} from "@services/rma.service";
import {Router} from "@angular/router";
import {shareReplay} from "rxjs/operators";
import {AuthenticationService} from "@services/authentication.service";

@Component({
  selector: 'app-add-form',
  templateUrl: './add-form.component.html',
  styleUrls: ['./add-form.component.scss']
})
export class AddFormComponent implements OnInit {

  subscription;
  pays$ = null;


  constructor(
    private fb: FormBuilder,
    public authService: AuthenticationService,
    public adresseService: AdresseService,
    private rmaService: RmaService,
    private http: HttpClient,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.pays$ = this.adresseService.getCountries().pipe(shareReplay(1));
    this.pays$.subscribe();

  }

  addrForm = this.fb.group({
    nomAddr: ["", [Validators.required, Validators.maxLength(40), Validators.pattern(/^[a-zA-Z0-9 éèêàâîïÉÈÊÀÂÎÏ'-]{1,40}$/)]],
    addr1: ["", [Validators.required, Validators.maxLength(30), Validators.pattern(/^[a-zA-Z0-9 éèêàâîïÉÈÊÀÂÎÏ'-]{1,30}$/)]],
    addr2: ["", [Validators.maxLength(30), Validators.pattern(/^[a-zA-Z0-9 éèêàâîïÉÈÊÀÂÎÏ'-]{1,30}$/)]],
    codePostal: ["", [Validators.required, Validators.maxLength(5), Validators.pattern(/^[0-9]{5}$/)]],
    ville: ["", [Validators.required, Validators.maxLength(26), Validators.pattern(/^[a-zA-Z0-9 éèêàâîïÉÈÊÀÂÎÏ'-]{1,26}$/)]],
    telephone: ["", [Validators.required, Validators.maxLength(15), Validators.pattern(/^[0-9+_-]{1,15}$/)]],
    pays: ["FR", [Validators.required]],
    defaut: ''
  });


  addrFormSaved = this.fb.group({
    nomAddr: ["", [Validators.required, Validators.maxLength(40), Validators.pattern(/^[a-zA-Z0-9 éèêàâîïÉÈÊÀÂÎÏ'-]{1,40}$/)]],
    addr1: ["", [Validators.required, Validators.maxLength(30), Validators.pattern(/^[a-zA-Z0-9 éèêàâîïÉÈÊÀÂÎÏ'-]{1,30}$/)]],
    addr2: ["", [Validators.maxLength(30), Validators.pattern(/^[a-zA-Z0-9 éèêàâîïÉÈÊÀÂÎÏ'-]{1,30}$/)]],
    codePostal: ["", [Validators.required, Validators.maxLength(5), Validators.pattern(/^[a-zA-Z0-9 éèêàâîïÉÈÊÀÂÎÏ'-]{1,30}$/)]],
    ville: ["", [Validators.required, Validators.maxLength(26), Validators.pattern(/^[a-zA-Z0-9 éèêàâîïÉÈÊÀÂÎÏ'-]{1,26}$/)]],
    telephone: ["", [Validators.required, Validators.maxLength(15), Validators.pattern(/^[0-9+_-]{1,15}$/)]],
    pays: ["FR", [Validators.required]],
    defaut: ''
  });


  addAddress(){
    if(this.checkAddForm()){
      this.addAddressFormate()
      this.adresseService.addAddressRequest(
        this.addrFormSaved.value.nomAddr,
        this.addrFormSaved.value.addr1,
        this.addrFormSaved.value.addr2,
        this.addrFormSaved.value.codePostal,
        this.addrFormSaved.value.ville,
        this.addrFormSaved.value.telephone,
        this.addrFormSaved.value.pays,
        this.addrFormSaved.value.defaut
      )
    }
  }

  checkAddForm() {
    return this.addrForm.get('nomAddr').valid
      && this.addrForm.get('addr1').valid
      && this.addrForm.get('addr2').valid
      && this.addrForm.get('codePostal').valid
      && this.addrForm.get('ville').valid
      && this.addrForm.get('telephone').valid
      && this.addrForm.get('pays').valid
  }

  addAddressFormate(){
    this.addrFormSaved.value.nomAddr = this.rmaService.removeAccents(this.addrForm.value.nomAddr).toUpperCase();
    this.addrFormSaved.value.addr1 = this.rmaService.removeAccents(this.addrForm.value.addr1).toUpperCase();
    this.addrFormSaved.value.addr2 = this.rmaService.removeAccents(this.addrForm.value.addr2).toUpperCase();
    this.addrFormSaved.value.codePostal = this.rmaService.removeAccents(this.addrForm.value.codePostal).toUpperCase();
    this.addrFormSaved.value.ville = this.rmaService.removeAccents(this.addrForm.value.ville).toUpperCase();
    this.addrFormSaved.value.telephone = this.rmaService.removeAccents(this.addrForm.value.telephone).toUpperCase();
    this.addrFormSaved.value.pays = this.rmaService.removeAccents(this.addrForm.value.pays).toUpperCase();
  }

}
