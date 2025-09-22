import { Component, OnInit, ViewChild } from '@angular/core';
import {
  MatTableDataSource
} from "@angular/material/table";
import { MatSort } from "@angular/material/sort";
import { CampagnesService } from "@services/campagnes.service";
import { Filter, FilterControl } from '@/models/filter';
import { FilterService } from '@/services/filter.service';

@Component({
  selector: 'app-liste-campagnes',
  templateUrl: './liste-campagnes.component.html',
  styleUrl: './liste-campagnes.component.scss'
})
export class ListeCampagnesComponent implements OnInit {
  displayedColumns: string[] = ['campagne', 'libelle', 'auteur', 'date', 'nbContacts', 'nbCalls'];
  dataSource: MatTableDataSource<any>;
  @ViewChild(MatSort) sort: MatSort;
  filtres: Filter[] = [];
  filtreControls: FilterControl = {};

  onlyActiveCampaigns = true;
  campagnes = [];
  campagnesActives = [];
  constructor(private campagnesService: CampagnesService, private filterService: FilterService) { }

  ngOnInit() {
    this.campagnesService.getCampagnes().subscribe((campagnes) => {
      const today = new Date();
      for (const campagne of campagnes) {
        const parts = campagne.datefin.split('/');
        const datefin = new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
        if (datefin >= today) {
          this.campagnesActives.push(campagne);
        }
      }
      this.campagnes = campagnes;
      this.dataSource = new MatTableDataSource(this.campagnesActives);
      this.dataSource.sort = this.sort;
      this.initializeFilters();
    });
  }

  swapFilter() {
    this.onlyActiveCampaigns = !this.onlyActiveCampaigns;
    this.dataSource = new MatTableDataSource(this.onlyActiveCampaigns ? this.campagnesActives : this.campagnes);
    this.initializeFilters();
  }

  initializeFilters() {
    const filtersNamesAndTypes = [
      { name: 'campagne', type: 'input', displayName: 'Campagne' },
      { name: 'libelle', type: 'input', displayName: 'Libellé' },
      { name: 'user', type: 'input', displayName: 'Auteur' }
    ];

    const { filtres, filtreControls } = this.filterService.initFiltres(this.dataSource, filtersNamesAndTypes);
    this.filtres = filtres;
    this.filtreControls = filtreControls;
  }

}
