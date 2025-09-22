import { Component, OnInit } from '@angular/core';
import {Subject, take, takeUntil} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {AuthenticationService} from "@services/authentication.service";
import {environment} from "@env/environment";

@Component({
  selector: 'app-outils',
  templateUrl: './outils.component.html',
  styleUrls: ['./outils.component.scss']
})
export class OutilsComponent implements OnInit {

  public environment = environment;
  public userIsConnected: boolean = false;

  public outils: any = undefined; // retour de ListeOutils.php
  public outilsKeys: string[] = null;
  public sortedOutils: any = {}; //Array<{categorie: string, outils: Array<any>}> = new Array<{categorie: string, outils: Array<any>}>();
  public sortedOutilsKeys: string[] = null;

  colors: string[] = [/*ACTN*/"#003264", /*ORANGE*/"#ff6801", /*VERT*/"#64be00", /*ROUGE*/"#c20e1a", /*JAUNE*/"#f9b62a", /*BLEU*/"#005bcb", /*DARK GREY*/"#3b3b3b", /*MAGENTA*/"#ff2c3b", /*CYAN*/"#00b2ff"];

  private _destroy$ = new Subject<void>();

  // INITIALISATION

  constructor(
    private http: HttpClient,
    private authenticationService: AuthenticationService
  ) { }

  ngOnInit(): void
  {
    // récupération des outils
    this.http.get(`${environment.apiUrl}/ListeOutils.php`, {
      withCredentials: true,
      responseType: 'json'
    })
      .pipe(take(1))
      .subscribe(
        (ret) =>
        {
          this.outils = ret;
          this.outilsKeys = Object.keys(ret);

          this.sortOutils(this.outils);
        },
        (error) =>
        {
          console.error("Echec de la récupération des outils avec 'ListeOutils.php' :", error);
          this.outils = null;
        }
      )

    this.subscriptionToUser();
  }

  ngOnDestroy(): void
  {
    this._destroy$.next();
    this._destroy$.complete();
  }

  // Array<{categorie: string, outils: Array<any>}>
  sortOutils(outils: any): void {
    const outilsKeys: Array<string> = Object.keys(outils);

    outilsKeys.forEach(key => {
      const currentOutil = outils[key];

      if (this.sortedOutils[currentOutil.categorie]) {
        this.sortedOutils[currentOutil.categorie].outils.push(currentOutil);
      } else {
        this.sortedOutils[currentOutil.categorie] = { categorie: currentOutil.categorie, outils: [currentOutil] };
      }
    });

    this.sortedOutilsKeys = Object.keys(this.sortedOutils);
  }

  subscriptionToUser(): void
  {
    // lance le subscribe à chanque changement d'user
    this.authenticationService.currentUser$
      .pipe(takeUntil(this._destroy$))
      .subscribe(
        (ret) =>
        {
          if (ret)
          {
            this.userIsConnected = true;
          }
        },
        (error) =>
        {
          console.error("In OutilsComponent, subscriptionToUser failed !", error);
        }
      );
  }

}
