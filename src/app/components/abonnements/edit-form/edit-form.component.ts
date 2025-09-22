import { AdresseService } from '@/services/adresse.service';
import { AuthenticationService } from '@/services/authentication.service';
import { RmaService } from '@/services/rma.service';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from "@angular/common/http";
import { environment } from '@env/environment';
import { shareReplay } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';


@Component({
  selector: 'app-edit-form',
  templateUrl: './edit-form.component.html',
  styleUrls: ['./edit-form.component.scss']
})
export class EditFormComponent implements OnInit {

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private rmaService: RmaService,
    private http: HttpClient,
    public authService: AuthenticationService,
    public adresseService: AdresseService,
    private route: ActivatedRoute,
    private _snackBar: MatSnackBar
  ) { }

  subscription;
  pays$ = null;
  loading = true;
  addrData;
  spin:boolean =true;

  ngOnInit(): void {
    this.spin = true;
    /*   this.pays$ = this.adresseService.getCountries().pipe(shareReplay(1));

      this.pays$.subscribe(
        (ret) => {
          console.warn("ret", ret);
        },
        (error) => {
          console.error("error", error);
        }
      ); */
 //   this.getClients();
  }

  editForm = this.fb.group({
    idAddr: "",
    dossier: ["", [Validators.maxLength(30), Validators.pattern(/^[a-zA-Z0-9 éèêàâîïÉÈÊÀÂÎÏ'-]{1,30}$/)]],
    client: ["", [ Validators.maxLength(8), Validators.pattern(/^[0-9]{1,8}$/)]],
    revendeurnom: ["", [Validators.maxLength(30), Validators.pattern(/^[a-zA-Z0-9 éèêàâîïÉÈÊÀÂÎÏ'-]{1,30}$/)]],
    clientnom: ["", [Validators.required, Validators.maxLength(40), Validators.pattern(/^[a-zA-Z0-9 éèêàâîïÉÈÊÀÂÎÏ'-]{1,40}$/)]],
    revendeurmail: ["", [Validators.required, Validators.maxLength(100), Validators.pattern(/^[a-zA-Z0-9 éèêàâîïÉÈÊÀÂÎÏ'-]+@[a-z0-9.-]+\.[a-z]{1,100}$/)]],
    devis: ["", [Validators.maxLength(6), Validators.pattern(/^[0-9+_-]{1,6}$/)]],
    services: ["", [Validators.maxLength(40), Validators.pattern(/^[a-zA-Z0-9 éèêàâîïÉÈÊÀÂÎÏ'-]{1,40}$/)]],
    adresseClientFinal: ["", [Validators.maxLength(60), Validators.pattern(/^[a-zA-Z0-9 éèêàâîïÉÈÊÀÂÎÏ'-]{1,60}$/)]],
    codePostal: ["", [Validators.maxLength(5), Validators.pattern(/^[0-9+_-]{1,5}$/)]],
    ville: ["", [Validators.maxLength(60), Validators.pattern(/^[a-zA-Z0-9 éèêàâîïÉÈÊÀÂÎÏ'-]{1,60}$/)]],
    telephoneRevendeur: ["", [Validators.maxLength(10), Validators.pattern(/^[0-9+_-]{1,10}/)]],
    telephoneClientFinal: ["", [Validators.maxLength(10), Validators.pattern(/^[0-9+_-]{1,10}/)]],
    votreReference: ["", [Validators.maxLength(30), Validators.pattern(/^[a-zA-Z0-9 éèêàâîïÉÈÊÀÂÎÏ'-]{1,20}$/)]],
    rio: ["", [ Validators.maxLength(20), Validators.pattern(/^[a-zA-Z0-9 éèêàâîïÉÈÊÀÂÎÏ'-]{1,20}$/)]],
    dateportabiliteclient: ["", [Validators.maxLength(10), Validators.pattern(/^[a-zA-Z0-9 éèêàâîïÉÈÊÀÂÎÏ'-]{1,10}$/)]],
    heureportabilite: ["", [Validators.maxLength(6), Validators.pattern(/^[a-zA-Z0-9 éèêàâîïÉÈÊÀÂÎÏ'-]{1,6}$/)]],
    statutPortabilite: ["", [Validators.required]],
    commentaire: ["", [Validators.maxLength(200), Validators.pattern(/^[a-zA-Z0-9 éèêàâîïÉÈÊÀÂÎÏ'-]{1,200}$/)]],
    login: ["", [Validators.maxLength(30), Validators.pattern(/^[a-zA-Z0-9 éèêàâîïÉÈÊÀÂÎÏ'-]{1,30}$/)]],
    mdp: ["", [ Validators.maxLength(30), Validators.pattern(/^[a-zA-Z0-9 éèêàâîïÉÈÊÀÂÎÏ'-]{1,30}$/)]],
    ippublique: ["", [Validators.maxLength(20), Validators.pattern(/^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[0-9a-fA-F]{1,4}):){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[0-9a-fA-F]{1,4}|(?:[0-9a-fA-F]{1,4}:){1,7}[0-9a-fA-F]{1,4})$/)]],
    numsecours: ["", [Validators.maxLength(20), Validators.pattern(/^[0-9+_-]{1,20}$/)]],
    abodebut: ["", [Validators.maxLength(10)]],
    abofin: ["", [Validators.maxLength(10), Validators.pattern(/^[a-zA-Z0-9 éèêàâîïÉÈÊÀÂÎÏ'-]{1,10}$/)]],
  });

  editFormSaved = this.fb.group({
    dossier: ["", [Validators.maxLength(30), Validators.pattern(/^[a-zA-Z0-9 éèêàâîïÉÈÊÀÂÎÏ'-]{1,30}$/)]],
    client: ["", [ Validators.maxLength(8), Validators.pattern(/^[0-9]{1,8}$/)]],
    revendeurnom: ["", [Validators.maxLength(30), Validators.pattern(/^[a-zA-Z0-9 éèêàâîïÉÈÊÀÂÎÏ'-]{1,30}$/)]],
    clientnom: ["", [Validators.required, Validators.maxLength(40), Validators.pattern(/^[a-zA-Z0-9 éèêàâîïÉÈÊÀÂÎÏ'-]{1,40}$/)]],
    revendeurmail: ["", [Validators.required, Validators.maxLength(100), Validators.pattern(/^[a-zA-Z0-9 éèêàâîïÉÈÊÀÂÎÏ'-]+@[a-z0-9.-]+\.[a-z]{1,100}$/)]],
    devis: ["", [Validators.maxLength(6), Validators.pattern(/^[0-9+_-]{1,6}$/)]],
    services: ["", [Validators.maxLength(40), Validators.pattern(/^[a-zA-Z0-9 éèêàâîïÉÈÊÀÂÎÏ'-]{1,40}$/)]],
    adresseClientFinal: ["", [Validators.maxLength(60), Validators.pattern(/^[a-zA-Z0-9 éèêàâîïÉÈÊÀÂÎÏ'-]{1,60}$/)]],
    codePostal: ["", [Validators.maxLength(5), Validators.pattern(/^[0-9+_-]{1,5}$/)]],
    ville: ["", [Validators.maxLength(60), Validators.pattern(/^[a-zA-Z0-9 éèêàâîïÉÈÊÀÂÎÏ'-]{1,60}$/)]],
    telephoneRevendeur: ["", [Validators.maxLength(10), Validators.pattern(/^[0-9+_-]{1,10}/)]],
    telephoneClientFinal: ["", [Validators.maxLength(10), Validators.pattern(/^[0-9+_-]{1,10}/)]],
    votreReference: ["", [Validators.maxLength(30), Validators.pattern(/^[a-zA-Z0-9 éèêàâîïÉÈÊÀÂÎÏ'-]{1,20}$/)]],
    rio: ["", [ Validators.maxLength(20), Validators.pattern(/^[a-zA-Z0-9 éèêàâîïÉÈÊÀÂÎÏ'-]{1,20}$/)]],
    dateportabiliteclient: ["", [Validators.maxLength(10), Validators.pattern(/^[a-zA-Z0-9 éèêàâîïÉÈÊÀÂÎÏ'-]{1,10}$/)]],
    heureportabilite: ["", [Validators.maxLength(6), Validators.pattern(/^[a-zA-Z0-9 éèêàâîïÉÈÊÀÂÎÏ'-]{1,6}$/)]],
    statutPortabilite: ["", [Validators.required]],
    commentaire: ["", [Validators.maxLength(200), Validators.pattern(/^[a-zA-Z0-9 éèêàâîïÉÈÊÀÂÎÏ'-]{1,200}$/)]],
    login: ["", [Validators.maxLength(30), Validators.pattern(/^[a-zA-Z0-9 éèêàâîïÉÈÊÀÂÎÏ'-]{1,30}$/)]],
    mdp: ["", [ Validators.maxLength(30), Validators.pattern(/^[a-zA-Z0-9 éèêàâîïÉÈÊÀÂÎÏ'-]{1,30}$/)]],
    ippublique: ["", [Validators.maxLength(20), Validators.pattern(/^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[0-9a-fA-F]{1,4}):){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[0-9a-fA-F]{1,4}|(?:[0-9a-fA-F]{1,4}:){1,7}[0-9a-fA-F]{1,4})$/)]],
    numsecours: ["", [Validators.maxLength(20), Validators.pattern(/^[0-9+_-]{1,20}$/)]],
    abodebut: ["", [Validators.maxLength(10)]],
    abofin: ["", [Validators.maxLength(10), Validators.pattern(/^[a-zA-Z0-9 éèêàâîïÉÈÊÀÂÎÏ'-]{1,10}$/)]],
 });

  getClients() {
    return this.http
      .get(
        `${environment.apiUrl}/OnlyWanMaj.php`,
        {
          withCredentials: true, responseType: 'text',
          params: {
            mode: 'SEL'
          }
        }

      )
      .subscribe(
        (data) => {
          var toto = JSON.parse(data)
          this.addrData = toto;
          this.addrData.forEach((val) => {
            if (val.dossier == this.route.snapshot.params['id']) {
              this.addrData = val;
            }
          })
          this.editStart(this.addrData);
          this.editForm.patchValue({
            dossier: this.editForm.value.dossier,
            client: this.editForm.value.client,
            revendeurnom: this.editForm.value.revendeurnom,
            clientnom: this.editForm.value.clientnom,
            revendeurmail: this.editForm.value.revendeurmail,
            devis: this.editForm.value.devis,
            services: this.editForm.value.services,
            adresseClientFinal: this.editForm.value.adresseClientFinal,
            codePostal:this.editForm.value.codePostal,
            ville:this.editForm.value.ville,
            telephoneRevendeur:this.editForm.value.telephoneRevendeur,
            telephoneClientFinal:this.editForm.value.telephoneClientFinal,
            votreReference:this.editForm.value.votreReference,
            rio: this.editForm.value.rio,
            dateportabiliteclient: this.editForm.value.dateportabiliteclient,
            heureportabilite: this.editForm.value.heureportabilite,
            statutPortabilite: this.editForm.value.statutPortabilite,
            commentaire: this.editForm.value.commentaire,
            login: this.editForm.value.login,
            mdp: this.editForm.value.mdp,
            ippublique: this.editForm.value.ippublique,
            numsecours: this.editForm.value.numsecours,
            abodebut: this.editForm.value.abodebut,
            abofin: this.editForm.value.abofin,



            /*          idAddr: this.editForm.value.idAddr,
                        nomAddr: this.editForm.value.nomAddr,
                        addr1: this.editForm.value.addr1,
                        addr2: this.editForm.value.addr2,
                        codePostal: this.editForm.value.codePostal,
                        ville: this.editForm.value.ville,
                        telephone: this.editForm.value.telephone,
                        pays: this.editForm.value.pays */
          })
          this.spin = false;
          this.loading = false;
        },
        (error) => {
          this.loading = false;
          this.spin = false;
        }
      );
  }

  editStart(client) {

      this.editForm.value.dossier = client.dossier,
      this.editForm.value.client = client.client,
      this.editForm.value.revendeurnom = client.revendeurnom,
      this.editForm.value.clientnom = client.clientnom,
      this.editForm.value.revendeurmail = client.revendeurmail,
      this.editForm.value.devis = client.devis,
      this.editForm.value.services = client.services,
      this.editForm.value.adresseClientFinal = client.adresseClientFinal,
      this.editForm.value.codePostal = client.codePostal,
      this.editForm.value.ville = client.ville,
      this.editForm.value.telephoneRevendeur = client.telephoneRevendeur,
      this.editForm.value.telephoneClientFinal = client.telephoneClientFinal,
      this.editForm.value.votreReference = client.votreReference,
      this.editForm.value.rio = client.rio,
      this.editForm.value.dateportabiliteclient = client.dateportabiliteclient,
      this.editForm.value.heureportabilite = client.heureportabilite,
      this.editForm.value.statutPortabilite = client.statutPortabilite,
      this.editForm.value.commentaire = client.commentaire,
      this.editForm.value.login = client.login,
      this.editForm.value.mdp = client.mdp,
      this.editForm.value.ippublique = client.ippublique,
      this.editForm.value.numsecours = client.numsecours,
      this.editForm.value.abodebut = client.abodebut,
      this.editForm.value.abofin = client.abofin

  }

  editAddress() {
    // if all the inputs are correct formate then send the form
    if (this.checkForm(
      this.editForm.get('dossier').valid,
      this.editForm.get('client').valid,
      this.editForm.get('revendeurnom').valid,
      this.editForm.get('clientnom').valid,
      this.editForm.get('revendeurmail').valid,
      this.editForm.get('devis').valid,
      this.editForm.get('services').valid,
      this.editForm.get('adresseClientFinal').valid,
      this.editForm.get('codePostal').valid,
      this.editForm.get('ville').valid,
      this.editForm.get('telephoneRevendeur').valid,
      this.editForm.get('telephoneClientFinal').valid,
      this.editForm.get('votreReference').valid,
      this.editForm.get('rio').valid,
      this.editForm.get('dateportabiliteclient').valid,
      this.editForm.get('heureportabilite').valid,
      this.editForm.get('statutPortabilite').valid,
      this.editForm.get('commentaire').valid,
      this.editForm.get('login').valid,
      this.editForm.get('mdp').valid,
      this.editForm.get('ippublique').valid,
      this.editForm.get('numsecours').valid,
      this.editForm.get('abodebut').valid,
      this.editForm.get('abofin').valid
    )) {

      this.editAddressFormate();
      //this.editFormSaved = this.adresseService.adresseFromate(this.editFormSaved);
      this.editAddressRequest(
        this.editForm.value.dossier,
        this.editForm.value.client,
        this.editForm.value.revendeurnom,
        this.editForm.value.clientnom,
        this.editForm.value.revendeurmail,
        this.editForm.value.devis,
        this.editForm.value.services,
        this.editForm.value.adresseClientFinal,
        this.editForm.value.codePostal,
        this.editForm.value.ville,
        this.editForm.value.telephoneRevendeur,
        this.editForm.value.telephoneClientFinal,
        this.editForm.value.votreReference,
        this.editForm.value.rio,
        this.editForm.value.dateportabiliteclient,
        this.editForm.value.heureportabilite,
        this.editForm.value.statutPortabilite,
        this.editForm.value.commentaire,
        this.editForm.value.login,
        this.editForm.value.mdp,
        this.editForm.value.ippublique,
        this.editForm.value.numsecours,
        this.editForm.value.abodebut,
        this.editForm.value.abofin,
      )
    }
  }
  checkForm(dossier, client, revendeurnom, clientnom, revendeurmail, devis, services,adresseClientFinal,rio,dateportabiliteclient,heureportabilite,statut,
    commentaire,login,mdp,ippublique,numsecours,abodebut,abofin,codePostal,ville,telephoneClientFinal,telephoneRevendeur,votreReference){

      return dossier
      && client
      && revendeurnom
      && clientnom
      && revendeurmail
      && devis
      && services
      && adresseClientFinal
      && codePostal
      && ville
      && telephoneClientFinal
      && telephoneRevendeur
      && votreReference
      && rio
      && dateportabiliteclient
      && heureportabilite
      && statut
      && commentaire
      && login
      && mdp
      && ippublique
      && numsecours
      && abodebut
      && abofin
  }
  editAddressRequest(dossier, client, revendeurnom, clientnom, revendeurmail, devis, services,adresseClientFinal,rio,dateportabiliteclient,heureportabilite,statutPortabilite,
    commentaire,login,mdp,ippublique,numsecours,abodebut,abofin,codePostal,ville,telephoneRevendeur,telephoneClientFinal,votreReference) {

    return this.http
      .get(`${environment.apiUrl}/OnlyWanMaj.php`, {
        withCredentials: true,
        responseType: 'text',
        params: {
          mode: 'UPD',
          //codead: '000',
          dossier: dossier,
          client: client,
          revendeur: revendeurnom,
          clientnom: clientnom,
          revendeurmail: revendeurmail,
          devis: devis,
          services: services,
          adresseClientFinal: adresseClientFinal,
          codePostal:codePostal,
          ville:ville,
          telephoneRevendeur:telephoneRevendeur,
          telephoneClientFinal: telephoneClientFinal,
          votreReference: votreReference,
          rio: rio,
          dateportabiliteclient: dateportabiliteclient,
          heureportabilite: heureportabilite,
          statutPortabilite: statutPortabilite,
          commentaire: commentaire,
          login: login,
          mdp: mdp,
          ippublique: ippublique,
          numsecours: numsecours,
          abodebut: abodebut,
          abofin: abofin
        }

      }).subscribe(() => {
         this.openSnackBar('Votre dossier a été mis à jour.','OK');
        this.router.navigate(['/abonnements/'])
      });
  }
   openSnackBar(message: string, action: string) {
    this._snackBar.open(message, action, {
      duration: 5000,
    });
  }

  editAddressFormate() {
    this.editFormSaved.value.dossier = this.rmaService.removeAccents(this.editForm.value.dossier).toUpperCase();
    this.editFormSaved.value.client = this.rmaService.removeAccents(this.editForm.value.client).toUpperCase();
    this.editFormSaved.value.revendeurnom = this.rmaService.removeAccents(this.editForm.value.revendeurnom).toUpperCase();
    this.editFormSaved.value.clientnom = this.rmaService.removeAccents(this.editForm.value.clientnom).toUpperCase();
    this.editFormSaved.value.revendeurmail = this.editForm.value.revendeurmail;
    this.editFormSaved.value.devis = this.rmaService.removeAccents(this.editForm.value.devis).toUpperCase();
    this.editFormSaved.value.services = this.rmaService.removeAccents(this.editForm.value.services).toUpperCase();
    this.editFormSaved.value.adresseClientFinal = this.rmaService.removeAccents(this.editForm.value.adresseClientFinal).toUpperCase();
    this.editFormSaved.value.codePostal = this.rmaService.removeAccents(this.editForm.value.codePostal).toUpperCase();
    this.editFormSaved.value.ville = this.rmaService.removeAccents(this.editForm.value.ville).toUpperCase();
    this.editFormSaved.value.telephoneRevendeur = this.rmaService.removeAccents(this.editForm.value.telephoneRevendeur).toUpperCase();
    this.editFormSaved.value.adresseClientFinal = this.rmaService.removeAccents(this.editForm.value.adresseClientFinal).toUpperCase();
    this.editFormSaved.value.telephoneClientFinal = this.rmaService.removeAccents(this.editForm.value.telephoneClientFinal).toUpperCase();
    this.editFormSaved.value.votreReference = this.rmaService.removeAccents(this.editForm.value.votreReference).toUpperCase();
    this.editFormSaved.value.rio = this.rmaService.removeAccents(this.editForm.value.rio).toUpperCase();
    this.editFormSaved.value.dateportabiliteclient = this.rmaService.removeAccents(this.editForm.value.dateportabiliteclient).toUpperCase();
    this.editFormSaved.value.heureportabilite = this.rmaService.removeAccents(this.editForm.value.heureportabilite).toUpperCase();
    this.editFormSaved.value.statutPortabilite = this.rmaService.removeAccents(this.editForm.value.statutPortabilite).toUpperCase();
    this.editFormSaved.value.commentaire = this.rmaService.removeAccents(this.editForm.value.commentaire).toUpperCase();
    this.editFormSaved.value.login = this.rmaService.removeAccents(this.editForm.value.login).toUpperCase();
    this.editFormSaved.value.mdp = this.rmaService.removeAccents(this.editForm.value.mdp).toUpperCase();
    this.editFormSaved.value.ippublique = this.rmaService.removeAccents(this.editForm.value.ippublique).toUpperCase();
    this.editFormSaved.value.numsecours = this.rmaService.removeAccents(this.editForm.value.numsecours).toUpperCase();
    this.editFormSaved.value.abodebut = this.rmaService.removeAccents(this.editForm.value.abodebut).toUpperCase();
    this.editFormSaved.value.abofin = this.rmaService.removeAccents(this.editForm.value.abofin).toUpperCase();

  }


}
