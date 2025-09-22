import {Component, OnInit, ViewChild} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {MatPaginator} from "@angular/material/paginator";
import {environment} from "@env/environment";
import * as XLSX from "xlsx";
import {SelectionModel} from "@angular/cdk/collections";
import {MatTableDataSource} from "@angular/material/table";
import {MatSort} from "@angular/material/sort";

@Component({
  selector: 'app-numeros-de-serie',
  templateUrl: './numeros-de-serie.component.html',
  styleUrls: ['./numeros-de-serie.component.scss']
})
export class NumerosDeSerieComponent implements OnInit {
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  defautNumerosDeSerie: any[] = null;
  dataSource = new MatTableDataSource<any>();
  selection = new SelectionModel<any[]>(true, []);
  displayedColumns: string[] = ['select', 'marque', 'produit', 'refcommande', 'serie', 'commande', 'datecommande', 'bl', 'datebl', 'facture'];

  // Attributs de la recherche
  currentSearchTarget: string = ""; // target of the last search, security measure to prevent jumping over search fields
  currentSearchId: any; // the ID of the setTimeout of the current search, may already be over.
  searchMiliDelay: number = 700; // amount of milisecond to wait with no input to start a search
  // Filtres
  filtres = new Map<string, string | Array<string>>();
  marqueSet = new Set<string>();

  // Variables d'autocompletion
  AutoCompletePools: {
    serieDefault: Array<string>,
    serie: Array<string>,
    produitDefault: Array<string>,
    produit: Array<string>,
    commandeDefault: Array<string>,
    commande: Array<string>,
    blDefault: Array<string>,
    bl: Array<string>,
    factureDefault: Array<string>,
    facture: Array<string>
  } = {
    serieDefault: null,
    serie: null,
    produitDefault: null,
    produit: null,
    commandeDefault: null,
    commande: null,
    blDefault: null,
    bl: null,
    factureDefault: null,
    facture: null
  };

  environment = environment;

  constructor(
    private http: HttpClient
  ) {
  }

  ngOnInit(): void {
    this.filtres.set('marque', []);

    this.httpGetListeSerie(); // récupération de la liste des numéros de séries par produits
  }

  /**
   * Envois de la réquete 'ListeSerie.php'
   * & récupération des numéros de séries des produits commandés par le client.
   */
  private httpGetListeSerie(): void {
    this.http.get<any[]>(`${environment.apiUrl}/ListeSerie.php`, {
      withCredentials: true,
      responseType: 'json'
    }).subscribe((ret) => {
      this.defautNumerosDeSerie = ret;
      this.dataSource = new MatTableDataSource(ret);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
      this.selection.select(...this.dataSource.data);
      this.getAllMarquesSet();
      this.fillAutoCompleteVariables();
    });
  }

  /**
   * Remplis le set 'marqueSet' avec tout les marques des numsSerie
   *
   */
  private getAllMarquesSet(): void {
    for (const numSerie of this.defautNumerosDeSerie) {
      this.marqueSet.add(numSerie.marque);
    }
    this.marqueSet.delete("");
  }

  private fillAutoCompleteVariables(): void {
    // [...new Set(numbers)]
    let serieAutoComplete: Set<string> = new Set<string>();
    let produitAutoComplete: Set<string> = new Set<string>();
    let commandeAutoComplete: Set<string> = new Set<string>();
    let blAutoComplete: Set<string> = new Set<string>();
    let factureAutoComplete: Set<string> = new Set<string>();

    for (const numSerie of this.defautNumerosDeSerie) // on récupère tout les éléments
    {
      serieAutoComplete.add(numSerie.serie);
      produitAutoComplete.add(numSerie.produit);
      commandeAutoComplete.add(numSerie.commande);
      blAutoComplete.add(numSerie.bl);
      factureAutoComplete.add(numSerie.facture);
    }

    serieAutoComplete.delete("");// on supprime la case blanche si elle existe
    produitAutoComplete.delete("");
    commandeAutoComplete.delete("");
    blAutoComplete.delete("");
    factureAutoComplete.delete("");

    this.AutoCompletePools.serieDefault = new Array<string>(...serieAutoComplete); // on les case dans des Array
    this.AutoCompletePools.produitDefault = new Array<string>(...produitAutoComplete);
    this.AutoCompletePools.commandeDefault = new Array<string>(...commandeAutoComplete);
    this.AutoCompletePools.blDefault = new Array<string>(...blAutoComplete);
    this.AutoCompletePools.factureDefault = new Array<string>(...factureAutoComplete);

    this.AutoCompletePools.serieDefault.sort(); // on tri les éléments
    this.AutoCompletePools.produitDefault.sort();
    this.AutoCompletePools.commandeDefault.sort();
    this.AutoCompletePools.blDefault.sort();
    this.AutoCompletePools.factureDefault.sort();

    this.AutoCompletePools.serie = this.AutoCompletePools.serieDefault; // on initialise les pools de lecture
    this.AutoCompletePools.produit = this.AutoCompletePools.produitDefault;
    this.AutoCompletePools.commande = this.AutoCompletePools.commandeDefault;
    this.AutoCompletePools.bl = this.AutoCompletePools.blDefault;
    this.AutoCompletePools.facture = this.AutoCompletePools.factureDefault;
  }

  // FILTRAGE
  /**
   * @param target champs cible de la recherche
   * @param event valeur de la recherche / filtres à appliquer
   * @param editAutoComplete (facultatif) editer la pool d'autocomplétion du target ?
   */
  onSearch(target: string, event: string | string[], editAutoComplete: boolean = false): void {
    if (this.currentSearchTarget == target) {
      clearTimeout(this.currentSearchId);
    }

    this.currentSearchTarget = target;
    this.currentSearchId = setTimeout(
      () => {
        if (editAutoComplete) {
          this.editAutoCompletePool(target, event as string);
        }
        this.filtres.set(target, event);
        this.filtrerNumerosDeSerie();
      },
      this.searchMiliDelay
    );
  }

  filtrerNumerosDeSerie(): void {
    let numsSerie = this.defautNumerosDeSerie;
    let pass;
    for (const target of this.filtres.keys()) // pour chaque filtre activé (on peut commencer la boucle par les filtres car les filtres entre eux forment une porte ET)
    {
      if (target != 'marque') // filtrage normal
      {
        numsSerie = numsSerie.filter( // on trie chaque numeroDeSerie
          (numSerie: Array<any>) => {
            if (Object.keys(numSerie).find(key => key === target) != null) {
              return (this.filtres.get(target) != null ? this.arrayToUpper(numSerie[target]).includes(this.arrayToUpper(this.filtres.get(target))) : true)
            } else {
              return (false);
            }

          }
        );
      } else  // filtrage par marque
      {
        numsSerie = numsSerie.filter( // on trie chaque numeroDeSerie
          (numSerie: Array<any>) => {
            if (this.filtres.get(target).length === 0) {
              return (true)
            } else {
              pass = false;
              for (const mark of this.filtres.get(target)) {
                pass = pass || numSerie[target].includes(mark);
              }
              return (pass);
            }
          }
        );
      }
    }
    this.dataSource.data = numsSerie;
    this.selection.clear();
    this.selection.select(...this.dataSource.data);
  }

  /**
   * Renvois le parametre 'arr' convertit toUpperCase qu'il soit string ou string[]
   * @param arr string ou un tableau de string à convertir toUpperCase
   * @return arr toUpperCase du même type qu'en entrée
   */
  arrayToUpper(arr: string | string[]): any {
    let typearr: string = typeof arr;
    if (typearr == "string") {
      return ((arr as string).toUpperCase());
    }
    if (typearr == "Array") {
      return ((arr as Array<string>).map(
        (elem) => {
          return (elem.toUpperCase());
        }
      ));
    }
  }

  filtreMarqueToggle(marque: string): void {
    const filtreMarque = this.filtres.get('marque') as Array<string>;
    if (!!filtreMarque.includes(marque)) {
      filtreMarque.splice(filtreMarque.indexOf(marque), 1);
    } else {
      filtreMarque.push(marque);
    }
    this.filtres.set('marque', Array.from(filtreMarque)); // la création d'un nouvel Array avec Array.from permet de changer la reference de la valeur du set, ce qui met à jour les éléments l'observant. Dans ce cas, l'input de marque
    this.filtrerNumerosDeSerie();
  }

  editAutoCompletePool(target: string, event: string): void {
    let newAutoCompletePool: string[] = Array.from(this.AutoCompletePools[target + 'Default']);

    newAutoCompletePool = newAutoCompletePool.filter(
      (AutoCompleteItem) => {
        return (AutoCompleteItem.includes(event));
      }
    );

    this.AutoCompletePools[target] = newAutoCompletePool;
  }

  isAllSelected() {
    return this.selection.selected.length === this.dataSource.data.length;
  }

  toggleAllRows() {
    this.isAllSelected() ? this.selection.clear() : this.selection.select(...this.dataSource.filteredData);
  }

  checkboxLabel(row?: any[]): string {
    return row ? `${this.selection.isSelected(row) ? 'deselect' : 'select'}` : `${this.isAllSelected() ? 'deselect' : 'select'} all`;
  }

  exportToExcel(): void {
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.selection.selected);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Numéros de série');
    XLSX.writeFile(wb, 'Numéros de série.xlsx');
  }

}
