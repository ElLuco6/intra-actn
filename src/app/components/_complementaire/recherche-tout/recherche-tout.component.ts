import {
  Component,
  EventEmitter,
  HostListener,
  Inject,
  Input, OnDestroy,
  OnInit,
  Output,
  PLATFORM_ID,
  ViewChild
} from '@angular/core';
import {FormControl} from "@angular/forms";
import { MatAutocompleteTrigger } from '@angular/material/autocomplete';
import {Router} from "@angular/router";
import {fromEvent, Observable, Subject, takeUntil} from "rxjs";
import {
  CatalogueSearchPredictionService,
  PredictionResults
} from "@services/catalogue-search-prediction.service";
import {CataloguePosition} from "@/models";
import {WindowService} from "@services/window.service";
import {isPlatformBrowser} from "@angular/common";
import {LocalStorageService} from "@services/local-storage.service";
import {BreakpointObserver} from "@angular/cdk/layout";
import {state} from "@angular/animations";

@Component({
  selector: 'app-recherche-tout',
  templateUrl: './recherche-tout.component.html',
  styleUrls: ['./recherche-tout.component.scss']
})
export class RechercheToutComponent implements OnInit, OnDestroy {
  /**
   * Évenement déclenché lors d'une nouvelle recherche.
   */
  @Output() search = new EventEmitter<string>();
  @ViewChild(MatAutocompleteTrigger) autocomplete: MatAutocompleteTrigger;

  @Input() historiqueMaxShow = 5;

  searchInput = new FormControl('');
  autoCompleteOptions$: Observable<PredictionResults>;

  openSearch = false;
  activeSearchBar = false;
  searching: string;
  position = new CataloguePosition();

  get historique(): Array<string> {
    return Array
      .from(this._historique)
      .sort((a, b) => b[1] - a[1])
      .map(e => e[0])
      .filter(e => e.startsWith(this.searchInput.value))
      .slice(0, this.historiqueMaxShow);
  }

  private _historique: Map<string, number>;
  private _destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private predictionService: CatalogueSearchPredictionService,
    private localStorage: LocalStorageService,
    private window: WindowService,
    @Inject(PLATFORM_ID) private platformId: any
  ) {
    this.chargementHistorique();
  }

  ngOnInit(): void {
    this.searchInput.valueChanges.subscribe(searchString => {
      this.searching = searchString;
      this.predictionService.searchString = searchString;
    });

    this.predictionService.searchString$
      .pipe(takeUntil(this._destroy$))
      .subscribe(value => {
        if (this.searching !== value) {
          this.searchInput.setValue(value);
        }
        this.autoCompleteOptions$ = this.predictionService.getPredictions(value);
        this.searching = value;
      });

    if (isPlatformBrowser(this.platformId)) {
      fromEvent<StorageEvent>(this.window.window, 'storage')
        .pipe(takeUntil(this._destroy$))
        .subscribe(() => this.chargementHistorique());
    }
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  chargementHistorique(): void {
    const h = this.localStorage.getItem('searchHistory');
    this._historique = h ? new Map<string, number>(JSON.parse(h)) : new Map<string, number>();
  }

  hideAutoComplete(): void {
    this.autocomplete.closePanel();
  }

  removeAccents(str: string): string {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  newSearch(): void {
    if (this.searchInput.value.length >= 2) {
      const h = this._historique.get(this.searchInput.value);
      this._historique.set(this.searchInput.value, h ? h + 1 : 1);
      this.localStorage.setItem('searchHistory', JSON.stringify([...this._historique]));
      this.search.emit(this.searchInput.value);
      this.router.navigate(['/catalogue/search'], { queryParams: { search: this.searchInput.value } });
      this.predictionService.emitNewCatalogueSearch(this.searchInput.value);
    }
  }

  removeSpecialChar(input: string): string {
    return input.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^0-9a-z\-+() /]/gi, '');
  }

  // fonction permettant de renvoyer le début du mot avant l'apparition de la recherche
  start(mot: string): string {
    // verification de la recherche présente dans le mot
    if (mot.includes(this.searching.toUpperCase())) {
      // découpage du mot pour ne renvoyer que le début (avant l'occurence de la recherche)
      return mot.slice(0, mot.indexOf(this.searching.toUpperCase(), 0));
    }
    else {
      // si la recherche n'est pas dans le mot (cas possible que lors d'une recherche reference/deignation),
      // la fonction start renvoie le mot et la fonction end renvoie la chaine vide afin de ne pas avoir de modification du mot
      return mot;
    }
  }

  // meme fonction qui permet de renvoyer la fin du mot
  end(mot: string): string {
    if (mot.includes(this.searching.toUpperCase())) {
      return mot.slice(mot.indexOf(this.searching.toUpperCase(), 0) + this.searching.length);
    }
    else {
      // si la recherche n'est pas dans le mot (cas possible que lors d'une recherche reference/deignation),
      // la fonction start renvoie le mot et la fonction end renvoie la chaine vide afin de ne pas avoir de modification du mot
      return '';
    }
  }

  valideMarque(marque: string): string {
    return marque;
  }

  @HostListener('document:keydown.enter', ['$event']) onKeydownHandler(event: KeyboardEvent): void {
    this.autocomplete.closePanel();
  }

}
