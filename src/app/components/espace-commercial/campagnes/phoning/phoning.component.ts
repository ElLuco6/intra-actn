import {Component, OnInit} from '@angular/core';
import {CampagnesService} from "@services/campagnes.service";
import {PeopleOfCampaign} from "@models/peopleOfCampaign";
import {ActivatedRoute, Router} from "@angular/router";
import {Campagne} from "@models/campagne";
import {MatDialog} from "@angular/material/dialog";
import {
  PhoningCommDialogComponent
} from "@components/espace-commercial/campagnes/phoning/phoning-comm-dialog/phoning-comm-dialog.component";
import {VisiteService} from "@services/visite.service";
import {CompteRenduVisite} from "@models/compteRenduVisite";
import {
  ApexNonAxisChartSeries,
  ApexPlotOptions,
  ApexChart
} from "ng-apexcharts";
import {take} from "rxjs/operators";
import {ModifInfosSocieteComponent} from './modif-infos-societe/modif-infos-societe.component';
import {EditContactComponent} from './edit-contact/edit-contact.component';
import {MatTableDataSource} from '@angular/material/table';

export type ChartOptions = {
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  labels: string[];
  plotOptions: ApexPlotOptions;
  colors: string[];
};

@Component({
  selector: 'app-phoning',
  templateUrl: './phoning.component.html',
  styleUrl: './phoning.component.scss'
})
export class PhoningComponent implements OnInit {

  displayedColumns: string[] = ['nom', 'telephone', 'mail', 'servicelib', 'commentaire', 'modifier'];
  peoples: PeopleOfCampaign[] = [];
  currentIndex: number = 0;
  contacts = new MatTableDataSource([]);
  currentCampagne: Campagne;
  currentPeople: PeopleOfCampaign;
  idClient: string;
  visiteOfCampaignByPeople: CompteRenduVisite[] = [];
  public chartOptions: Partial<ChartOptions>;

  constructor(private campagneService: CampagnesService,
              private activatedRoute: ActivatedRoute,
              public dialog: MatDialog,
              private visiteService: VisiteService,
              private router: Router) {

  }

  ngOnInit() {
    this.activatedRoute.params.subscribe(params => {
      this.idClient = params['idClient'];
    });
    this.campagneService.currentCampagne.subscribe(campagne => {
      if (campagne.campagne == '') {
        this.campagneService.getCampagneById(this.activatedRoute.snapshot.params['id']).subscribe((campagneArr) => {
          let campagne = campagneArr[0];
          this.campagneService.changeCampaign(new Campagne(
            campagne.campagne,
            campagne.datedeb,
            campagne.datefin,
            campagne.libelle,
            campagne.texte,
            campagne.user,
            campagne.user1,
            campagne.user2,
            campagne.user3,
            campagne.user4,
            campagne.nbrSocietes));
        });
      } else {
        this.currentCampagne = campagne;
      }
    });

    this.campagneService.currentPeople.pipe(take(1)).subscribe(people => {
      let selectedIds = this.activatedRoute.snapshot.params['idClient'];
      if (!selectedIds) {
        const phoningSelection = JSON.parse(localStorage.getItem('phoningSelection')) || [];
        selectedIds = phoningSelection.find(selection => selection.idCampagne === this.activatedRoute.snapshot.params['id']).ids;
      }
      const sorting = JSON.parse(localStorage.getItem('filtresCampagnes')).find(selection => selection.idCampagne === this.activatedRoute.snapshot.params['id']).sorting;
      if (people.length === 0) {
        this.campagneService.getPeopleByCampaign(this.activatedRoute.snapshot.params['id']).subscribe((peoples) => {
          this.peoples = Object.values(this.campagneService.groupContacts(peoples))
            .filter(people => selectedIds.includes(people.numero))
            .sort((a, b) => {
              const aSorting = (sorting.active === 'numero' || sorting.active === 'codepostal') ? Number(a[sorting.active]) : a[sorting.active];
              const bSorting = (sorting.active === 'numero' || sorting.active === 'codepostal') ? Number(b[sorting.active]) : b[sorting.active];
              if (sorting.direction === 'asc') {
                return aSorting > bSorting ? 1 : -1;
              } else {
                return aSorting < bSorting ? 1 : -1;
              }
            });
          this.campagneService.changePeople(this.peoples);
          this.instancePhoning();
        });
      } else {
        this.peoples = people.filter(people => selectedIds.includes(people.numero)).sort((a, b) => {
          const aSorting = (sorting.active === 'numero' || sorting.active === 'codepostal') ? Number(a[sorting.active]) : a[sorting.active];
          const bSorting = (sorting.active === 'numero' || sorting.active === 'codepostal') ? Number(b[sorting.active]) : b[sorting.active];
          if (sorting.direction === 'asc') {
            return aSorting > bSorting ? 1 : -1;
          } else {
            return aSorting < bSorting ? 1 : -1;
          }
        });
        this.instancePhoning();
      }
    });

    if (this.campagneService.actionCampaign.length === 0) {
      this.campagneService.getActionCampaign().subscribe((data) => {
        this.campagneService.actionCampaign = data;
      });
    }
  }

  instancePhoning() {
    if (this.idClient) {
      this.currentIndex = this.peoples.findIndex(people => people.numero === this.idClient);
    } else {
      this.currentIndex = 0;
    }
    this.updateCurrentPeople();
    this.chartUpdate();
  }

  onNextClick() {
    if (this.currentIndex < this.peoples.length - 1) {
      this.currentIndex++;
    } else {
      // Si on est à la fin de la liste, on revient au début
      this.currentIndex = 0;
    }
    this.updateCurrentPeople();
  }

  onPreviousClick() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
    } else {
      // Si on est au début de la liste, on va à la fin
      this.currentIndex = this.peoples.length - 1;
    }
    this.updateCurrentPeople();
  }

  updateCurrentPeople() {
    this.currentPeople = this.peoples[this.currentIndex];
    let currentPerson = this.peoples[this.currentIndex % this.peoples.length]
    this.contacts = new MatTableDataSource(currentPerson.contacts);

    this.visiteOfCampaignByPeople = [];

    this.visiteService.getVisiteByCampaignByPeople(this.currentCampagne.campagne, currentPerson.type, currentPerson.numero).subscribe(
      (visites) => {
        this.visiteOfCampaignByPeople = visites;
      });
    this.chartUpdate();
  }

  chartUpdate() {
    let numerateur = 0;
    let denominateur = this.currentCampagne.nbrSocietes;
    this.visiteService.countVisiteByCampaign(this.currentCampagne.campagne).subscribe((data) => {
        numerateur = this.campagneService.groupCompteRendu([...data.clients, ...data.prospects]).length;
        let completion = Math.ceil((numerateur / denominateur) * 100);
        this.chartOptions = {
          series: [Math.round(completion * 100) / 100],
          chart: {
            height: 350,
            type: "radialBar"
          },
          plotOptions: {
            radialBar: {
              hollow: {
                size: "70%"
              }
            }
          },
          colors: ["#006d3c"],
          labels: ["Progression campagne"]
        };
      }
    );
  }

  openDialogCompteRendu(people: PeopleOfCampaign) {
    people.type = this.currentPeople.type;
    this.dialog.open(PhoningCommDialogComponent, {
      data: {
        people: people,
        numPeople: this.currentPeople.numero,
        campagne: this.currentCampagne,
        actions: this.campagneService.actionCampaign,
        type: this.currentPeople.type
      },
    });
    this.dialog.afterAllClosed.subscribe(() => {
      this.updateCurrentPeople();
    })
  }

  openDialogCompteRenduGroupe() {
    this.dialog.open(PhoningCommDialogComponent, {
      data: {
        numPeople: this.currentPeople.numero,
        type: this.currentPeople.type,
        campagne: this.currentCampagne,
        actions: this.campagneService.actionCampaign
      },
    });
    this.dialog.afterAllClosed.subscribe(() => {
      this.updateCurrentPeople();
    })
  }

  openModifInfosSocieteDialog(societe: PeopleOfCampaign) {
    const dialogRef = this.dialog.open(ModifInfosSocieteComponent, {
      minWidth: '1000px',
      data: {societe}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.currentPeople.siret = result.numSiret;
        this.currentPeople.telephone = result.numTelephone;
        this.currentPeople.adresse1 = result.adresse;
        this.currentPeople.ville = result.ville;
        this.currentPeople.codepostal = result.codePostal;
      }
    });
  }

  openEditContactDialog(mode: 'add' | 'edit', index?: number) {
    const dialogRef = this.dialog.open(EditContactComponent, {
      minWidth: '1000px',
      data: {
        idClient: this.currentPeople.numero,
        isProspect: this.currentPeople.type === 'P',
        idCampagne: this.currentCampagne.campagne,
        mode: mode,
        oldContact: this.contacts.data[index]
      }
    });

    dialogRef.afterClosed().subscribe(result => {
        if (result) {
          if (mode === 'add') {
            this.contacts.data.push({
              nom: result.contactForm.nom,
              service: result.contactForm.service,
              mail: result.contactForm.mail,
              fixe: result.contactForm.fixe,
              gsm: result.contactForm.gsm,
              fonctioncode: result.contactForm.fonctioncode,
              mailing: result.contactForm.mailing ? 'O' : 'N'
            });
          } else {
            this.contacts.data[index] = {
              nom: result.contactForm.nom,
              service: result.contactForm.service,
              mail: result.contactForm.mail,
              fixe: result.contactForm.fixe,
              gsm: result.contactForm.gsm,
              fonctioncode: result.contactForm.fonctioncode,
              mailing: result.contactForm.mailing ? 'O' : 'N'
            };
          }
          this.contacts.data = [...this.contacts.data];
        }
      }
    );
  }

  openPeopleInOtherWindows(people: PeopleOfCampaign) {
    let url = '';
    if (people.type === 'P') {
      url = this.router.serializeUrl(
        this.router.createUrlTree([`/espace-commercial/prospects/detail/` + people.numero])
      );
    } else {
      url = this.router.serializeUrl(
        this.router.createUrlTree([`/client-detail/` + people.numero])
      );
    }

    window.open(url, '_blank');
  }
}
