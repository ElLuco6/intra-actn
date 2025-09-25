import {Component, OnInit, ViewChild} from '@angular/core';
import {
  MatTableDataSource
} from "@angular/material/table";
import {MatSort} from "@angular/material/sort";
import {CampagnesService} from "@services/campagnes.service";
import {Filter, FilterControl} from '@/models/filter';
import {FilterService} from '@/services/filter.service';
import {Campagne} from "@models/campagne";
import {VisiteService} from "@services/visite.service";

@Component({
  selector: 'app-liste-campagnes',
  templateUrl: './liste-campagnes.component.html',
  styleUrl: './liste-campagnes.component.scss'
})
export class ListeCampagnesComponent implements OnInit {
  displayedColumns: string[] = ['completion', 'campagne', 'libelle', 'auteur', 'date', 'nbSocietes', 'nbCalls'];
  dataSource: MatTableDataSource<any>;
  @ViewChild(MatSort) sort: MatSort;
  filtres: Filter[] = [];
  filtreControls: FilterControl = {};

  onlyActiveCampaigns = true;
  campagnes = [];
  completionCampagnesMap = new Map<string, number>();
  chartOptions;
  campagnesActives = [];

  constructor(
    private campagnesService: CampagnesService,
    private filterService: FilterService,
    private visiteService: VisiteService,
  ) {
  }

  ngOnInit() {
    this.initializeChartOptions();
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
      this.calculerCompletionCampagnes();
      this.initializeFilters();
    });
  }

  swapFilter() {
    this.onlyActiveCampaigns = !this.onlyActiveCampaigns;
    if (this.onlyActiveCampaigns) {
      this.displayedColumns = ['completion', 'campagne', 'libelle', 'auteur', 'date', 'nbSocietes', 'nbCalls'];
    } else {
      this.displayedColumns = ['campagne', 'libelle', 'auteur', 'date', 'nbSocietes', 'nbCalls'];
    }
    this.dataSource = new MatTableDataSource(this.onlyActiveCampaigns ? this.campagnesActives : this.campagnes);
    this.initializeFilters();
  }

  initializeFilters() {
    const filtersNamesAndTypes = [
      {name: 'campagne', type: 'input', displayName: 'Campagne'},
      {name: 'libelle', type: 'input', displayName: 'Libellé'},
      {name: 'user', type: 'input', displayName: 'Auteur'}
    ];

    const {filtres, filtreControls} = this.filterService.initFiltres(this.dataSource, filtersNamesAndTypes);
    this.filtres = filtres;
    this.filtreControls = filtreControls;
  }

  calculerCompletionCampagnes() {
    this.campagnesActives.forEach((campagne: Campagne) => {
      let numerateur = 0;
      let denominateur = campagne.nbrSocietes;
      if (denominateur) {
        this.visiteService.countVisiteByCampaign(campagne.campagne).subscribe((data) => {
            numerateur = this.campagnesService.groupCompteRendu([...data.clients, ...data.prospects]).length;
            this.completionCampagnesMap.set(campagne.campagne, Math.ceil((numerateur / denominateur) * 100));
          }
        );
      }
    });
  }

  initializeChartOptions() {
    this.chartOptions = {
      chart: {
        height: 80,
        type: "radialBar"
      },
      plotOptions: {
        radialBar: {
          hollow: {
            size: "50%"
          },
          track: {
            strokeWidth: "100%"
          },
          dataLabels: {
            name: {
              show: false
            },
            value: {
              offsetY: 5,
              fontSize: "12px",
            }
          }
        }
      },
      colors: ["#006d3c"]
    };
  }


}
