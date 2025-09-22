import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from "@env/environment";
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { User } from "@/models";
import { AuthenticationService } from './authentication.service';

@Injectable({
  providedIn: 'root'
})
export class DevisService {

  public details = new Array<boolean>();
  public user = new User();
  public scroll = 0;
  public paginator = {
    pageIndex: 0,
    pageSize: 10,
    pageSizeOptions: [5, 10, 25, 50, 100],
    previousPageIndex: -1,
    low: 0,
    high: 10
  };

  private _nbDevis = 0;

  constructor(
    private http: HttpClient,
    private authService: AuthenticationService
  ) {
    this.authService.currentUser$.subscribe(() => {
      this._resetAttributs();
    });
  }

  numclient;

  /**
   * Renvoi la liste des devis.
   */
  public getDevis(client): Observable<Array<Devis>> {
    this.numclient = client;
    return this.http.get<Array<DevisLigne>>(`${environment.apiUrl}/ListeDevis.php`, {
      withCredentials: true,
      responseType: 'json',
      params: {
        client: this.numclient
      }
    }).pipe(map((dls: Array<DevisLigne>) => {
      const ret = new Array<Devis>();
      dls.forEach(dl => {
        if (dl.referencecommande) {
          let devis = ret.find(d => d.numcommande === dl.numcommande);
          if (!devis) {
            devis = new Devis();
            devis.numcommande = dl.numcommande;
            devis.referencecommande = dl.referencecommande;
            devis.datecommande = new Date(dl.datecommande);
            devis.mthtcommande = +dl.mthtcommande;
            devis.mtttccommande = +dl.mtttccommande;
            devis.transporteur = dl.transporteur;
            devis.mtfraisdeport = +dl.mtfraisdeport;
            devis.typedevis = dl.typedevis;
            devis.transactioncode = dl.transactioncode;
            devis.transactionlib = dl.transactioncode === 'DEV' ? 'Devis ACTN' : 'Vos Devis';
            devis.wnom = dl.wnom;
            devis.wadresse1 = dl.wadresse1;
            devis.wadresse2 = dl.wadresse2;
            devis.wcodepostal = dl.wcodepostal;
            devis.wville = dl.wville;
            devis.wphone = dl.wphone;
            devis.wpays = dl.wpays;
            devis.wpayscode = dl.wpayscode;
            devis.wpaysiso = dl.wpaysiso;
            devis.statut = this._calculStatut(devis.datecommande);
            devis.usercde = dl.usercde;
            devis.usercdemail = dl.usercdemail;
            devis.haspdf = dl.pdfdevis;
            devis.produits = [];
            ret.push(devis);
          }
          devis.produits.push({
            marque: dl.marque,
            marquelib: dl.marquelib,
            prod: dl.prod,
            designation: dl.designation,
            quantitecommande: +dl.quantitecommande,
            prixbase: +dl.prixbase,
            prixnet: +dl.prixnet,
            prixd3e: +dl.prixd3e,
            enStock: dl.enStock,
            dispo: dl.dispo,
            qteStock1: +dl.qteStock1,
            qteStock2: +dl.qteStock2,
            delaisReappro: this._setDate(+dl.delaisReappro),
            dateConfReappro: dl.dateConfReappro,
            ConfReapproStatus: dl.ConfReapproStatus,
            qteEnReappro: +dl.qteEnReappro,
            gabarit: dl.gabarit
          });
          if (!devis.enduser) {
            devis.enduser = {
              adresse1: dl.enduseradresse1,
              adresse2: dl.enduseradresse2,
              codepostal: dl.endusercodepostal,
              nom: dl.endusernom,
              pays: dl.enduserpays,
              payscode: dl.enduserpayscode,
              paysiso: dl.enduserpaysiso,
              telephone: dl.enduserphone,
              ville: dl.enduserville,
              mail: dl.endusermail
            };
          }
        }
      });
      if (ret.length !== this._nbDevis) {
        this._resetAttributs();
      }
      this._nbDevis = ret.length;
      ret.sort((d1, d2) => d2.datecommande.getTime() - d1.datecommande.getTime());
      return ret;
    }));
  }

  /**
   * Renvoi la liste des devis.
   */
  public getDevisRegion(region): Observable<Array<Devis>> {
    return this.http.get<Array<DevisLigne>>(`${environment.apiUrl}/ListeDevisRegion.php`, {
      withCredentials: true,
      responseType: 'json',
      params: {
        region: region
      }
    }).pipe(map((dls: Array<DevisLigne>) => {
      const ret = new Array<Devis>();
      dls.forEach(dl => {
        if (dl.referencecommande) {
          let devis = ret.find(d => d.numcommande === dl.numcommande);
          if (!devis) {
            devis = new Devis();
            devis.client = dl.client;
            devis.numcommande = dl.numcommande;
            devis.referencecommande = dl.referencecommande;
            devis.datecommande = new Date(dl.datecommande);
            devis.mthtcommande = +dl.mthtcommande;
            devis.mtttccommande = +dl.mtttccommande;
            devis.transporteur = dl.transporteur;
            devis.mtfraisdeport = +dl.mtfraisdeport;
            devis.typedevis = dl.typedevis;
            devis.transactioncode = dl.transactioncode;
            devis.transactionlib = dl.transactioncode === 'DEV' ? 'Devis ACTN' : 'Vos Devis';
            devis.wnom = dl.wnom;
            devis.wadresse1 = dl.wadresse1;
            devis.wadresse2 = dl.wadresse2;
            devis.wcodepostal = dl.wcodepostal;
            devis.wville = dl.wville;
            devis.wphone = dl.wphone;
            devis.wpays = dl.wpays;
            devis.wpayscode = dl.wpayscode;
            devis.wpaysiso = dl.wpaysiso;
            devis.statut = this._calculStatut(devis.datecommande);
            devis.usercde = dl.usercde;
            devis.usercdemail = dl.usercdemail;
            devis.haspdf = dl.pdfdevis;
            devis.produits = [];
            ret.push(devis);
          }
          devis.produits.push({
            marque: dl.marque,
            marquelib: dl.marquelib,
            prod: dl.prod,
            designation: dl.designation,
            quantitecommande: +dl.quantitecommande,
            prixbase: +dl.prixbase,
            prixnet: +dl.prixnet,
            prixd3e: +dl.prixd3e,
            enStock: dl.enStock,
            dispo: dl.dispo,
            qteStock1: +dl.qteStock1,
            qteStock2: +dl.qteStock2,
            delaisReappro: this._setDate(+dl.delaisReappro),
            dateConfReappro: dl.dateConfReappro,
            ConfReapproStatus: dl.ConfReapproStatus,
            qteEnReappro: +dl.qteEnReappro,
            gabarit: dl.gabarit
          });
          if (!devis.enduser) {
            devis.enduser = {
              adresse1: dl.enduseradresse1,
              adresse2: dl.enduseradresse2,
              codepostal: dl.endusercodepostal,
              nom: dl.endusernom,
              pays: dl.enduserpays,
              payscode: dl.enduserpayscode,
              paysiso: dl.enduserpaysiso,
              telephone: dl.enduserphone,
              ville: dl.enduserville,
              mail: dl.endusermail
            };
          }
        }
      });
      if (ret.length !== this._nbDevis) {
        this._resetAttributs();
      }
      this._nbDevis = ret.length;
      ret.sort((d1, d2) => d2.datecommande.getTime() - d1.datecommande.getTime());
      return ret;
    }));
  }

  /**
   * Transmet une demande de modification de devis aux commerciaux.
   * @param nodevis Le numéro du devis à modifier
   * @param commentaire Le commentaire transmis par l'utilisateur
   */
  public demandeModification(nodevis: string, commentaire: string): Observable<void> {
    return this.http.post<void>(
      `${environment.apiUrl}/DevisModification.php`,
      {
        nodevis,
        commentaire
      },
      {
        withCredentials: true
      }
    );
  }

  /**
   * Définit le statut d'un devis selon sa date de création.
   * @param date La date du devis
   */
  private _calculStatut(date: Date): string {
    const d = new Date();
    d.setTime(date.getTime());
    d.setDate(d.getDate() + 30);
    return d.getTime() > new Date().getTime() ? 'Actif' : 'Perimé';
  }

  /**
   * Reset les attributs de sauvegarde du composant de la liste des devis.
   */
  private _resetAttributs(): void {
    this.user = this.authService.currentUser;
    this.details = new Array<boolean>();
    this.scroll = 0;
    this.paginator = {
      pageIndex: 0,
      pageSize: 10,
      pageSizeOptions: [5, 10, 25, 50, 100],
      previousPageIndex: -1,
      low: 0,
      high: 10
    };
  }

  private _setDate(days: number): Date | string {
    const ret = new Date();
    ret.setDate(ret.getDate() + days);
    return ret.getTime() === new Date().getTime() ? 'n.c.' : ret;
  }
}

class DevisLigne {
  client: string;
  // INFO DEVIS
  numcommande: string;
  referencecommande: string;
  datecommande: string;
  mtttccommande: string;
  mthtcommande: string;
  transporteur: string;
  mtfraisdeport: string;
  typedevis: string;
  transactioncode: string;
  transactionlib: string;
  wnom: string;
  wadresse1: string;
  wadresse2: string;
  wcodepostal: string;
  wville: string;
  wphone: string;
  wpays: string;
  wpayscode: string;
  wpaysiso: string;
  usercde: string;
  usercdemail: string;
  pdfdevis: boolean;

  // INFO PRODUIT
  marque: string;
  marquelib: string;
  prod: string;
  designation: string;
  quantitecommande: string;
  prixbase: string;
  prixnet: string;
  prixd3e: string;
  enStock: string;
  dispo: string;
  qteStock1: string;
  qteStock2: string;
  delaisReappro: string;
  dateConfReappro: string;
  ConfReapproStatus: string;
  qteEnReappro: string;
  gabarit: string;

  // INFO ENDUSER
  enduseradresse1: string;
  enduseradresse2: string;
  endusercodepostal: string;
  endusernom: string;
  enduserpays: string;
  enduserpayscode: string;
  enduserpaysiso: string;
  enduserphone: string;
  endusermail: string;
  enduserville: string;
}

export class Devis {
  numcommande: string;
  referencecommande: string;
  datecommande: Date;
  mthtcommande: number;
  mtttccommande: number;
  transporteur: string;
  mtfraisdeport: number;
  typedevis: string;
  transactioncode: string;
  transactionlib: string;
  wnom: string;
  wadresse1: string;
  wadresse2: string;
  wcodepostal: string;
  wville: string;
  wphone: string;
  wpays: string;
  wpayscode: string;
  wpaysiso: string;
  statut: string;
  usercde: string;
  usercdemail: string;
  haspdf: boolean;
  client: string;
  region: string;
  produits: Array<{
    marque: string;
    marquelib: string;
    prod: string;
    designation: string;
    quantitecommande: number;
    prixbase: number;
    prixnet: number;
    prixd3e: number;
    enStock: string;
    dispo: string;
    qteStock1: number;
    qteStock2: number;
    delaisReappro: Date | string;
    dateConfReappro: string;
    ConfReapproStatus: string;
    qteEnReappro: number;
    gabarit: string;
  }>;
  enduser: {
    nom: string;
    adresse1: string;
    adresse2: string;
    ville: string;
    codepostal: string;
    pays: string;
    payscode: string;
    paysiso: string;
    telephone: string;
    mail: string;
  };
}
