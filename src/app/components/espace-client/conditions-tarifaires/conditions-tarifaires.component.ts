import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { environment } from "@env/environment";
import { Remise } from "@models/remise";
import { MatTableDataSource } from "@angular/material/table";
import { MatSort } from "@angular/material/sort";
import { animate, state, style, transition, trigger } from "@angular/animations";

@Component({
  selector: 'app-conditions-tarifaires',
  templateUrl: './conditions-tarifaires.component.html',
  styleUrls: ['./conditions-tarifaires.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ]
})
export class ConditionsTarifairesComponent implements OnInit {

  @Input() numClient: number;

  classementDisplayedColumns: string[] = ['marque', 'classement'];
  remisesDisplayedColumns: string[] = ['marque', 'datedebutremise', 'datefinremise', 'colonne', 'colonnelibelle', 'niveau'];
  expandRemisesDisplayedColumns = [...this.remisesDisplayedColumns, 'expand'];

  expandedElement: Remise | null;

  remisesDataSource: MatTableDataSource<Remise>;
  classementDataSource: MatTableDataSource<ClientClassementMarques>;

  /** Initialise le sort de material */
  @ViewChild(MatSort) sort: MatSort;
  constructor(private http: HttpClient) { }

  ngOnInit() {
    this.getClassementMarques();
    this.getRemises();
  }

  getClassementMarques() {
    const params = this.numClient ? { client: this.numClient } : {};

    this.http.get<ClientClassementMarques[]>(`${environment.apiUrl}/ClientClassementMarques.php`, {
      withCredentials: true,
      params
    }).subscribe((data) => {
      this.classementDataSource = new MatTableDataSource(data);
    });
  }

  getRemises() {
    const params = this.numClient ? { client: this.numClient } : {};

    this.http.get<Array<Remise>>(`${environment.apiUrl}/ListeRemiseClient.php`, {
      withCredentials: true,
      params
    }).subscribe((data) => {
      this.remisesDataSource = new MatTableDataSource(data);
      setTimeout(() => {
        this.remisesDataSource.sort = this.sort;
      }, 100);
    });
  }

}

export class ClientClassementMarques {
  classement: number;
  classementCode: number;
  marque: string;
  marqueCode: string;
}