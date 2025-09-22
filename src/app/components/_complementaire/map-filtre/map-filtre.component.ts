import { Component, OnInit, Input } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { PageFilter, SortAndFilterService } from 'src/app/services/sort-and-filter.service';
import {  MapService, region } from "../../map/map.service";
import { AddressUser, MapComponent } from "../../map/map.component";
import { FormBuilder, FormArray } from '@angular/forms';
import {  BehaviorSubject, Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Filtre } from 'src/app/models/catalogue';
import {
  map,
  tap,
  takeUntil,
  publishReplay,
  refCount,
  switchMap,
  startWith,
  take,
  skip,
  debounceTime,
  filter
} from 'rxjs/operators';

export const _filter = (opt: string[], value: string): string[] => {
  const filterValue = value.toLowerCase();
  return opt.filter(item => item.toLowerCase().includes(filterValue));
};


@Component({
  selector: 'app-map-filtre',
  templateUrl: './map-filtre.component.html',
  styleUrls: ['./map-filtre.component.scss']
})


/**
 * @title Option groups autocomplete
*/
export class MapFiltreComponent implements OnInit {

notes :string[] = ['1','2','3','4','5']
/**
     * Observable contenant la liste des filtres disponibles pour la position actuelle dans le catalogue.
     */
filtres$!: Observable<Filtre[]>;
/**
 * Valeur subscribed de 'filtres$'
 */
filtres: Filtre[] = null;
/**
 * Element de 'filtres' séparé quand "filtres[i].label == 'marques'"
 */
 /**
  * Formulaire contenant le tableau des sélecteurs contenant les valeurs de filtres sélectionnées.
  */

 filtresForm = this.fb.group({
  filtresSelectors: this.fb.array([])
});

/**
     * Trigger pour l'ouverture ou la cloture du panneau de filtres.
     */
showFiltres: boolean = false;

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
  private _filterVariables: Map<string, Map<string, PageFilter>>;
  testForm: FormGroup;
  testArray: any[] =[];
  selectedRegion:  Array<string> = [];
  selectedDep: any;
  selectedNote: any;

  regionsForm: FormGroup;
  reactiveForm: FormGroup;
  regle:FormGroup;
  depGroupOptions: Observable<any[]>;
  newarr: AddressUser[];
  filtreArr: Filtre[];
  depForm: FormGroup;
  @Input() dep: any[];
  @Input() regionArr: any[];
  @Input() fullArray: AddressUser[]
  @Input() addressArray: AddressUser[]
  @Input() filtringArray: AddressUser[]
  //filtresSelectors!:any;

  /**
     * @param comparatorService Service utilisé pour la gestion du comparateur. Utilisé ici pour afficher,
     *  si non nul, le bouton permettant d'accéder au comparateur et le nombre de produits actuellement à comparer.
     * @param route Les données actuelles associées à la route.
     * @param fb Outil simplifiant l'association de contrôles aux formulaires.
     * @param breakpointObserver Observe la largeur de l'écran et déclenche un évènement si la largeur passe le cap donné.
     */

  constructor(private mapComponent: MapComponent,
    private markerService: MapService,
    protected saf: SortAndFilterService,
    private fb: FormBuilder,
    private http: HttpClient
  ) { this._filterVariables = new Map<string, Map<string, PageFilter>>() }

/**
* Renvoie les valeurs d'une variable de filtre d'une page.
* @param name L'identifiant de la page
* @param filtre Le nom du filtre
*/

  value = '';
  public getFiltre(name: string, filtre: string, method: string): unknown {
    return this._filterVariables.get(name)?.get(filtre + method)?.value;
  }
   testFiltre():Observable<Filtre[]> {
    let test = []

     return this.http.get<Filtre[]>(`${environment.apiUrl}/Filtresmap.php`)
     /* .subscribe(
      data  => {
        data.forEach(element => {
          this.filtresForm.value.filtresSelectors.push(this.fb.control([]))

          test.push(element)
        });


     //  this.filtres = test

     // return  this.filtres
       //return this.filtres
  }) */
}
  formatLabel(value: number): string {
    if (value >= 1000) {
      return Math.round(value / 1000) + 'k';
    }

    return `${value}`;
  }



  resetOneFilters(filter: string, form:FormGroup) {
    // RESET ONE FILTERS


    form.get(filter).setValue('');
    this.saf.resetFiltre('TEST', filter + 'includes');

    this.processedClient$.next(this.saf.filtrer('TEST', this.addressArray))
    this.mapComponent.initMarker(this.processedClient$.value)

  }





  pushFiltre(filtre:string,formame:any){
    //formame.replace(/^0+/, '');
    formame.toString();
    if (typeof formame ==="number") {

      formame.toString();
    }

    let toto = formame.toLowerCase()
   // this.testArray.push(filtre)

    var filtred = this.saf.onFiltre('TEST', toto, 'string', "includes", filtre, this.addressArray);

      /**
       * Remet à 0 un filtre d'une page.
       * @param name L'identifiant de la page
       * @param filtre Le nom du filtre
       */
     // this.saf.resetFiltre('TEST', 'map')
      this.mapComponent.initMarker(filtred)
      /* if (filtre != 'ALL') {  // Renvoie tous les marqueur de la regions


      } else { // Renvoie tous les marqueurs
        this.mapComponent.initFullArray()
      } */
      this.mapComponent.map.setZoom(6)

  }

  addFiltre(data:Filtre[]){
    let control = <FormArray>this.testForm.controls['filtresSelectors'];
    data.forEach(x=>{
      control.push(this.fb.group({

      }))
    })
  }

  onSearch(target: string, type: string, method: string, event: string, values?: string): void{
    if (values) {
      setTimeout(() => this.processedClient$.next(this.saf.onFiltre('TEST', target, type, method, this[values], this.addressArray)), 1);
    } else {
      setTimeout(() => this.processedClient$.next(this.saf.onFiltre('TEST', target, type, method, event['target'].value != null ? event['target'].value : event['target'].innerText, this.addressArray)), 1);
    }
  }


  ngOnInit(): void {

//Filtres

   this.filtres$ = this.testFiltre();


   this.filtres$.subscribe(

      filtres => {
    //  this.filtresSelectors.clear();

      for(const filtre of filtres){
        this.filtresSelectors.push(this.fb.control([]))
      }


    })


    //Form




    //

    this.regle = new FormGroup({
      note: new FormControl()
    });

    this.regle.get('note').valueChanges.subscribe(value=>{
      let result = value.toString()
      let test=[]
      test.push(result)
      const filtring = this.saf.onFiltre('TEST', 'note', 'array', "includes", test, this.addressArray);

      this.mapComponent.initMarker(filtring)
      this.saf.resetFiltre('TEST', 'note')

    })


    this.reactiveForm = new FormGroup({
      recherche: new FormControl()
    })

    this.filtringArray = this.mapComponent.filtringArray


    this.addressArray = this.mapComponent.addressArray;

    //Input recherche
    this.reactiveForm.get("recherche").valueChanges.subscribe(selectedValue => {
      var toUpperCase = selectedValue.toUpperCase();

      var filtring = this.saf.onFiltre('INPUT', 'phrase', 'string', "includes", toUpperCase, this.addressArray);

      this.mapComponent.initMarker(filtring)
      this.saf.resetFiltre('INPUT', 'phrase')

    })


    this.regionsForm = this.fb.group({
      region: ''
    })
    /*  this.regionsForm.valueChanges.subscribe(x => {

      x = this.selectedRegion;



      var filtred = this.saf.onFiltre('TEST', 'region', 'string', "includes", x.SecteurCode, this.addressArray);


      this.saf.resetFiltre('TEST', 'map')

      if (x.SecteurCode != 'ALL') {  // Renvoie tous les marqueur de la regions
        this.mapComponent.initMarker(filtred)

      } else { // Renvoie tous les marqueurs
        this.mapComponent.initFullArray()
      }
      this.mapComponent.map.setZoom(6)
    }
    );*/

    //DEPARTEMENT FORM
    this.depForm = new FormGroup({
      departement: new FormControl(this.selectedDep)
    })
    this.depForm.valueChanges.subscribe(y => {

      y = this.selectedDep

      var filtred = this.saf.onFiltre('TEST', 'departement', 'string', "includes", y.argument, this.addressArray);

      /**
     * Remet à 0 un filtre d'une page.
     * @param name L'identifiant de la page
     * @param filtre Le nom du filtre
     */
      this.saf.resetFiltre('TEST', 'map')

      if (y.argument != ' ') {  // Renvoie tous les marqueur du departement
        this.mapComponent.initMarker(filtred)
      } else { // Renvoie tous les marqueurs
        this.mapComponent.initFullArray()
      }

      this.mapComponent.map.setZoom(6)
    })

    this.selectedRegion = this.saf.getFiltre('TEST', 'region', 'includes') as Array<string> || [];

    this.processedClient$.next(this.saf.filtrer('TEST', this.addressArray))
    //this.mapComponent.initMarker(this.processedClient$.value)


  }


  compareFn(dep: any, region: any) {
    return dep.valeur3 === region.secteurcode
  }
  test(dep: any, reg: any) {
    let testArr = []
    this.dep.forEach(element => {
      if (dep.valeur3 == reg.secteurcode) {
        testArr.push(element)
      }
    })
    this.dep = testArr;

  }


   /**
     * Reset all the filters
     * or the filter at the position given by 'filterNbr'
     */
  /*  resetFilters(filterNbr = -1) {
    // RESET FILTERS
    if (filterNbr != -1) {
        this.filtresSelectors.controls[filterNbr].setValue([]);
    } else {
        for (let i = this.filtresSelectors.value.length - 1; i >= 0; i--) {
            this.filtresSelectors.controls[i].setValue([]);
        }
    }

    this.update();
} */
  /**
     * Force the update of the catalogue product list
     */
 /*  update() {
    setTimeout(
        () => { this.filtresSelectors.updateValueAndValidity({ onlySelf: false, emitEvent: true }); },
        300
    );
} */
/**
     * @returns Le FormArray correspondant à l'état actuel des sélecteurs de filtres.
     */
get filtresSelectors() {
  return this.filtresForm.get('filtresSelectors') as FormArray;
}



  @Input() numResult = 0;
  @Input() regions: region[]
  @Input() nbrClientZone = 0

}
