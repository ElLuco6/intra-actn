import {Component, Input, OnInit} from '@angular/core';
import {environment} from "@env/environment";
import {take} from "rxjs/operators";
import {HttpClient} from "@angular/common/http";
import {ProduitService} from "@services/produit.service";
import {Router} from "@angular/router";
import {AuthenticationService} from "@services/authentication.service";
import {FormBuilder} from "@angular/forms";
import {BehaviorSubject} from "rxjs";
import {SortAndFilterService} from "@services/sort-and-filter.service";
import {Reliquats} from "@models/reliquats";
import {faFilePdf} from "@fortawesome/free-solid-svg-icons";
import {LogClientService} from "@services/log-client.service";

@Component({
  selector: 'app-reliquats',
  templateUrl: './reliquats.component.html',
  styleUrls: ['./reliquats.component.scss']
})
export class ReliquatsComponent implements OnInit {

  @Input() numClient: number = 0;
  environment = environment;

  reliquat$ = new BehaviorSubject<Array<Reliquats>>([]);
  reliquats = null;
  display = [];

  loading: boolean = true;

  filtreForm = this.fb.group({
    commande: '',
    refCommande: ''
  })

  constructor(
      private http: HttpClient,
      private authService: AuthenticationService,
      private produitService: ProduitService,
      private router: Router,
      private fb: FormBuilder,
      public saf: SortAndFilterService,
      private logClient: LogClientService
    )
  {}

  ngOnInit()
  {
    this.loading = true;

    if(this.numClient == 0){
      setTimeout(() => {
        this.requestReliquats(this.logClient.currentClient.id);
        this.numClient = this.logClient.currentClient.id;
      }, 100)
    }else{
      this.requestReliquats(this.numClient);
    }
  }
  ngOnDestroy()
  {

    if (this.reliquat$ != null) {
      this.reliquat$.unsubscribe();
    }
  }

  numeroRel = null;
  sousTableauRel = [];
  tab = [];
  requestReliquats(numClient: number)
  {
      this.http.get<any>(
        `${environment.apiUrl}/CommandesReliquat.php`,
        {
          withCredentials: true,
          responseType: 'json',
          params: {
            client: numClient
          }
        }
      ).subscribe(
        (ret) => {
          ret.forEach((e) => {
            if(e.numcommande != this.numeroRel){
              this.numeroRel = e.numcommande;
              this.sousTableauRel = [];
              this.sousTableauRel.push(e)
              if(this.sousTableauRel){
                this.tab.push(this.sousTableauRel);
              }
            }else{
              this.sousTableauRel.push(e);
            }
          });
          this.reliquats = ret;
          this.reliquat$.next(this.saf.filtrer('reliquat',this.tab));
          this.setDisplay();
        }
      );
  }

  onSearch(target: string, type: string, method: string, event: string, values?: string): void{
    if (values) {
      setTimeout(() => this.reliquat$.next(this.saf.onFiltre('reliquat', target, type, method, this[values], this.tab)), 1);
    } else {
      setTimeout(() => this.reliquat$.next(this.saf.onFiltre('reliquat', target, type, method, event['target'].value != null ? event['target'].value : event['target'].innerText, this.tab)), 1);
    }
  }

  resetOneFilters(filter: string) {
    this.filtreForm.get(filter).setValue('');
    this.saf.resetFiltre('reliquat', filter + 'includes');
    this.reliquat$.next(this.saf.filtrer('reliquat', this.reliquats))
  }

  unrollDetails(entete)
  {
    this.display[entete] = this.display[entete] == false;
  }

  setDisplay()
  {
    this.display = new Array(this.reliquats.length).fill(false);
  }

  /**
   * Revois le lien de la fiche du produit à partir de sa/son seul(e) reference/ID :string
   */
  linkToProduct(produitId: string) {
    this.produitService.getProduitById(produitId)
      .pipe(take(1))
      .subscribe(
        (ret) => {
          this.router.navigateByUrl(
            String(this.produitService.lienProduit(ret))
              .replace(/,/g, "/")
          );
        }
      );
  }


  protected readonly faFilePdf = faFilePdf;
}
