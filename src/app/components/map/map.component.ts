import {HttpClient} from '@angular/common/http';
import {AfterViewInit, Component, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {environment} from 'src/environments/environment';
import * as L from 'leaflet';

import {MarkerClusterGroup} from 'leaflet.markercluster';
import {Router} from '@angular/router';
import {caFiltre, mapDate, MapService, region} from './map.service';
import {AuthenticationService} from "../../services/authentication.service";
import {Filtre} from 'src/app/models/catalogue';
import {BehaviorSubject, lastValueFrom, Observable,  Subject} from 'rxjs';
import { FormBuilder,  FormGroup, } from '@angular/forms';
import { SortAndFilterService} from '@/services/sort-and-filter.service';
import {Client} from '@/models';
import {MatTableDataSource} from '@angular/material/table';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {DevisService} from '@/services/devis.service';
import {SelectionModel} from "@angular/cdk/collections";
import {CampagnesService} from "@services/campagnes.service";


const iconRetinaUrl = 'assets/marker-icon-2x.png';

const myIcon = L.icon({
  iconRetinaUrl,
  iconUrl: "assets/markerClient.png",
  iconSize: [30, 35],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
});
const iconProspect = new L.icon({
  iconRetinaUrl,
  iconUrl: "assets/markerProspect.png",
  iconSize: [30, 35],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
});
L.Marker.prototype.options.icon = myIcon;


@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnDestroy, OnInit, AfterViewInit {
  displayedColumns: string[] = ['select', 'username', 'addressName', 'region', 'departement', 'numclient', 'tel', 'ca', 'note', 'typologie'];
  dataSource = new MatTableDataSource<AddressUser>;

  @ViewChild(MatPaginator) paginatore: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  selection = new SelectionModel<AddressUser>(true, []);

  markerCluster = new MarkerClusterGroup({
    spiderfyOnMaxZoom: false,
    showCoverageOnHover: false,
  });
  @Input() public addressArray: AddressUser[] = [];
  clientNonLocaliser: AddressUser[] = [];
  CAfiltre: caFiltre[] = [];
  value = '';
  nmberClientNonLocaliser = 0;
  notes: string[] = ['1', '2', '3', '4', '5'];
  prospetType: string[] = ['CLIENT', 'PROSPECT']
  selectedTri: [string, string] = ['', ''];
  filtresForm: FormGroup;
  /**
   * Observable contenant la liste des filtres disponibles pour la position actuelle dans le catalogue.
   */
  filtres$!: Observable<Filtre[]>;
  /**
   * Valeur subscribed de 'filtres$'
   */
  recherche
  filtres: Filtre[] = null;
  /**
   * Trigger pour l'ouverture ou la cloture du panneau de filtres.
   */
  showFiltres: boolean = false;
  /**
   * Element de 'filtres' séparé quand "filtres[i].label == 'marques'"
   */

  /**
   * Formulaire contenant le tableau des sélecteurs contenant les valeurs de filtres sélectionnées.
   */
  /**
   * Observable du nombre total de produits restant après application des filtres.
   */
  nbrResultats$: Observable<number>;
  /**
   * Tableau de tableaux représentant pour chaque filtre,
   * le nombre de produits disponibles pour chaque option possible en plus des filtres sélectionnés actuels.
   */
  nbrResultatsParFiltre: number[][] = [];
  marques: Filtre = null;
  processedClient$ = new BehaviorSubject<Array<any>>([]);
  nonLocaliserClient$ = new BehaviorSubject<Array<any>>([]);
  typeSelected: Array<string> = [];
  testArray: any[] = [];
  regionSelected: Array<string> = [];
  //private _filterVariables: Map<string, Map<string, PageFilter>>;
  depSelected: Array<string> = [];
  noteSelected: any;
  regle: FormGroup;
  depGroupOptions: Observable<any[]>;
  newarr: AddressUser[];
  filtreArr: Filtre[];
  public map!: any;
  prospectMarker!: any;
  marker!: any;
  lat!: number;
  lng!: number;
  environment = environment;
  address!: any[];
  @Input() regions: region[];
  @Input() numResult: number = 0;
  @Input() nbrClientZone: number = 0;
  data: any;
  @Input() fullArray!: AddressUser[]
  isSpinning;
  @Input() filtringArray!: AddressUser[] // Voire si on met addressUser vus que y'a pas la lat ni la long
  names = [];
  @Input() regionArr: any;
  @Input() dep: any = [];
  aidePopup = "Attention la mise a jours des données peut prendre plusieur minute ..."
  myDate: mapDate = new mapDate();
  protected readonly Number = Number;
  private _destroy$ = new Subject<void>();

  constructor(
    private http: HttpClient,
    public serviceAuth: AuthenticationService,
    private router: Router,
    private fb: FormBuilder,
    public saf: SortAndFilterService,
    public mapService: MapService,
    private devisService: DevisService,
    protected campagnesService: CampagnesService
  ) {
  }

  /*
  * On Prépare l'affichage de la map avec initMap
  */

  /**
   * @returns Le FormArray correspondant à l'état actuel des sélecteurs de filtres.
   */
  get filtresSelectors() {
    return this.filtresForm.get('filtresSelectors');
  }

  /**
   * Déclenche le tri des éléments quand un des éléments du bandeau est cliqué.
   * @param s L'élément du bandeau qui a été cliqué
   */

  get paginator(): {
    pageIndex: number;
    pageSize: number;
    pageSizeOptions: number[];
    previousPageIndex: number;
    low: number;
    high: number;
  } {
    return this.devisService.paginator;
  }

  onTri(s: string): void {
    if (s === this.selectedTri[0]) {
      switch (this.selectedTri[1]) {
        case 'off':
          this.selectedTri[1] = 'asc';
          break;
        case 'asc':
          this.selectedTri[1] = 'desc';
          break;
        case 'desc':
          this.selectedTri[1] = 'asc';
          break;
        default:
          this.selectedTri[1] = 'off';
          break;
      }
    } else {
      this.selectedTri[0] = s;
      this.selectedTri[1] = 'asc';
    }
    this.trierLivraisons(this.processedClient$);
  }

  /**
   * Trie les commandes selon l'état du bandeau.
   */
  trierLivraisons(livraisons): BehaviorSubject<Client[]> {
    switch (this.selectedTri[0]) {
      case 'Groupe':
        livraisons = this.tri(livraisons, 'groupe');
        break;
      case 'N° client':
        livraisons = this.tri(livraisons, 'numClient');
        break;
      case 'Société':
        livraisons = this.tri(livraisons, 'nom');
        break;
      case 'Code Postal':
        livraisons = this.tri(livraisons, 'codepostal');
        break;
      case 'Ville':
        livraisons = this.tri(livraisons, 'ville');
        break;
    }
    this.processedClient$ = livraisons;
    return livraisons;
  }

  /**
   * Tri les livraison selon un attribut
   * @param livraisons La liste des livraisons à trier
   * @param target L'attribut sur lequel on veut trier
   */
  tri(livraisons: BehaviorSubject<Client[]>, target: string): BehaviorSubject<Client[]> {
    livraisons.subscribe((data => {
      if (data.length <= 1) {
        return livraisons;
      } else if (typeof data[0][target] === 'string') {
        switch (this.selectedTri[1]) {
          case 'asc':
            return data.sort((l1, l2) => l1[target].localeCompare(l2[target]));
          case 'desc':
            return data.sort((l1, l2) => -l1[target].localeCompare(l2[target]));
          case 'off':
            return data;
        }
      } else {
        switch (this.selectedTri[1]) {
          case 'asc':
            return data.sort((l1, l2) => l1[target].valueOf() === l2[target].valueOf() ? 0 : l1[target] > l2[target] ? 1 : -1);
          case 'desc':
            return data.sort((l1, l2) => l1[target].valueOf() === l2[target].valueOf() ? 0 : l1[target] < l2[target] ? 1 : -1);
          case 'off':
            return data;
        }
      }
      this.processedClient$.next(data);
      return this.processedClient$;
    }));
    return this.processedClient$;
  }

  ngAfterViewInit(): void {


    /*Previens les erreur de redirection à la fermeture de la popup avec preventdefault()*/

    let qs2 = document.querySelector('.leaflet-pane.leaflet-popup-pane');
    qs2!.addEventListener('click', event => {
      event.preventDefault();
    });


  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }

  }


  //ON RECUPERE LES REGION AVEC LE PHP
  testRegion() {
    this.http.get(`${environment.apiUrl}/ListeSecteursCommercials.php`).subscribe(
      data => {
        this.regionArr = data;

        this.regionArr.sort();
               
        return data;
      }
    )
  }

  getDep() {
    this.http.get(`${environment.backend}/api/departement.php`)
      .subscribe(
        data => {
          this.dep = data;


          return data

        }
      )
  }

  getDate() {
    this.http.get<mapDate>(`${environment.backend}/api/mapDate.php`).subscribe(date => {
      this.myDate = date;
    })
  }

  getJson() {
    this.http.get<any[]>(`${environment.backend}/CarteTemp/CompleteAddresses.json`, {
      responseType: 'json',

    }).subscribe(
      data => {


       
        this.addressArray = data
        this.initMarker(this.addressArray)

        this.recherche = this.saf.getFiltre('TEST', 'phrase', 'includes');
        this.typeSelected = this.saf.getFiltre('TEST', 'typologie', 'includes') as Array<string> || [];
        this.depSelected = this.saf.getFiltre('TEST', 'departement', 'includes') as Array<string> || [];
        this.regionSelected = this.saf.getFiltre('TEST', 'region', 'includes') as Array<string> || [];
        this.noteSelected = this.saf.getFiltre('TEST', 'note', 'includes') as Array<string> || [];
        this.nonLocaliserClient$.subscribe((d) => {
          this.dataSource.data = d
        })
        this.dataSource.paginator = this.paginatore;
        this.dataSource.sort = this.sort;
      }
    )
  }


  onSearch(target: string, type: string, method: string, event: string, values?: string): void {
    if (values) {

      this.processedClient$.next(this.saf.onFiltre('TEST', target, type, method, this[values], this.addressArray))
      this.initMarker(this.processedClient$.value)
      //setTimeout(() => this.processedClient$.next(this.saf.onFiltre('TEST', target, type, method, this[values], this.addressArray)), 1);
    } else {

      this.processedClient$.next(this.saf.onFiltre('TEST', target, type, method, this[values], this.addressArray))
      this.initMarker(this.processedClient$.value)
      setTimeout(() => this.processedClient$.next(this.saf.onFiltre('TEST', target, type, method, event['target'].value != null ? event['target'].value : event['target'].innerText, this.addressArray)), 1);
    }
  }


  ngOnInit(): void {
    this.isSpinning = true;
    this.filtresForm = this.fb.group({
      departement: '',
      region: '',
      note: '',
      typologie: '',
      recherche: ''
    });
    this.getDate();
    this.getDep();


    //On chope la data des user
    this.getJson();

    //On chope les filtres des régions
    this.testRegion();

    this.initMap(); // On initialise la Map


    this.CAfiltre = this.mapService.caFiltre;
    //On place les marqueur sur la map
    this.initMarker(this.addressArray)
    this.isSpinning = false;


    //Input recherche
    this.filtresForm.get("recherche").valueChanges.subscribe(selectedValue => {
      var toUpperCase = selectedValue.toUpperCase();

      var filtring = this.saf.onFiltre('INPUT', 'phrase', 'string', "includes", toUpperCase, this.addressArray);

      this.initMarker(filtring)
      this.saf.resetFiltre('INPUT', 'phrase')

    })


  }

  filtring(filtre: string) {
    this.filtresForm.get(filtre).valueChanges.subscribe(selectedValue => {
      var toUpperCase = selectedValue.toUpperCase();

      var filtring = this.saf.onFiltre('TEST', filtre, 'string', "includes", toUpperCase, this.addressArray);

      this.initMarker(filtring)
      this.saf.resetFiltre('TEST', 'phrase')

    })

  }

  resetOneFilters(filter: string) {
    // RESET ONE FILTERS

    this.filtresForm.get(filter).setValue('');

    this.saf.resetFiltre('TEST', filter + 'includes');


    this.processedClient$.next(this.saf.filtrer('TEST', this.addressArray))
    this.initMarker(this.processedClient$.value)

  }

  resetFilters() {
    // RESET FILTERS

    this.filtresForm.setValue({
      departement: '',
      region: '',
      note: '',
      typologie: '',
      recherche: ''
    });

    this.saf.resetFiltre('TEST', 'departement');
    this.saf.resetFiltre('TEST', 'region');
    this.saf.resetFiltre('TEST', 'note');
    this.saf.resetFiltre('TEST', 'recherche');
    this.saf.resetFiltre('TEST', 'typologie');

    this.processedClient$.next(this.saf.filtrer('TEST', this.addressArray))

  }


  pushFiltre(filtre: string, formame: any) {
    //formame.replace(/^0+/, '');
    formame.toString();
    if (typeof formame === "number") {

      formame.toString();
    }

    let toto = formame.toLowerCase()


    var filtred = this.saf.onFiltre('TEST', toto, 'string', "includes", filtre, this.addressArray);

    /**
     * Remet à 0 un filtre d'une page.
     * @param name L'identifiant de la page
     * @param filtre Le nom du filtre
     */
    // this.saf.resetFiltre('TEST', 'map')
    this.initMarker(filtred)
    /* if (filtre != 'ALL') {  // Renvoie tous les marqueur de la regions


    } else { // Renvoie tous les marqueurs
      this.mapComponent.initFullArray()
    } */
    this.map.setZoom(6)

  }


  ngOnDestroy(): void {
    // On remove la map pour éviter des erreurs
    this.map.off();
    this.map.remove();
    this._destroy$.next();
    this._destroy$.complete();
  }

  //Fonction pour mettre a jour les client (le btn )
  async refresh() {
    this.isSpinning = true;
    this.markerCluster.clearLayers();
    this.numResult = 0;

    try {


      const data: any = await lastValueFrom(this.http.get(`${environment.apiUrl}/geoRefreshB.php`, // On get les client geoRefreshB
        {
          responseType: 'json',
          withCredentials: true
        })
      )


      this.addressArray = []
      this.addressArray = [...data]


      this.initMarker(this.addressArray); // ON place les marqueur sur la map
      this.getDate();

    } catch (e) {
      console.log(e);
    } finally {
      this.isSpinning = false;

    }

  }


  

  initMarker(addressUser: AddressUser[]) {
    this.markerCluster.clearLayers();
    this.numResult = 0;
    this.nmberClientNonLocaliser = 0;
    this.clientNonLocaliser = [];


    for (let element of addressUser) {

      //Si le client est un client PROSPECT
      if (element.typologie == "PROSPECT" && element.lat && element.long && element.addressName != "undefined") {

        this.numResult++
        this.marker = L.marker(new L.LatLng(element.lat, element.long), {icon: iconProspect});
        this.markerCluster.addLayer(this.marker);


        this.marker.bindPopup(`<strong class="mega-bold"> ${element.username}</strong> <br>
        ${element.addressName + ',  <br>' + element.postcode + ' ' + element.city} <br>
        ${'<span class="weight-bolder">Siren</span> : ' + element.siren + '<span class="weight-bolder"> Tel </span> : '} <a class="tel" href="tel:${element.tel}" >${element.tel}</a><br>
        ${'<div style="color:#176d87"> <span class="weight-bolder">numéro prospect</span> : ' + element.numclient}</div> <br>
        <div class="divBtnPopup">
        <a class=" googleMaps raised-button margin-3 btn-white" href="https://www.google.com/maps?q=${element.lat},${element.long}" target="_blank">Ouvrir avec maps</a>
        <a class="btnpop raised-button margin-3 btn-white" href="espace-commercial/prospects/detail/${element.numclient}" target="_blank">Plus d'info</a><br>
        </div>`)


          .on("popupopen", (a) => {
            // this.mouseOnCluster(a); /#/client-detail?client=${element.numclient}&type=client target="_blank"
            var popUp = a.target.getPopup()

            var qs1 = document.querySelectorAll('.tel')

            for (let i = 0; i < qs1.length; i++) {
              qs1[i].addEventListener("click", event => {
                event.stopPropagation()
              })
            }

            var qs2 = document.querySelector('.btnpop')

            qs2.addEventListener("click", event => {


              event.stopPropagation()
            })
            var qs3 = document.querySelector('.googleMaps')
            qs3.addEventListener("click", event => {

              event.stopPropagation()
            })

          });


      }
      ///si c'est un client normal
      else if (element.lat && element.long && element.addressName != "undefined") {

        this.numResult++

        this.marker = L.marker(new L.LatLng(element.lat, element.long), {icon: myIcon});
        this.markerCluster.addLayer(this.marker);


        this.marker.bindPopup(`<strong class="mega-bold"> ${element.username}</strong> <br>
        ${element.addressName + ',  <br>' + element.postcode + ' ' + element.city} <br>
        ${'<span class="weight-bolder">Siren</span> : ' + element.siren + '<span class="weight-bolder"> Tel </span> : '} <a class="tel" href="tel:${element.tel}"  >${element.tel}</a><br>
        ${'<div style="color: #e74c3c"><span class="weight-bolder">numéro Client</span> : ' + element.numclient} </div><br>
        <div class="divBtnPopup">
        <a class="googleMaps raised-button margin-3 btn-white" href="https://www.google.com/maps?q=${element.lat},${element.long}" target="_blank">Ouvrir avec maps</a><br>
        <a class="btnpop raised-button margin-3 btn-white" href="/client-detail/${element.numclient}" target="_blank">Plus d'info</a></div>`)

          .on("popupopen", (a) => {
            // this.mouseOnCluster(a);
            var popUp = a.target.getPopup()

            var qs1 = document.querySelectorAll('.tel')

            for (let i = 0; i < qs1.length; i++) {
              qs1[i].addEventListener("click", event => {
                event.stopPropagation()
              })
            }

            var qs2 = document.querySelector('.btnpop')
            qs2.addEventListener("click", event => {

              event.stopPropagation()
            })
            var qs3 = document.querySelector('.googleMaps')
            qs3.addEventListener("click", event => {

              event.stopPropagation()
            })

          })
      } else {
        this.nmberClientNonLocaliser++
        this.clientNonLocaliser.push(element);
      }


    }


    /*Previens les erreur avec les liens dans la*/
    this.map.addLayer(this.markerCluster);


    //

    this.markerCluster.on(
      'clustermouseover', this.mouseOnCluster
    );

    //
    this.map.closePopup();
    this.isSpinning = false;

    this.nonLocaliserClient$.next(this.clientNonLocaliser);
    /*  this.nonLocaliserClient$
        .pipe(skip(1), takeUntil(this._destroy$))
        .subscribe(() => {
          this.paginator.low = 0;
          this.paginator.high = this.paginator.pageSize;
          this.paginator.pageIndex = 0;
        }); */

  }


  selected(s: string): string {
    return this.selectedTri[0] === s ? this.selectedTri[1] : 'off';
  }

  mouseOnCluster(event: any) {
    var children = event.layer.getAllChildMarkers();
    var resultNumber = event.layer.getAllChildMarkers().length

    var resultNumberHtml = document.querySelector('.numberResult');
    resultNumberHtml.innerHTML = resultNumber;

    var names = [];
    var i;
    for (i = 0; i < children.length; i++) {
      names.push(children[i]._popup._content);
    }

    

    var resultHtml = document.querySelector('.resultHtml');
    resultHtml.innerHTML = names.join('\n');

  }


 

  downloadCSV() {
    let csvData = this.convertToCSV(this.processedClient$.value);
    let blob = new Blob([csvData], {type: 'text/csv'});
    let url = window.URL.createObjectURL(blob);

    let link = document.createElement('a');
    link.setAttribute('hidden', '');
    link.setAttribute('href', url);
    link.setAttribute('download', 'liste_client_map.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  addCampgne() {
    this.campagnesService.openCampaignDialog(new SelectionModel<any>(true, this.processedClient$.value));
  }

  convertToCSV(objArray: AddressUser[]): string {
    let array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;
    let str = '';

    // Write the header row
    let header = Object.keys(array[0]).join(',');
    str += header + '\r\n';

    // Write the data rows
    for (let i = 0; i < array.length; i++) {
      let line = '';
      for (let index in array[i]) {
        if (line != '') line += ','
        line += array[i][index];
      }
      str += line + '\r\n';
    }
    return str;
  }


  initFullArray() {


    this.markerCluster.clearLayers();
    this.numResult = 0;
    var fullArray = [];
    fullArray = this.addressArray


    for (let element of fullArray) {

      if (element.lat && element.long && element.addressName && element.numclient != "undefined") { // Penser a enlever des filtre pour la prod


        var preTel = element.tel.split(" ").join("")

        if (preTel[0] === '0') { // On remplace le 0 par +33 pour avoir un numéro de tel valide

          var tel = preTel.replace(/^./, "+33")


        }

        this.numResult++ // On affiche le nombre de Résultat de la requete
        this.marker = L.marker(new L.LatLng(element.lat, element.long));
        this.markerCluster.addLayer(this.marker);
        this.marker.bindPopup(`<strong class="mega-bold"> ${element.username}</strong> <br>
        ${element.addressName + ',  <br>' + element.postcode + ' ' + element.city} <br>
        ${'<span class="weight-bolder">Siren</span> : ' + element.siren + '<span class="weight-bolder"> Tel </span> : '} <a class="tel" href="tel:${element.tel}" >${element.tel}</a><br>
        ${'<span class="weight-bolder">numéro Client</span> : ' + element.numclient} <br>
        <a class="btnpop raised-button margin-3 btn-white" href="/client-detail/${element.numclient}" target="_blank">Plus d'info</a>`)

          .on("popupopen", (a) => {

            // var popUp = a.target.getPopup()
            var qs1 = document.querySelectorAll('.tel')

            for (let i = 0; i < qs1.length; i++) {
              qs1[i].addEventListener("click", event => {
                event.stopPropagation()
              })
            }


            var qs2 = document.querySelector('.btnpop')


            qs2.addEventListener("click", event => {
              event.stopPropagation()
            })
            /* popUp.getElement()
            .querySelector('.btnPopup')
            .addEventListener("click", e =>{
            this.plusDinfo(`${element.nclient}`);
            }) */
          }).openPopup();
      }

    }

    /*Previens les erreur avec les liens dans la*/
    this.map.addLayer(this.markerCluster);


    /*Previens les erreur de redirection à la fermeture de la popup avec preventdefault()*/
    let qs2 = document.querySelector('.leaflet-pane.leaflet-popup-pane');
    qs2!.addEventListener('click', event => {
      event.preventDefault();
    });

  }


  openInNewWindow(client) {
    if (client.typologie === 'CLIENT') {
      const url = this.router.serializeUrl(
        this.router.createUrlTree(['/client-detail/' + client.numclient]))
      window.open(decodeURIComponent(url), '_blank');

    } else {
      const url = this.router.serializeUrl(
        this.router.createUrlTree(['/espace-commercial/prospects/detail/' + client.numclient]))
      window.open(decodeURIComponent(url), '_blank');

    }
  }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  toggleAllRows() {
    if (this.isAllSelected()) {
      this.selection.clear();
      return;
    }

    this.selection.select(...this.dataSource.data);
  }

  /** The label for the checkbox on the passed row */
  checkboxLabel(row?: AddressUser): string {
    if (!row) {
      return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'}`;
  }

  private initMap(): void {


    // this.markerCluster({ disableClusteringAtZoom: 17 });
    this.map = L.map('map', {

      center: [46.4662882, 2.6548421], //changer par  this.lat, this.lng(phase de test remplacer la strasbourg 48.5734053, 7.7521113)
      zoom: 5.4,
      zoomControl: true
    });
    this.map.zoomControl.setPosition('topright');
    const tiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { //On ajoute le titre a la map (obligatoire)
      maxZoom: 18,
      minZoom: 3,
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    });
    //const zoom = L.addControl(L.control.zoom({ position: 'bottomright' }));
    //zoom.addTo(this.map);
    tiles.addTo(this.map);

    L.Popup.closeOnEscapeKey = false

    var scale = L.control.scale(); // Creating scale control
    scale.addTo(this.map); // Adding scale control to the map
  }
}


export class AddressUser {
  username: String;
  addressName: String;
  city: String;
  postcode: String;
  numclient: String;
  phrase: String;
  tel: String;
  siren: string;
  lat: String;
  long: String;
  region: String;
  departement: String; //égale a département
  adejacommande: String;
  typologie: String;
  ca: string;
  ca1: string;

  //Dans le constructor l'ordre des données doir etre le meme que dans save.csv
  constructor(username: String, addressName: String, city: String, postcode: string, numclient: String, phrase: String, tel: string, siren: string, region: String,
              departement: String,
              adejacommande: String, typologie: string, ca: string, ca1: string, lat: string, long: string) {


    this.addressName = addressName;
    this.adejacommande = adejacommande;
    this.typologie = typologie;
    this.ca = ca;
    this.ca1 = ca1;
    this.city = city;
    this.postcode = postcode;
    this.lat = lat;
    this.long = long;
    this.phrase = phrase
    this.numclient = numclient;
    this.region = region;
    this.departement = departement;
    this.siren = siren;
    this.tel = tel;
    this.username = username;
  }
}


