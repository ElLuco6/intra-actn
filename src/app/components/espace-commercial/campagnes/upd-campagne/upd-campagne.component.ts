import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from "@angular/router";
import {Campagne} from "@models/campagne";
import {CampagnesService} from "@services/campagnes.service";

@Component({
  selector: 'app-upd-campagne',
  templateUrl: './upd-campagne.component.html',
  styleUrl: './upd-campagne.component.scss'
})
export class UpdCampagneComponent implements OnInit {

  campagne: Campagne;
  idCampagne: string;
  campagneForm: FormGroup;

  constructor(private route: ActivatedRoute,
              private campagnesService: CampagnesService,
              private fb: FormBuilder,
              private router: Router) {
    route.params.subscribe(params => {
      this.idCampagne = params['id'];
    });
    this.campagneForm = this.fb.group({
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

  ngOnInit() {
    this.campagnesService.getCampagneById(this.idCampagne).subscribe((campagneArr) => {
      let campagne = campagneArr[0];

      this.campagneForm.setValue({
        campagne: campagne.campagne,
        libelle: campagne.libelle,
        datedeb: this.convertDate(campagne.datedeb),
        datefin: this.convertDate(campagne.datefin),
        user1: campagne.user1,
        user2: campagne.user2,
        user3: campagne.user3,
        user4: campagne.user4,
        texte: campagne.texte
      });
    });
  }

  convertDateFormat(date) {
    let dateParts = date.split("/");
    return new Date(`${dateParts[1]}/${dateParts[0]}/${dateParts[2]}`);
  }

  convertDate(date: string) {
    let convertedDate = this.convertDateFormat(date);
    return new Date(convertedDate);
  }

  convertDateFr(dateToConvert){
    let date = new Date(dateToConvert);
    let day = date.getDate().toString().padStart(2, '0');
    let month = (date.getMonth() + 1).toString().padStart(2, '0'); // Les mois commencent à 0 en JavaScript
    let year = date.getFullYear();

    return `${day}/${month}/${year}`;
  }

  updateCampagne() {
    let campagne = this.campagneForm.value;
    campagne.datedeb = this.convertDateFr(campagne.datedeb);
    campagne.datefin = this.convertDateFr(campagne.datefin);
    this.campagnesService.updateCampagne(campagne).subscribe(() => {
      this.router.navigate(['/espace-commercial/campagne/' + this.campagneForm.value.campagne]);
    });
  }

}
