import {Component, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {HttpClient} from "@angular/common/http";
import {ApiEntreprise} from "@models/apiEntreprise";
import {Departement} from "@models/departement";
import {CdkTextareaAutosize} from "@angular/cdk/text-field";
import {ProspectService} from "@services/prospect.service";
import {Router} from "@angular/router";
import {DatePipe} from "@angular/common";
import { Location } from '@angular/common';
import {siretValidator} from "@/validators/siret-validator";

@Component({
  selector: 'app-add-prospects',
  templateUrl: './add-prospects.component.html',
  styleUrls: ['./add-prospects.component.scss']
})
export class AddProspectsComponent implements OnInit {

  infoBulleSociete: string = 'Remplir un SIRET vas vous permettre de pré-remplir toutes les infos de la société automatiquement (Excepter le numéro de téléphone)';

  maxDate: Date;

  @ViewChild('autosize') autosize: CdkTextareaAutosize;

  addProspectForm = this.fb.group({
    siret: ["", [Validators.required, siretValidator()]],
    nom: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9 ]*$/)]],
    originerecrutement: '',
    daterecrutement: [''],
    region: '',
    siteweb: '',
    ape: '',
    adresse1: '',
    adresse2: '',
    adresse3: '',
    departement: '',
    codepostal: ['', [Validators.required, Validators.maxLength(5),Validators.pattern(/^[0-9]{5}$/)]],
    ville: '',
    telephone: ['', [Validators.required, Validators.maxLength(15), Validators.pattern(/^[0-9+_-]{1,15}$/)]],
    activite: '',
    status: '',
    commentaire: '',
    groupe: ''
  });

  sectRep: Array<string> = [];

  groupement: any[] = [];

  constructor(
    private http: HttpClient,
    protected prospectService: ProspectService,
    private fb: FormBuilder,
    private router: Router,
    private datePipe: DatePipe,
    private location: Location
  ) {
  }

  ngOnInit() {
    this.maxDate = new Date();
    this.addProspectForm.get('daterecrutement').setValue(this.maxDate.toISOString());
    this.sectRep = this.sectRep.filter((x, i) => this.sectRep.indexOf(x) === i);
    this.prospectService.getGroupement().subscribe((d) => {this.groupement = d});
    this.setupSiretObserver();
  }

  /**
   * Si un jour l'API ne fonctionne plus c'est surement que le token a expiré. à renouveler sur : https://api.insee.fr/catalogue/site/themes/wso2/subthemes/insee/pages/item-info.jag?name=Sirene&version=V3.11&provider=insee
   */
  private setupSiretObserver() {
    const BASE_API_URL = 'https://api.insee.fr/entreprises/sirene/siret/';
    const AUTH_TOKEN = 'Bearer f44f2acb-533d-37b3-9afa-693f314d6f25';
    this.addProspectForm.get('siret').valueChanges.subscribe((numSiret) => {
      if (numSiret.length === 14) {
        const fullUrl = `${BASE_API_URL}${numSiret}`;
        this.apiDataRequest(fullUrl, AUTH_TOKEN).subscribe((apiData) => {
          this.fillFormFromApiResponse(apiData, this.addProspectForm);
          this.setDepartment(apiData, this.addProspectForm, this.prospectService.departmentList);
        });
      }
    });
  }

  private apiDataRequest(url: string, token: string) {
    return this.http.get<ApiEntreprise>(url, {
      headers: {Authorization: token}
    });
  }

  private fillFormFromApiResponse(data: any, form: FormGroup) {
    const etablissement = data.etablissement;
    const adresseEtablissement = etablissement.adresseEtablissement;
    const uniteLegale = etablissement.uniteLegale;

    form.get('nom').setValue(uniteLegale.denominationUniteLegale.replace(/'/g, ' '));
    form.get('ape').setValue(uniteLegale.activitePrincipaleUniteLegale.replace('.', ''));
    form.get('codepostal').setValue(adresseEtablissement.codePostalEtablissement);
    form.get('ville').setValue(
      adresseEtablissement.libelleCommuneEtablissement.replace(/'/g, ' ')
    );
    const adresse1FromApi = `${adresseEtablissement.numeroVoieEtablissement} ${adresseEtablissement.typeVoieEtablissement} ${adresseEtablissement.libelleVoieEtablissement}`;
    form.get('adresse1').setValue(
      adresse1FromApi.replace(/'/g, ' ')
    );
  }

  private setDepartment(data: any, form: FormGroup, departmentList: Departement[]) {
    const codePostal = form.get('codepostal').value.slice(0, 2);

    const department = departmentList.find((dept) => dept.argument == codePostal);

    if (department) form.get('region').setValue(department.valeur3);
  }

  addProspect(){
    this.addProspectForm.value.daterecrutement = this.datePipe.transform(new Date(this.addProspectForm.value.daterecrutement), 'yyyy-MM-dd');
    this.addProspectForm.value.nom = this.addProspectForm.value.nom.replace(/'/g, ' ');
    this.addProspectForm.value.commentaire = this.addProspectForm.value.commentaire.replace(/'/g, ' ');
    this.addProspectForm.value.adresse1 = this.addProspectForm.value.adresse1.replace(/'/g, ' ');
    this.prospectService.addProspect(this.addProspectForm).subscribe(
      (response) => {
        if (response) {
          if(response[0].numprospect != 0){
          this.router.navigate(['/espace-commercial/prospects/detail/' + response[0].numprospect]);
          }else{
            this.location.back();
          }
        }else{
          alert(response.status + 'Une erreur est survenue lors de l\'enregistrement des données')
        }
      }
    );
  }

}
