import {Component, OnInit, ViewChild} from '@angular/core';
import {environment} from "@env/environment";
import {HttpClient} from "@angular/common/http";
import {Rma} from "@models/rma";
import {ActivatedRoute} from "@angular/router";
import {BehaviorSubject} from "rxjs";
import {MatPaginator} from "@angular/material/paginator";
import {MatSort} from "@angular/material/sort";
import {MatTableDataSource} from "@angular/material/table";
import {animate, state, style, transition, trigger} from "@angular/animations";
import {faFilePdf} from "@fortawesome/free-solid-svg-icons";

@Component({
  selector: 'app-rma-bloque',
  templateUrl: './rma-bloque.component.html',
  styleUrls: ['./rma-bloque.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class RmaBloqueComponent implements OnInit{

  columnsToDisplay = ['client', 'raison', 'marque', 'numerodmd', 'produit', 'designation', 'numerorma', 'quantiteretourne', 'qtedemande', 'status'];
  test = ['N° Client', 'Raison', 'Marque', 'N° Demande', 'Réf. produit', 'Désignation', 'N° de RMA', 'Qte retour', 'Qte rec.', 'Status'];
  columnsToDisplayWithExpand = [...this.columnsToDisplay, 'expand'];
  expandedElement: Rma | null;
  environment = environment;
  processedRma$ = new BehaviorSubject<Array<Rma>>([]);
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  dataSource = new MatTableDataSource<Rma>();
  listRma: Rma[] = [];
  filtreRegion: string = '';

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute
  ) {
  }
  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.filtreRegion = params['region'];
    })
    this.getRma();
  }

  getRma(){
    return this.http.get<Array<Rma>>(`${environment.apiUrl}/ListeRMA.php`,{
      params: {
        fitreregion: this.filtreRegion
      }
    }).subscribe(
      (data) => {
        this.listRma = data;
        this.processedRma$.next(this.listRma);
        this.processedRma$.subscribe((d) => {
          this.dataSource.data = d;
        });
      },
      (error) => {
        console.log(error);
      })
  }

  protected readonly faFilePdf = faFilePdf;
}
