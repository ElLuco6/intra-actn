import {Component, ElementRef, NgZone, OnInit, QueryList, ViewChildren} from '@angular/core';
import {AdresseService} from "@services/adresse.service";
import {ProduitService} from "@services/produit.service";
import {CartItem, CataloguePosition, Filtre, Produit} from "@/models";
import {debounceTime, map, skip, take, takeUntil, tap} from "rxjs/operators";
import {ActivatedRoute, Router} from "@angular/router";
import {SortAndFilterService} from "@services/sort-and-filter.service";
import {Client, Licence} from "@models/licence";
import {PageEvent} from "@angular/material/paginator";
import {FiltreDate, LicenceService} from "@services/licence.service";
import {BehaviorSubject, fromEvent, Observable, Subject} from "rxjs";
import {FormBuilder, FormControl} from "@angular/forms";
import {WindowService} from "@services/window.service";
import {environment} from "@env/environment";
import {
  faBell,
  faBellSlash,
  faCheckCircle, faHistory,
  faMinusCircle,
  faPenSquare,
  faPlusCircle,
  faTimesCircle
} from "@fortawesome/free-solid-svg-icons";
import {LogClientService} from "@services/log-client.service";

@Component({
  selector: 'app-contrats',
  templateUrl: './contrats.component.html',
  styleUrls: ['./contrats.component.scss']
})
export class ContratsComponent implements OnInit {

  @ViewChildren('licence') protected _listeLicences: QueryList<ElementRef>;

  environment = environment;
  historyShow: Array<boolean> = [];
  editShow: Array<boolean> = [];
  stringsNoSerie: Array<string> = [];
  filtres$: Observable<Array<Filtre>>;
  selectedTab = new FormControl(0);

  get processedLicences$(): Observable<Array<Licence>> {
    return this._processedLicences$.asObservable().pipe(map(licences => {
      if (this.prioritaire) {
        const splittedLicences = this.splitPrioritaire(licences);
        return [].concat(splittedLicences[0]).concat(splittedLicences[1]);
      } else {
        return licences;
      }
    }));
  }

  filtreMarque: Filtre;
  get filtreValues(): Array<unknown> {
    return this.licenceService.filtreValues;
  }

  filtresForm = this.fb.group({});
  get filtreTout(): string {
    return this.licenceService.filtreTout;
  }
  get filtresExpirant(): Array<string> {
    return this.licenceService.filtresExpirant;
  }
  get filtresExpire(): Array<string> {
    return this.licenceService.filtresExpire;
  }
  get filtresDate(): Array<FiltreDate> {
    return this.licenceService.filtresDate;
  }
  get selectedFiltreDate(): string {
    return this.licenceService.selectedFiltreDate;
  }
  set selectedFiltreDate(value: string) {
    this.licenceService.selectedFiltreDate = value;
  }
  prioritaire = true;
  showPopup = false;
  licencePopup: Licence;
  produits: { [reference: string]: CartItem; };
  clientPopup: Client;

  showHelpPopup = false;
  isAskingForHelp = false;
  demandeAideEnvoyee = false;
  commentaire = '';
  produitHelpPopup: Produit;
  produitsSimilaires: Array<Produit>;

  get paginator(): {
    pageIndex: number;
    pageSize: number;
    pageSizeOptions: number[];
    previousPageIndex: number;
    low: number;
    high: number;
  } {
    return this.licenceService.paginator;
  }

  get detailsShow(): Array<boolean> {
    return this.licenceService.details;
  }

  protected _processedLicences$ = new BehaviorSubject<Array<Licence>>([]);
  protected _destroy$ = new Subject<void>();
  protected _licences: Array<Licence> = [];
  protected _now = new Date();
  protected _date = new Date();
  protected _pageID = 'licence';
  protected _defaultSort = 'renouvellementdate';

  constructor(
    public licenceService: LicenceService,
    public produitService: ProduitService,
    protected fb: FormBuilder,
    protected router: Router,
    protected activatedRoute: ActivatedRoute,
    public adresseService: AdresseService,
    protected ngZone: NgZone,
    protected window: WindowService,
    protected saf: SortAndFilterService,
    protected authClient: LogClientService
  ) { }

  ngOnInit(): void {
    this.saf.setTri(this._pageID, this._defaultSort, 'date', 'desc');
    this.processedLicences$
      .pipe(skip(1), takeUntil(this._destroy$))
      .subscribe(() => {
        this.paginator.low = 0;
        this.paginator.high = this.paginator.pageSize;
        this.paginator.pageIndex = 0;
      });

    this.licenceService.getLicences()
      .pipe(
        map((licences: Array<Licence>) => licences.filter((licence: Licence) => licence.produit.reference !== '')),
        takeUntil(this._destroy$)
      ).subscribe((licences) => {
      this._licences = licences;
      this.filtres$ = this.licenceService.getFiltres()
        .pipe(
          takeUntil(this._destroy$),
          map((filtres: Array<Filtre>) => {
            const marques = new Set<string>();
            this._licences.forEach(licence => marques.add(licence.produit.marque));
            filtres.find((filtre: Filtre) => (filtre.target as string).includes('marque')).options = Array.from(marques).sort();
            return filtres;
          }),
          tap((filtres: Array<Filtre>) => {
            this.filtreMarque = filtres.find((filtre: Filtre) => (filtre.target as string).includes('marque'));
            filtres.forEach((filtre: Filtre) => {
              this.filtresForm.addControl(filtre.target as string, new FormControl(''));
              this.filtreValues[filtre.target] = this.saf.getFiltre(this._pageID, filtre.target as string, filtre.method) ?? [];
            });
          }));
    });

    this.ngZone.runOutsideAngular(() => {
      fromEvent(this.window.document, 'scroll')
        .pipe(
          skip(1),
          debounceTime(20),
          takeUntil(this._destroy$))
        .subscribe(() => {
          this.licenceService.scroll = this.window.pageYOffset;
        });
    });
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  ngAfterViewInit(): void {
    this._listeLicences.changes
      .pipe(
        takeUntil(this._destroy$),
        debounceTime(100)
      ).subscribe(() => {
      this.window.scrollTo(0, this.licenceService.scroll);
    });
  }

  /**
   * Indique si les détails d'une licence doivent s'afficher.
   * @param index index de la licence
   */
  isActive(index: number): boolean {
    return !!this.detailsShow[index];
  }

  /**
   * Indique si l'historique d'une licence doit s'afficher.
   * @param index index de la licence
   */
  isHistoryActive(index: number): boolean {
    return !!this.historyShow[index];
  }

  /**
   * Indique si le numéro de série d'une licence est en cours d'édition.
   * @param index index de la licence
   */
  isEditing(index: number): boolean {
    return !!this.editShow[index];
  }

  /**
   * Affiche ou cache les détails d'une licence.
   * @param index index de la licence
   */
  showDetails(index: number): void {
    this.detailsShow[index] = !this.detailsShow[index];
    this.adresseService.getCountryFromCode(this._licences[index].client.pays).subscribe(pays => {
      this._licences[index].client.pays = this.adresseService.getNameOfCountry(pays);
    });
  }

  /**
   * Affiche l'historique d'une licence
   * @param index L'index de la licence dans l'affichage
   */
  showHistory(index: number): void {
    this.historyShow[index] = !this.historyShow[index];
  }

  /**
   * Commence l'édition du numéro de série d'une licence.
   */
  startEdit(index: number, licence: Licence): void {
    this.stringsNoSerie[index] = licence.serie;
    this.editShow[index] = true;
  }

  /**
   * Arrête l'édition du numéro de série d'une licence.
   */
  stopEdit(index: number): void {
    this.stringsNoSerie[index] = '';
    this.editShow[index] = false;
  }

  /**
   * Édite le numéro de série d'une licence.
   */
  editNoSerie(index: number, licence: Licence): void {
    licence.client.serie = this.stringsNoSerie[index];
    licence.serie = this.stringsNoSerie[index];
    this.licenceService.postEnduser(licence.client, licence.commande.numcommande)
      .subscribe(() => {
        this.licenceService.majEnduser().pipe(take(1)).subscribe(() => {
          this.stopEdit(index);
        });
      });
  }

  /**
   * Indique si un tri est en cours d'utilisation.
   * @param s Le nom d'un tri
   */
  selected(s: string): string {
    return this.saf.getTri(this._pageID)[0] === s ? this.saf.getTri(this._pageID)[1] : 'off';
  }

  getFiltre(filterTarget: string, filterMethod: string): unknown {
    return this.saf.getFiltre(this._pageID, filterTarget, filterMethod);
  }

  /**
   * Sélectionne ou déselectionne une marque dans le filtre de marque.
   * @param marque Le nom de la marque à filtrer
   */
  filtreMarqueToggle(marque: string): void {
    if (this.filtreValues['produit.marque'].includes(marque)) {
      this.filtreValues['produit.marque'].splice(this.filtreValues['produit.marque'].findIndex(ms => ms === marque));
    } else {
      this.filtreValues['produit.marque'].push(marque);
    }
    this.filtreValues['produit.marque'] = [].concat(this.filtreValues['produit.marque']);
    setTimeout(() => this._processedLicences$.next(this.saf.onFiltre(this._pageID, 'produit.marque', 'array', 'includes', this.filtreValues['produit.marque'], this._licences)), 1);
  }

  /**
   * Déclenche le filtrage des devis quand un filtre est modifié.
   * @param target La colonne sur laquelle filtrer
   * @param event L'objet lié à l'évènement déclencheur
   */
  onSearch(target: string, type: string, method: string, event: string, values?: string): void {
    if (values) {
      setTimeout(() => this._processedLicences$.next(this.saf.onFiltre(this._pageID, target, type, method, values, this._licences)), 1);
    } else {
      setTimeout(() => this._processedLicences$.next(this.saf.onFiltre(this._pageID, target, type, method, event['target'].value != null ? event['target'].value : event['target'].innerText, this._licences)), 1);
    }
  }

  /**
   * Split les licences en deux sous-tableaux, les licences prioritaires et les autres
   * @param licences La liste des licences à split
   * @returns [Licences prioritaires, les autres licences]
   */
  splitPrioritaire(licences: Array<Licence>): [Array<Licence>, Array<Licence>] {
    const prio = licences.filter(licence => this.licenceService.isPrioritaire(licence));
    licences = licences.filter(licence => !prio.includes(licence));
    return [prio, licences];
  }

  /**
   * Déclenche le tri des éléments quand un des éléments du bandeau est cliqué.
   * @param s La colonne sur laquelle trier
   * @param type Le type de tri a effectuer
   */
  onTri(s: string, type: string): void {
    this._processedLicences$.next(this.saf.onTri(this._pageID, s, type, this._processedLicences$.value));
  }

  /**
   * Déclenche le filtrage des licences quand le sélecteur de date d'expiration est modifié.
   */
  onFiltreDate(): void {
    this._date = new Date();
    switch (this.selectedFiltreDate) {
      case this.filtresDate[0].options[0]:
        this._date.setDate(this._now.getDate() + 7);
        this._processedLicences$.next(this.saf.onFiltre(this._pageID, 'renouvellementdate', 'date', 'GE', this._now, this._licences));
        this._processedLicences$.next(this.saf.onFiltre(this._pageID, 'renouvellementdate', 'date', 'LE', this._date, this._licences));
        break;
      case this.filtresDate[0].options[1]:
        this._date.setDate(this._now.getDate() + 15);
        this._processedLicences$.next(this.saf.onFiltre(this._pageID, 'renouvellementdate', 'date', 'GE', this._now, this._licences));
        this._processedLicences$.next(this.saf.onFiltre(this._pageID, 'renouvellementdate', 'date', 'LE', this._date, this._licences));
        break;
      case this.filtresDate[0].options[2]:
        this._date.setDate(this._now.getDate() + 30);
        this._processedLicences$.next(this.saf.onFiltre(this._pageID, 'renouvellementdate', 'date', 'GE', this._now, this._licences));
        this._processedLicences$.next(this.saf.onFiltre(this._pageID, 'renouvellementdate', 'date', 'LE', this._date, this._licences));
        break;
      case this.filtresDate[1].options[0]:
        this._date.setDate(this._now.getDate() - 15);
        this._processedLicences$.next(this.saf.onFiltre(this._pageID, 'renouvellementdate', 'date', 'LE', this._now, this._licences))
        this._processedLicences$.next(this.saf.onFiltre(this._pageID, 'renouvellementdate', 'date', 'GE', this._date, this._licences));
        break;
      case this.filtresDate[1].options[1]:
        this._date.setDate(this._now.getDate() - 30);
        this._processedLicences$.next(this.saf.onFiltre(this._pageID, 'renouvellementdate', 'date', 'LE', this._now, this._licences))
        this._processedLicences$.next(this.saf.onFiltre(this._pageID, 'renouvellementdate', 'date', 'GE', this._date, this._licences));
        break;
      case this.filtresDate[1].options[2]:
        this._date.setMonth(this._now.getMonth() - 3);
        this._processedLicences$.next(this.saf.onFiltre(this._pageID, 'renouvellementdate', 'date', 'LE', this._now, this._licences))
        this._processedLicences$.next(this.saf.onFiltre(this._pageID, 'renouvellementdate', 'date', 'GE', this._date, this._licences));
        break;
      default:
        this.saf.resetFiltre(this._pageID, 'renouvellementdateGE');
        this.saf.resetFiltre(this._pageID, 'renouvellementdateLE');
        this._processedLicences$.next(this.saf.filtrer(this._pageID, this._licences));
        break;
    }
  }

  /**
   * Déclenche le tri par priorité quand la valeur de la checkbox de la priorité est modifiée.
   * @param event La checkbox de priorité
   */
  onPriorite(event: boolean): void {
    this.prioritaire = event;
  }

  /**
   * Redirige vers la page de renouvellement d'une licence.
   * @param licence La licence à renouveler
   */
  modifier(licence: Licence): void
  {
    this.produits = { a: CartItem.fromObject({ produit: { marque: licence.produit.marque, gabarit: 'V' }, qte: 1 }) };
    this.licencePopup = licence;
    const ready = new Subject<void>();
    let filtresMarques: any[];
    let filtresMarqueOf: any[];

    this.produitService.getProduitsRemplacement(licence.produit.reference)
      .pipe(take(1))
      .subscribe(produits => {
        const lic = {
          produit: {
            marque: licence.produit.marque,
            reference: licence.produit.reference
          },
          niv1: licence.niv1,
          niv2: licence.niv2,
          niv3: licence.niv3,
          quantite: licence.quantite
        };
        if (produits.length > 0) {
          lic.produit.reference = produits[0].reference;
          lic.niv1 = produits[0]['niveaucode1'];
          lic.niv2 = produits[0]['niveaucode2'];
          lic.niv3 = produits[0]['niveaucode3'];
        }
        ready.pipe(skip(1)).subscribe(() => {
          // Recherche le filtreMarque correspondant
          const filtresMarque = filtresMarques.find(filtresMarque => filtresMarque['marque'] === lic.produit.marque
            && filtresMarque['NIV1'] === lic.niv1
            && filtresMarque['NIV2'] === lic.niv2);
          if (filtresMarque != null) {
            // Recherche le filtreMarquedetails correspondant
            const licenceOfFiltres = filtresMarqueOf.find(fmo => fmo['produit'] === lic.produit.reference);
            if (licenceOfFiltres != null) {
              this.router.navigate(['modification'], {
                relativeTo: this.activatedRoute,
                state: { licence, licenceOfFiltres, filtresMarqueOf: filtresMarqueOf.filter(fmo => fmo['val01'] == licenceOfFiltres['val01']), filtresMarque }
              });
            } else {
              // Si ESET, pour les ref incomplètes
              if (lic.produit.marque === 'ESET') {
                let postes = '';
                for (const [key, value] of Object.entries(filtresMarque)) {
                  if (value === 'Nombre') {
                    postes = 'val' + key.substr(key.length - 2, 2);
                  }
                }
                const licenceOfFiltres2 = filtresMarqueOf.find(fmo => {
                  if (postes !== '') {
                    if (fmo[postes].match(/\D/g)) {
                      if (fmo[postes].includes('à')) {
                        const reg = new RegExp(/^(\d+) à (\d+).*$/);
                        const res = reg.exec(fmo[postes]);
                        return fmo['produit'].startsWith(lic.produit.reference)
                          && lic.quantite >= +res[1]
                          && lic.quantite <= +res[2];
                      } else {
                        const reg = new RegExp(/(\d+)/g);
                        const res = reg.exec(fmo[postes]);
                        return fmo['produit'].startsWith(lic.produit.reference)
                          && lic.quantite === +res[1];
                      }
                    } else {
                      return fmo['produit'].startsWith(lic.produit.reference) && lic.quantite === fmo[postes];
                    }
                  } else {
                    return false;
                  }
                });
                if (licenceOfFiltres2 != null) {
                  this.router.navigate(['modification'], {
                    relativeTo: this.activatedRoute,
                    state: { licence, licenceOfFiltres: licenceOfFiltres2, filtresMarqueOf: filtresMarqueOf.filter(fmo => fmo['val01'] == licenceOfFiltres2['val01']), filtresMarque }
                  });
                } else {
                  this.licenceNonTrouvee(licence);
                }
              }
              this.licenceNonTrouvee(licence);
            }
          } else {
            if (produits.length > 0) {
              const licenceOfFiltres3 = {
                NIV1: produits[0]['niveaucode1'],
                NIV2: produits[0]['niveaucode2'],
                NIV3: produits[0]['niveaucode3'],
                NIV4: produits[0]['niveaucode4'],
                NIV5: produits[0]['niveaucode5'],
                marque: produits[0].marque,
                produit: produits[0].reference,
                sequence: '1',
                type: '',
                val01: produits[0].crits[0].value,
                val02: produits[0].crits[1].value,
                val03: produits[0].crits[2].value,
                val04: produits[0].crits[3].value,
                val05: produits[0].crits[4].value,
                val06: produits[0].crits[5].value,
                val07: produits[0].crits[6].value,
                val08: produits[0].crits[7].value,
                val09: produits[0].crits[8].value,
                val10: produits[0].garantie,
                val11: 'NEW',
                val12: produits[0].crits[11].value,
                val13: produits[0].crits[12].value,
                val14: produits[0].crits[13].value,
                val15: produits[0].crits[14].value,
                val16: produits[0].crits[15].value,
                val17: produits[0].crits[16].value,
                val18: produits[0].crits[17].value,
                val19: produits[0].crits[18].value,
                val20: produits[0].crits[19].value
              };
              const filtresMarque3 = {
                NIV1: produits[0]['niveaucode1'],
                NIV2: produits[0]['niveaucode2'],
                NIV3: produits[0]['niveaucode3'],
                NIV4: produits[0]['niveaucode4'],
                NIV5: produits[0]['niveaucode5'],
                critere01: produits[0].crits[0].name,
                critere02: produits[0].crits[0].name,
                critere03: produits[0].crits[0].name,
                critere04: produits[0].crits[0].name,
                critere05: produits[0].crits[0].name,
                critere06: produits[0].crits[0].name,
                critere07: produits[0].crits[0].name,
                critere08: produits[0].crits[0].name,
                critere09: produits[0].crits[0].name,
                critere10: 'Durée',
                critere11: 'Type d\'achat',
                critere12: produits[0].crits[0].name,
                critere13: produits[0].crits[0].name,
                critere14: produits[0].crits[0].name,
                critere15: produits[0].crits[0].name,
                critere16: produits[0].crits[0].name,
                critere17: produits[0].crits[0].name,
                critere18: produits[0].crits[0].name,
                critere19: produits[0].crits[0].name,
                critere20: produits[0].crits[0].name,
                image01: '',
                image02: '',
                image03: '',
                image04: '',
                image05: '',
                image06: '',
                image07: '',
                image08: '',
                image09: '',
                image10: '',
                image11: '',
                image12: '',
                image13: '',
                image14: '',
                image15: '',
                image16: '',
                image17: '',
                image18: '',
                image19: '',
                image20: '',
                libelleniv1: produits[0]['niveaulibelle1'],
                libelleniv2: produits[0]['niveaulibelle2'],
                libelleniv3: produits[0]['niveaulibelle3'],
                libelleniv4: produits[0]['niveaulibelle4'],
                libelleniv5: produits[0]['niveaulibelle5'],
                marque: produits[0].marque,
                marquelibelle: produits[0].marquelib,
                photoniv1: '',
                photoniv2: '',
                photoniv3: '',
                photoniv4: '',
                photoniv5: ''
              };
              const filtresMarqueOf3 = new Array<any>();
              produits.forEach(produit => filtresMarqueOf3.push({
                NIV1: produit['niveaucode1'],
                NIV2: produit['niveaucode2'],
                NIV3: produit['niveaucode3'],
                NIV4: produit['niveaucode4'],
                NIV5: produit['niveaucode5'],
                marque: produit.marque,
                produit: produit.reference,
                sequence: '1',
                type: '',
                val01: produit.crits[0].value,
                val02: produit.crits[1].value,
                val03: produit.crits[2].value,
                val04: produit.crits[3].value,
                val05: produit.crits[4].value,
                val06: produit.crits[5].value,
                val07: produit.crits[6].value,
                val08: produit.crits[7].value,
                val09: produit.crits[8].value,
                val10: produits[0].garantie,
                val11: 'NEW',
                val12: produit.crits[11].value,
                val13: produit.crits[12].value,
                val14: produit.crits[13].value,
                val15: produit.crits[14].value,
                val16: produit.crits[15].value,
                val17: produit.crits[16].value,
                val18: produit.crits[17].value,
                val19: produit.crits[18].value,
                val20: produit.crits[19].value
              }));
              this.router.navigate(['modification'], {
                relativeTo: this.activatedRoute,
                state: {
                  licence,
                  licenceOfFiltres: licenceOfFiltres3,
                  filtresMarqueOf: filtresMarqueOf3,
                  filtresMarque: filtresMarque3
                }
              });
            } else {
              this.licenceNonTrouvee(licence);
            }
          }
        });
        this.produitService.getFiltresMarques().pipe(take(1)).subscribe(value => {
          filtresMarques = value;
          ready.next();
        });
        this.produitService.getFiltresMarqueOf(lic.produit.marque, lic.niv1, lic.niv2).pipe(take(1)).subscribe(value => {
          filtresMarqueOf = value;
          ready.next();
        });
      });
  }

  /**
   * Affiche une popup pour aider l'utilisateur quand la licence n'est pas renseignée dans les filtresMarques.
   * @param licence La licence à rechercher
   */
  licenceNonTrouvee(licence: Licence): void {
    const ready = new Subject<void>();
    this.produitsSimilaires = [];
    ready.pipe(skip(1), take(1)).subscribe(() => this.showHelpPopup = true);
    this.produitService.getProduits(
      new CataloguePosition(licence.niv1, licence.niv2, licence.niv3),
      licence.produit.marque == 'ESET' ? licence.produit.reference.substr(0, 3) : '',
      licence.produit.marque, this.authClient.currentClient ? this.authClient.currentClient.id : '').subscribe(produits => {
      if (produits[0].marque != null) {
        this.produitsSimilaires = produits;
      }
      ready.next();
    });
    this.produitService.getProduitById(licence.produit.reference).subscribe(produit => {
      this.produitHelpPopup = produit;
      ready.next();
    });
  }

  /**
   * Cache la popup d'aide.
   */
  hideHelpPopup(): void {
    this.produitHelpPopup = null;
    this.showHelpPopup = false;
    this.licencePopup = null;
    this.isAskingForHelp = false;
    this.demandeAideEnvoyee = false;
    this.commentaire = '';
  }

  /**
   * Recherche les produits similaires à une licence lorsque celle-ci n'est pas disponible.
   */
  queryProduitsSimilaires(): any {
    const res = {
      marque: this.licencePopup.produit.marque,
      niv1: this.licencePopup.niv1,
      niv2: this.licencePopup.niv2,
      niv3: this.licencePopup.niv3
    };
    return res;
  }

  /**
   * Affiche la popup de modification du client.
   */
  afficherPopup(licence: Licence): void {
    this.clientPopup = Client.fromObject(licence.client);
    this.produits = { a: CartItem.fromObject({ produit: { marque: licence.produit.marque, gabarit: 'V' }, qte: 1 }) };
    this.licencePopup = licence;
    this.showPopup = true;
  }

  /**
   * Évènement lorsque le client d'une licence est modifié.
   */
  onChangeClient(client: Client): void {
    this.clientPopup = Client.fromObject(client);
  }

  /**
   * Change les informations du client d'une licence.
   */
  changeClient(client: Client): void {
    this.licencePopup.client = client;
    this.licencePopup.serie = client.serie;
    this.showPopup = false;
    this.licenceService.postEnduser(client, this.licencePopup.commande.numcommande).subscribe(() => this.licenceService.majEnduser().subscribe());
  }

  /**
   * Récupère le nom d'un pays à partir de son code.
   * @param code Le code du pays
   */
  getCountryFromCode(code = 'fr'): Observable<any> {
    return this.adresseService.getCountryFromCode(code);
  }

  /**
   * Envoi une demande d'aide à un commercial.
   */
  demandeAide(): void {
    this.licenceService.demandeAide(this.licencePopup, this.commentaire).pipe(take(1)).subscribe(() => this.demandeAideEnvoyee = true);
  }

  /**
   * Affiche la fiche d'un produit à partir de sa référence.
   * @param ref La référence d'un produit
   */
  onClickReference(ref: string): void {
    this.produitService.getProduitByIdClient(ref).pipe(take(1), takeUntil(this._destroy$)).subscribe(produit => {
      if (produit.marque) {
        this.router.navigate(this.produitService.lienProduit(produit));
      } else {
        //this.showMissingPopup = true;
      }
    });
  }

  /**
   * Pour un nombre de jours donné, renvoie une phrase plus rapidement compréhensible.
   * @param nbJours Le nombre de jours de validité d'une licence en cours
   * @returns Une string sous la forme 'x année et x mois restants', etc.
   */
  printDuree(nbJours: number): string {
    const years = Math.floor(nbJours / 365);
    const months = Math.floor(nbJours % 365 / 30);
    const days = Math.floor(nbJours % 365 % 30);
    if (years > 0) {
      if (months > 0) {
        return years + (years > 1 ? ' ans' : ' an') + ' et ' + months + ' mois ' + (years > 1 ? 'restants' : 'restant');
      } else {
        return years + ' ' + (years > 1 ? 'ans restants' : 'an restant');
      }
    } else {
      if (months > 0) {
        if (days > 0) {
          return months  + ' mois et ' + days + (days > 1 ? ' jours' : ' jour') + ' ' + (months > 1 ? 'restants' : 'restant');
        } else {
          return months + ' ' + (months > 1 ? 'restants' : 'restant');
        }
      } else {
        if (days > 0) {
          return days + ' ' + (days > 1 ? 'jours restants' : 'jour restant');
        } else {
          return '';
        }
      }
    }
  }

  /**
   * Redéfinit les variables du paginator quand celui-ci est modifié.
   * @param e Un objet de type PageEvent
   */
  onPaginatorEvent(e: PageEvent): void {
    this.paginator.pageIndex = e.pageIndex;
    this.paginator.low = e.pageIndex * e.pageSize;
    this.paginator.high = this.paginator.low + e.pageSize;
    this.paginator.pageSize = e.pageSize;
    this.paginator.previousPageIndex = e.previousPageIndex;
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

  protected readonly faPenSquare = faPenSquare;
  protected readonly faCheckCircle = faCheckCircle;
  protected readonly faTimesCircle = faTimesCircle;
  protected readonly faPlusCircle = faPlusCircle;
  protected readonly faMinusCircle = faMinusCircle;
  protected readonly faHistory = faHistory;
  protected readonly faBellSlash = faBellSlash;
  protected readonly faBell = faBell;
}
