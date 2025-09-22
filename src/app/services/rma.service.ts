import { Injectable, EventEmitter } from '@angular/core';
import { HttpClient, HttpParams, HttpRequest } from '@angular/common/http';
import { environment } from "@env/environment";
import { Observable, Subject } from 'rxjs';
import { Filtre } from "@/models";
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthenticationService } from './authentication.service';

interface PageObject {
  length: number;
  pageIndex: number;
  pageSize: number;
  previousPageIndex: number;
}

@Injectable({
  providedIn: 'root'
})
export class RmaService {

  /*
    produit -> produit selectionné par l'utilisateur pour être renvoyer
    noserie -> liste des numéros de séries séléctionnés s'il y a plusieurs produit du même type
    quantite -> quantité des produits séléctionnés s'il n'ont pas de numéro de série (sinon la quantité est à 1)
  */
  /** produit selectionné par l'utilisateur pour être renvoyer */
  produit: any;
  /** liste des numéros de séries séléctionnés s'il y a plusieurs produit du même type */
  noserie: Array<string> = [];
  /** quantité des produits séléctionnés s'il n'ont pas de numéro de série (sinon la quantité est à 1) */
  quantite = 1;

  /*
    produitFin -> produit validé par l'utilisateur pour être renvoyer
    noserieFin -> liste des numéros de séries validés s'il y a plusieurs produit du même type
    quantiteFin -> quantité des produits validés s'il n'ont pas de numéro de série (sinon la quantité est à 1)
    Le doublon de ces variables permet d'effacer les données du produit à retourner lorsqu'on change de page
  */
  /** produit validé par l'utilisateur pour être renvoyer */
  produitFin: any;
  /** liste des numéros de séries validés s'il y a plusieurs produit du même type */
  noserieFin: Array<string> = [];
  /** quantité des produits validés s'il n'ont pas de numéro de série (sinon la quantité est à 1) */
  quantiteFin = 1;

  /*
    motif, refRMA, description, IP, login, password, file, mail
    -> variables permettant de faire transiter le récapitulatif entre la page de confirmation et la page de fin
  */
  /** une des variables permettant de faire transiter le récapitulatif entre la page de confirmation et la page de fin */
  motif: string;
  /** une des variables permettant de faire transiter le récapitulatif entre la page de confirmation et la page de fin */
  refRMA: string;
  /** une des variables permettant de faire transiter le récapitulatif entre la page de confirmation et la page de fin */
  description: string;
  /** une des variables permettant de faire transiter le récapitulatif entre la page de confirmation et la page de fin */
  IP: string;
  /** une des variables permettant de faire transiter le récapitulatif entre la page de confirmation et la page de fin */
  login: string;
  /** une des variables permettant de faire transiter le récapitulatif entre la page de confirmation et la page de fin */
  password: number;
  /** une des variables permettant de faire transiter le récapitulatif entre la page de confirmation et la page de fin */
  file: string;
  /** une des variables permettant de faire transiter le récapitulatif entre la page de confirmation et la page de fin */
  mail: string;

  // liste des produits renvoyés par le php
  produitList = [];

  // permet d'utiliser la fonction forEach sur les data d'un subscribe
  tempo: any;

  /*
    first -> permet de savoir si le formulaire a déjà été créé ou non
    mailClient, nomClient, telClient -> récupération des données personnels pour pré remplir le formulaire
    rmaForm -> sauvegarde des données du formulaire
  */
  /** le formulaire a-t-il déjà été créé ou non ? */
  first: boolean = true;
  /** donnée personnelle récupérée pour pré remplir le formulaire */
  mailClient: string;
  /** donnée personnelle récupérée pour pré remplir le formulaire */
  nomClient: string;
  /** donnée personnelle récupérée pour pré remplir le formulaire */
  telClient: string;
  /** sauvegarde des données du formulaire */
  rmaForm = this.fb.group({
    serie: ['', []],
    motif: ['', [Validators.required]],
    refRMA: ['', [Validators.required]],
    description: ['', [Validators.required, Validators.minLength(30), Validators.maxLength(600)]],
    login: ['', [Validators.maxLength(20)]],
    password: ['', [Validators.maxLength(20)]],
    IP: ['', []],
    file: ['', []],
    nom: ['', [Validators.required, Validators.maxLength(40)]],
    mail: ['', [Validators.required, Validators.maxLength(70), Validators.email]],
    tel: ['', [Validators.required, Validators.maxLength(15), Validators.pattern(/^[0-9+_-]+$/)]],
    cgv: ['', [Validators.required]],
  });

  // création d'un evenement pour régler le problème de l'opacité lors de la pop up de la page commande
  popUp = new EventEmitter<any>();
  paginatorEvent = new EventEmitter<PageObject>();

  loadedProduits = new Subject<void>();
  currentID = 0;

  // liste des marques afin de les injecter dans les filtres
  private _marques: Set<string>;

  // liste des filtres de rma
  private _filtres: Array<Filtre> = [];

  constructor(
    private http: HttpClient,
    private fb: FormBuilder,
    private authService: AuthenticationService
  ) { }

  // fonction qui permet de définir le produit séléctionné par l'utilisateur
  setProduit(produit: any, noserie: Array<string>, quantite: number): void {
    this.produit = produit;
    this.noserie = noserie;
    this.quantite = quantite;
  }

  // getter du produit séléctionné
  getProduit(): any {
    return this.produit;
  }

  // getter de la liste de numéro de série séléctionnée
  getNoserie(): Array<string> {
    return this.noserie;
  }

  removeAccents(str: string): string {
    //str = str.toString();
    str = str ?? '';
    let temp = str.replace('\'', ' ');
    temp = temp.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    return temp.replace(/[^a-zA-Z0-9 ]*/g, '');
  }

  /* Enlvève les accents mais garde les - utilisé dans abonnements */
  removeAccentsAbonnements(str: string): string {
    //str = str.toString();
    str = str ?? '';
    let temp = str.replace('\'', ' ');
    temp = temp.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    return temp.replace(/[^a-zA-Z0-9 -]*/g, '');
  }

  // getter de la quantité séléctionnée
  getQuantite(): number {
    return this.quantite;
  }

  // lors du changement de page cette fonction efface les données
  clearProduit(): void {
    this.produit = undefined;
    this.noserie = [];
    this.quantite = 1;
  }

  /* ------------------------------------------------------------------------------------- */

  // fonction qui permet de définir le produit validé par l'utilisateur
  setProduitFin(produit: any, noserie: Array<string>, quantite: number): void {
    this.produitFin = produit;
    this.noserieFin = noserie;
    this.quantiteFin = quantite;
  }

  // getter du produit validé
  getProduitFin(): any {
    return this.produitFin;
  }

  // getterde la liste de numéro de série validée
  getNoserieFin(): Array<string> {
    return this.noserieFin;
  }

  // getter de la quantité validée
  getQuantiteFin(): number {
    return this.quantiteFin;
  }

  // lors du changement de page cette fonction efface les données
  clearProduitFin(): void {
    this.produitFin = undefined;
    this.noserieFin = [];
    this.quantiteFin = 1;
  }

  /* ------------------------------------------------------------------------------------- */


  // au changement de page, lorsque l'utilisateuir valide son produit selectionné, on fait la bascule entre les variables
  bascule(): void {
    this.setProduitFin(this.getProduit(), this.getNoserie(), this.getQuantite());
  }

  // enregistre le form rempli par l'utilisateur pour en faire un recapitulatif utilisé dans la page de fin de retour
  recapitulatif(
    motif: string,
    refRMA: string,
    description: string,
    IP: string,
    login: string,
    password: number,
    mail: string,
    file: string): void {
    switch (motif) {
      case '1': {
        this.motif = 'Hors service';
        break;
      }
      case '2': {
        this.motif = 'Mauvais article reçu';
        break;
      }
      case '3': {
        this.motif = 'Erreur de choix lors de la commande';
        break;
      }
    }
    this.refRMA = refRMA;
    this.description = description;
    this.IP = IP;
    this.login = login;
    this.password = password;
    this.mail = mail;
    if (file) {
      this.file = file;
    } else {
      this.file = '';
    }
  }

  // getter du recapitulatif
  getRecap(): any {
    return {
      motif: this.motif,
      refRMA: this.refRMA,
      description: this.description,
      IP: this.IP,
      login: this.login,
      password: this.password,
      mail: this.mail,
      file: this.file,
    };
  }

  // fonction qui s'abonne à la réponse du php et qui charge les produits dans une liste
  chargerProduits(): Subject<void> {

    /* on rend cette fonction bloquante (avec l'attente de l'emission d'un next par le sujet)
    pour les fonction qui ont besoin de la liste de produits */
    const sameUser = this.authService.currentUser.id == this.currentID;
    if (!sameUser) { // on vérifie que la liste n'est pas déjà chargée
      this.produitsRequest().subscribe(
        data => {
          this.produitList = [];
          this.tempo = data;
          this.tempo.forEach((produit, index) => {
            if (produit.garantiedatefin) {
              if (produit.quantite > 1 && produit.noserie) {
                const temp = produit.noserie;
                produit.noserie = [temp];
                for (let i = 1; i < produit.quantite; i++) {
                  produit.noserie.push(this.tempo[index + i]?.noserie);
                }
              }
              this.produitList.push(produit);
            }
          });
          this.loadedProduits.next();
          this.currentID = this.authService.currentUser.id;
        },
        err => {
          console.log(err);
        },
        () => { }
      );
    }
    return this.loadedProduits;
  }

  getID(): any {
    return this.authService.currentUser.id == this.currentID;
  }

  // getter de la liste de produits
  getProduitList(): any {
    return this.produitList;
  }

  // getter de la liste des marques et des filtres (ces derniers étant rentré en dur pour la page rma)
  public getFiltres(): Observable<Array<Filtre>> {
    return new Observable(obs => {
      const marques: Array<string> = [];
      this._filtres = [];
      this._marques.forEach(element => marques.push(element));
      marques.sort();
      this._filtres.push({ target: 'marque', label: 'Marque', options: marques, type: '', method: '', forme: 'select' });
      obs.next(this._filtres);
      obs.complete();
    });
  }

  // getter de la liste des marques et des filtres (ces derniers étant rentré en dur pour la page rma)
  public getFiltresSuivi(): Observable<Array<Filtre>> {
    return new Observable(obs => {
      const marques: Array<string> = [];
      this._filtres = [];
      this._marques.forEach(element => marques.push(element));
      marques.sort();
      this._filtres.push({ target: 'marque', label: 'Marque', options: marques, type: '', method: '', forme: 'select' });
      this._filtres.push({ target: 'status', label: 'Statut', options: ['Attente TRAITEMENT', 'Retour AUTORISÉ', 'Retour REFUSÉ', 'Renvoi GRATUIT', 'TERMINÉ/AVOIR'], type: '', method: '', forme: 'select' });
      obs.next(this._filtres);
      obs.complete();
    });
  }

  // permet de remplir la liste des marques
  chargerMarques(produitList: any): void {
    this._marques = new Set();
    produitList.forEach((element: { marque: string; }) => this._marques.add(element.marque));
  }

  // vidage de la liste lors d'un changement de page
  viderList(): void {
    this.produitList = [];
  }

  // chargement des informations clients et envoie du formulaire a la page confirmation-retour
  chargerProfil(): Subject<FormGroup> {
    const attente = new Subject<FormGroup>();
    if (this.first && this.produit) {
      this.getProfil().subscribe(
        data => {
          this.nomClient = data.user.RMA_interlocuteur.trim();
          this.mailClient = data.user.RMA_mail.trim();
          this.telClient = data.user.RMA_tele.trim();
          if (this.nomClient === '') {
            this.nomClient = data.user.TIERSIND.trim();
          }
          if (this.mailClient === '') {
            this.mailClient = data.user.TIERSMEL.trim();
          }
          if (this.telClient === '') {
            this.telClient = data.user.TIERSTEL.trim();
          }
          this.rmaForm.setValue({
            serie: '',
            motif: '',
            refRMA: this.produit.referencecommande,
            description: '',
            login: '',
            password: '',
            IP: '',
            nom: this.nomClient,
            mail: this.mailClient,
            tel: this.telClient,
            cgv: '',
            file: ''
          });
          attente.next(this.rmaForm);
          attente.complete();
        },
        err => { },
        () => { }
      );
    } else {
      this.getProfil().subscribe(
        data => {
          this.nomClient = data.user.RMA_interlocuteur.trim();
          this.mailClient = data.user.RMA_mail.trim();
          attente.next(this.rmaForm);
          attente.complete();
        },
        err => { },
        () => { }
      );
    }
    return attente;
  }

  // sauvegarde du formulaire de la page confirmation-retour
  saveForm(rmaForm: FormGroup): void {
    this.rmaForm = rmaForm;
    this.first = false;
  }

  // effacer le formulaire lorsque celui-ci est envoyé ou lorsqu'on fait un rma sur un autre produit
  clearForm(): void {
    this.rmaForm = this.fb.group({
      serie: ['', []],
      motif: ['', [Validators.required]],
      refRMA: ['', [Validators.required]],
      description: ['', [Validators.required, Validators.minLength(30), Validators.maxLength(600)]],
      login: ['', [Validators.maxLength(20)]],
      password: ['', [Validators.maxLength(20)]],
      IP: ['', []],
      file: ['', []],
      nom: ['', [Validators.required, Validators.maxLength(40)]],
      mail: ['', [Validators.required, Validators.maxLength(70), Validators.email]],
      tel: ['', [Validators.required, Validators.maxLength(15), Validators.pattern(/^[0-9+_-]+$/)]],
      cgv: ['', [Validators.required]],
    });
    this.first = true;
  }

  // fonction qui permet de transformer une date française en une date anglaise (prise en compte par le type Date)
  formatageDate(chaine: string): string {
    const tab = chaine.split('/');
    const tabFormat = [tab[1], tab[0], tab[2]];
    return tabFormat.join('/');
  }

  // emission de l'evenement pour regler le problème d'opacité lors du pop up
  isPopUp(): void {
    this.popUp.emit('Ok');
  }

  // emission d'un message pour avertir du changement de page
  isNotPopUp(): void {
    this.popUp.emit('Pas Ok');
  }

  switchPag(e): void {
    this.paginatorEvent.emit(e);
  }

  // lien avec le php permettant de récupérer les produits rma
  produitsRequest(): Observable<any> {
    return (
      this.http.get(`${environment.apiUrl}/HistoriqueAchatsDetail.php`, { withCredentials: true, responseType: 'json' })
    );
  }

  // lien avec le php permettant de récupérer les produits rma
  chargerAdresse(): Observable<any> {
    return (
      this.http.get(`${environment.apiUrl}/ListeAdresses.php`, { withCredentials: true, responseType: 'json' })
    );
  }

  // lien avec le php permettant de recupérer le mail et le nom
  getProfil(): Observable<any> {
    return (
      this.http.get(`${environment.apiUrl}/LogLecture.php`, { withCredentials: true, responseType: 'json' })
    );
  }

  // lien avec le fichier texte de la bulle d'aide pour les références produits
  chargerAideProduitRef(): Observable<string> {
    if (environment.production) {
      return this.http.get(`${environment.aideRMAUrl}/aideProduitRef.txt`,
        {
          responseType: 'text'
        });
    }
    else {
      return this.http.get('../../assets/aideRMA/aideProduitRef.txt',
        {
          responseType: 'text'
        });
    }
  }

  // lien avec le fichier texte de la bulle d'aide pour les numéros de série
  chargerAideNoSerie(): Observable<string> {
    if (environment.production) {
      return this.http.get(`${environment.aideRMAUrl}/aideNoSerie.txt`,
        {
          responseType: 'text'
        });
    }
    else {
      return this.http.get('../../assets/aideRMA/aideNoSerie.txt',
        {
          responseType: 'text'
        });
    }
  }

  // lien avec le fichier texte de la bulle d'aide pour les numéros EAN
  chargerAideEAN(): Observable<string> {
    if (environment.production) {
      return this.http.get(`${environment.aideRMAUrl}/aideEAN.txt`,
        {
          responseType: 'text'
        });
    }
    else {
      return this.http.get('../../assets/aideRMA/aideEAN.txt',
        {
          responseType: 'text'
        });
    }
  }

  // lien avec le fichier texte de la bulle d'aide pour les numéros EAN
  chargerAideMotif(): Observable<string> {
    if (environment.production) {
      return this.http.get(`${environment.aideRMAUrl}/aideMotif.txt`,
        {
          responseType: 'text'
        });
    }
    else {
      return this.http.get('../../assets/aideRMA/aideMotif.txt',
        {
          responseType: 'text'
        });
    }
  }

  // lien avec le fichier texte de la bulle d'aide pour les numéros EAN
  chargerAideAnomalie(): Observable<string> {
    if (environment.production) {
      return this.http.get(`${environment.aideRMAUrl}/aideAnomalie.txt`,
        {
          responseType: 'text'
        });
    }
    else {
      return this.http.get('../../assets/aideRMA/aideAnomalie.txt',
        {
          responseType: 'text'
        });
    }
  }

  // lien avec le fichier texte de la bulle d'aide pour les numéros EAN
  chargerAideSecurite(): Observable<string> {
    if (environment.production) {
      return this.http.get(`${environment.aideRMAUrl}/aideSecurite.txt`,
        {
          responseType: 'text'
        });
    }
    else {
      return this.http.get('../../assets/aideRMA/aideSecurite.txt',
        {
          responseType: 'text'
        });
    }
  }

  // lien avec le fichier texte de la bulle d'aide pour les références produits
  chargerAideProduitNonValide(): Observable<string> {
    if (environment.production) {
      return this.http.get(`${environment.aideRMAUrl}/aideProduitNonValide.txt`,
        {
          responseType: 'text'
        });
    }
    else {
      return this.http.get('../../assets/aideRMA/aideProduitNonValide.txt',
        {
          responseType: 'text'
        });
    }
  }

  // lien avec le php pour la page de suivi rma
  chargerSuivi(): Observable<any> {
    return (
      this.http.get(`${environment.apiUrl}/RmaStatus.php`, { withCredentials: true, responseType: 'json' })
    );
  }

  // lien avec le php pour envoyer la demande de rma du client
  envoiRMA(
    rmaForm: FormGroup,
    file: File | string,
    produitSel: any,
    quantiteSel: number,
    serieListSel: Array<string>,
    adresseSel: any): Observable<boolean> {
    switch (rmaForm.value.motif) {
      case '1': {
        this.motif = 'Hors service';
        break;
      }
      case '2': {
        this.motif = 'Mauvais article recu';
        break;
      }
      case '3': {
        this.motif = 'Erreur de choix lors de la commande';
        break;
      }
    }
    if (typeof (file) === 'string') {
      return this.http
        .post<any>(`${environment.apiUrl}/envoiRMA.php`,
          {
            envoiFile: false,
            produit: produitSel,
            quantite: quantiteSel,
            serieList: serieListSel,
            adresse: adresseSel,
            motif: this.motif,
            motifcode: rmaForm.value.motif,
            refRMA: rmaForm.value.refRMA,
            file,
            description: this.removeAccents(rmaForm.value.description),
            login: rmaForm.value.login,
            password: rmaForm.value.password,
            IP: rmaForm.value.IP,
            nom: this.removeAccents(rmaForm.value.nom),
            mail: rmaForm.value.mail,
            tel: rmaForm.value.tel,
            cgv: rmaForm.value.cgv,
            numClient: this.authService.currentUser.id
          },
          {
            withCredentials: true,
            responseType: 'json',
          });
    } else { // dans le cas ou il y a un fichier, on fait d'abord appel au php qui enregistre le fichier
      const formData = new FormData();
      formData.append('upload', file);
      const paramsO = new HttpParams();
      const options = {
        params: paramsO,
        reportProgress: true,
      };

      const req = new HttpRequest('POST', `${environment.apiUrl}/envoiRMAFile.php`, formData, options);
      this.http.request(req).subscribe(
        (result) => { }
      );
      return this.http
        .post<any>(`${environment.apiUrl}/envoiRMA.php`,
          {
            envoiFile: true,
            produit: produitSel,
            quantite: quantiteSel,
            serieList: serieListSel,
            adresse: adresseSel,
            motif: this.motif,
            motifcode: rmaForm.value.motif,
            refRMA: rmaForm.value.refRMA,
            file: file.name,
            description: this.removeAccents(rmaForm.value.description),
            login: rmaForm.value.login,
            password: rmaForm.value.password,
            IP: rmaForm.value.IP,
            nom: this.removeAccents(rmaForm.value.nom),
            mail: rmaForm.value.mail,
            tel: rmaForm.value.tel,
            cgv: rmaForm.value.cgv,
            numClient: this.authService.currentUser.id
          },
          {
            withCredentials: true,
            responseType: 'json',
          });
    }

  }

}

