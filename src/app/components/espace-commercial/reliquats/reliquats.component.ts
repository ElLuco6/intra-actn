import {Component, EventEmitter, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {environment} from "@env/environment";
import {take, takeUntil} from "rxjs/operators";
import {ProduitService} from "@services/produit.service";
import {Router} from "@angular/router";
import {BehaviorSubject, Observable, Subject} from "rxjs";
import {CommandeCommercial} from "@models/commandeCommercial";
import {SortAndFilterService} from "@services/sort-and-filter.service";
import {FormBuilder, FormControl} from "@angular/forms";
import {ReliquatLigne, Reliquats} from "@models/reliquats";
import {MatAutocompleteTrigger} from "@angular/material/autocomplete";
import {LogClientService, PredictionResultsClient} from "@services/log-client.service";
import {faFilePdf} from "@fortawesome/free-solid-svg-icons";
import {Devis} from "@services/devis.service";

@Component({
  selector: 'app-reliquats',
  templateUrl: './reliquats.component.html',
  styleUrls: ['./reliquats.component.scss']
})
export class ReliquatsComponent implements OnInit, OnDestroy {

  constructor(
    private http: HttpClient,
    private produitService: ProduitService,
    private router: Router,
    public saf: SortAndFilterService,
    private fb: FormBuilder,
    public predictionService: LogClientService
  ) { }

  processedReliquats$ = new BehaviorSubject<Array<Reliquats>>([]);
  reliquats = null;
  display = [];
  environment = environment;
  sentDelay: number[] = [];
  delayInError: number = -1;
  allReliquat: boolean;
  @Output() hasFocusedInputChange = new EventEmitter<boolean>();
  @ViewChild(MatAutocompleteTrigger) autocomplete: MatAutocompleteTrigger;
  autoCompleteOptions$: Observable<PredictionResultsClient>;
  searching: string;
  eventClientSearch;
  protected _destroy$ = new Subject<void>();
  regionSelected: Array<string> = [];
  marquesSelected: Array<string> = [];
  marqueArray: Array<string> = [];

  filtreReliquat = this.fb.group({
    client: '',
    commande: '',
    refCommande: '',
    region: '',
    marques: []
  })

  ngOnInit(): void {
    this.filtreReliquat.get('client').valueChanges.subscribe(searchString => {
      this.searching = searchString;
      this.predictionService.searchString = searchString;
    });
    this.predictionService.searchString$.pipe(takeUntil(this._destroy$)).subscribe(value => {
      if(this.searching !== value){
        this.filtreReliquat.get('client').setValue(value);
      }
      this.autoCompleteOptions$ = this.predictionService.getPredict(value);
      this.searching = value.toUpperCase();
    });
    this.getReliquats('');
  }

  ngOnDestroy() {
    this._destroy$.next();
    this._destroy$.complete();
  }

  tab = [];
  getReliquats(region: string){
    return this.http.get<Array<ReliquatLigne>>(`${environment.apiUrl}/CommandesReliquatRegion.php`, {
      withCredentials: true,
      params: {
        region: region
      }
    }).subscribe((data) => {
      const ret = new Array<Reliquats>();
      data.forEach(dl => {
        if (dl.referencecommande) {
          let reliquat = ret.find(d => d.numcommande === dl.numcommande);
          if (!reliquat) {
            reliquat = new Reliquats();
            reliquat.client = dl.client;
            reliquat.datecommande = new Date(dl.datecommande);
            reliquat.numcommande = dl.numcommande;
            reliquat.datelivraisonprevu = new Date(dl.datelivraisonprevu);
            reliquat.message = dl.message;
            reliquat.pdfar = dl.pdfar;
            reliquat.nom = dl.nom;
            reliquat.referencecommande = dl.referencecommande;
            reliquat.wadresse1 = dl.wadresse1;
            reliquat.wadresse2 = dl.wadresse2;
            reliquat.wcodepostal = dl.wcodepostal;
            reliquat.wnom = dl.wnom;
            reliquat.wphone = dl.wphone;
            reliquat.wville = dl.wville;
            reliquat.numclient = dl.numclient.toString();
            reliquat.Bilan = dl.Bilan;
            reliquat.codepostal = dl.codepostal;
            reliquat.ville = dl.ville;
            reliquat.telephone = dl.telephone;
            reliquat.groupe = dl.groupe;
            reliquat.limiteCredit = dl.limiteCredit;
            reliquat.limiteCreditExceptionnel = dl.limiteCreditExceptionnel;
            reliquat.limiteCreditExceptionnelDate = dl.limiteCreditExceptionnelDate;
            reliquat.EncoursCompta = dl.EncoursCompta;
            reliquat.EncoursBL = dl.EncoursBL;
            reliquat.risqueGlobal = dl.risqueGlobal;
            reliquat.Bilan = dl.Bilan;
            reliquat.note = dl.note;
            reliquat.siren = dl.siren;
            reliquat.naflibelle = dl.naflibelle;
            reliquat.region = dl.region;
            reliquat.commercialNom1 = dl.commercialNom1;
            reliquat.commercialMail1 = dl.commercialMail1;
            reliquat.commercialTel1 = dl.commercialTel1;
            reliquat.commercialNom2 = dl.commercialNom2;
            reliquat.commercialMail2 = dl.commercialMail2;
            reliquat.commercialTel2 = dl.commercialTel2;
            reliquat.produits = [];
            ret.push(reliquat);
          }
          reliquat.produits.push({
              marque: dl.marque,
              prod: dl.prod,
              designation: dl.designation,
              quantitealivrer: dl.quantitealivrer,
              quantitecommande: dl.quantitecommande,
              qtestockexterne: dl.qtestockexterne,
              qtestock: dl.qtestock,
              Delaireapprostd: dl.Delaireapprostd,
              datelivraisonprevu: dl.datelivraisonprevu,
              qteencommande: dl.qteencommande,

          });
        }
      });
      this.tab = ret;
      this.setDisplay();
      this.tab.forEach((d) => {
        d.produits.forEach((p) => {
          this.marqueArray.push(p.marque);
        });
      });
      this.marqueArray = this.marqueArray.filter((x, i) => this.marqueArray.indexOf(x) === i);
      this.marqueArray = this.marqueArray.sort();
      this.allReliquat = false;
      this.regionSelected = this.saf.getFiltre('reliquat', 'region', 'includes') as Array<string> || [];
      this.marquesSelected = this.saf.getFiltre('reliquat', 'marque', 'includes') as Array<string> || [];
      this.processedReliquats$.next(this.saf.filtrer('reliquat', ret));
    });
  }

  onSearch(target: string, type: string, method: string, event, values?: string): void{
    if (values) {
      setTimeout(() => this.processedReliquats$.next(this.saf.onFiltre('reliquat', target, type, method, this[values], this.tab)), 1);
    } else {
      setTimeout(() => this.processedReliquats$.next(this.saf.onFiltre('reliquat', target, type, method, event['target'].value != null ? event['target'].value : event['target'].innerText, this.tab)), 1);
    }
  }

  resetOneFilters(filter: string) {
    // RESET ONE FILTERS
    this.filtreReliquat.get(filter).setValue('');
    this.saf.resetFiltre('reliquat', filter + 'includes');
    this.processedReliquats$.next(this.saf.filtrer('reliquat', this.tab));
  }

  onTri(s: string, type: string): void {
    this.processedReliquats$.next(this.saf.onTri('reliquat', s, type, this.processedReliquats$.value));
  }

  selected(s: string): string {
    return this.saf.getTri('reliquat')[0] === s ? this.saf.getTri('reliquat')[1] : 'off';
  }


  get region(): Array<any> {
    let region = [];
    this.tab.forEach((e) => {
      region.push(e.region);
    });
    region = region.filter((x, i) => region.indexOf(x) === i);
    return region;
  }

  unrollDetails(entete)
  {
    /* IF hidden */
    this.display[entete] = this.display[entete] == false;
  }

  setDisplay() {
    this.display = new Array(this.tab.length).fill(false);
  }

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

  envoiDemandeDeDelai(ncmd: number, refcmd: string, date: string, index: number): void
  {

    if (!this.sentDelay.includes(index))
    {
      this.sentDelay.push(index);
      this.delayInError = -1;

      this.http.get<any>(
        `${environment.apiUrl}/envoiMailDelai.php`,
        {
          params: {
            numcommande: ncmd.toString(),
            referencecommande: refcmd,
            datecommande: date
          },
          withCredentials: true,
          responseType: 'json'
        }
      ).pipe(take(1))
        .subscribe(
          (ret) => {
            //this.sentDelay.push(index);
          },
          (erreur) => {
            this.sentDelay.splice(this.sentDelay.indexOf(index), 1);
            this.delayInError = index;
          }
        );
    }
  }

  isChecked(){
    if(!this.allReliquat){
      this.getReliquats('ALL');
    }else{
      this.getReliquats('');
    }
  }

  inputFocused() {
    this.hasFocusedInputChange.emit(true);
  }

  openTab(client) {
    const url = this.router.serializeUrl(
      this.router.createUrlTree(['/client-detail', client], {
        queryParams: { display: 'reliquats' }
      })
    );
    window.open(url, '_blank');
  }

  start(mot: string): string {
    // verification de la recherche présente dans le mot
    if (mot.includes(this.searching)) {
      // découpage du mot pour ne renvoyer que le début (avant l'occurence de la recherche)
      return mot.slice(0, mot.indexOf(this.searching, 0));
    }
    else {
      // si la recherche n'est pas dans le mot (cas possible que lors d'une recherche reference/deignation),
      // la fonction start renvoie le mot et la fonction end renvoie la chaine vide afin de ne pas avoir de modification du mot
      return mot;
    }
  }


  // meme fonction qui permet de renvoyer la fin du mot
  end(mot: string): string {
    if (mot.includes(this.searching)) {
      return mot.slice(mot.indexOf(this.searching, 0) + this.searching.length);
    }
    else {
      // si la recherche n'est pas dans le mot (cas possible que lors d'une recherche reference/deignation),
      // la fonction start renvoie le mot et la fonction end renvoie la chaine vide afin de ne pas avoir de modification du mot
      return '';
    }
  }

  protected readonly faFilePdf = faFilePdf;
}
