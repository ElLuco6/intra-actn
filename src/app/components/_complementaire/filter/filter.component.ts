import {Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';
import {FormControl} from "@angular/forms";

/**
 * FilterComponent est un composant Angular réutilisable qui fournit une fonctionnalité de filtrage.
 * Il prend en entrée un nom de filtre, une instance de FormControl et un tableau d'options de filtre.
 * Il fournit également une méthode pour réinitialiser le filtre.
 *
 * @example Dans le HTML du composant parent:
 *          <app-filter [filterName]="filtre.name" [filterControl]="filtreControls[filtre.control]" [filterOptions]="filtre.options" [filterType]="filtre.type"></app-filter>
 * @example Dans le TS du composant parent:
 *          // Declaration des variables
 *          filtreControls: FilterControl = {};
 *          filtres: Filter[] = [];
 *          //Déclaration des filtres name : le nom du filtre, type : le type du filtre, displayName : le nom affiché (displayName est optionnel)
 *          const filtersNamesAndTypes = [
 *            { name: 'raisonSociale', type: 'input', displayName: 'Raison Sociale' },
 *            { name: 'numero', type: 'input', displayName: 'N°Client' },
 *            { name: 'region', type: 'select' },
 *            { name: 'ville', type: 'select' },
 *            { name: 'codepostal', type: 'input', displayName: 'Code Postal' }
 *          ];
 *          // arrayToFilter est le tableau de données à filtrer
 *          const { filtres, filtreControls } = this.filterService.initFiltres(arrayToFilter, filtersNamesAndTypes);
 *          this.filtres = filtres;
 *          this.filtreControls = filtreControls;
 * @component
 */
@Component({
  selector: 'app-filter',
  templateUrl: './filter.component.html',
  styleUrl: './filter.component.scss'
})
export class FilterComponent {

  private _filterOptions: string[];

  searchText = '';

  @ViewChild('searchInput') searchInput: ElementRef;

  onSelectOpened(opened: boolean) {
    if (opened) {
      setTimeout(() => {
        this.searchInput.nativeElement.focus();
      }, 0);
    }
  }

  @Input()
  set filterOptions(options: string[]) {
    this._filterOptions = options;
  }

  get filterOptions(): string[] {
    return this._filterOptions;
  }

  /**
   * Le nom du filtre.
   *
   * @input
   * @type {string}
   */
  @Input() filterName: string;

  /**
   * L'instance de FormControl associée au filtre.
   *
   * @input
   * @type {FormControl}
   */
  @Input() filterControl: FormControl;

  /**
   * Le tableau d'options pour le filtre.
   *
   * @input
   * @type {string[]}
   */
  //@Input() filterOptions: string[];

  /**
   * Le type du filtre. Il peut être 'select', 'input' ou 'date'.
   * Ne peut être que 'select' | 'input' | 'date'
   *
   * @input
   * @type {string}
   */
  @Input() filterType: string;

  /**
   * Réinitialise le filtre en réinitialisant l'instance de FormControl associée.
   */
  resetFilter() {
    this.filterControl.reset([]);
  }
}
