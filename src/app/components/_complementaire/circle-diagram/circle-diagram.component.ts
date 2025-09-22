import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from "@services/authentication.service";
import {
  ApexNonAxisChartSeries,
  ApexResponsive,
  ApexChart,
  ApexPlotOptions
} from "ng-apexcharts";
import { environment } from "@env/environment";

export type ChartOptions = {
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  responsive: ApexResponsive[];
  plotOptions: ApexPlotOptions;
  labels: any;
};

@Component({
  selector: 'app-circle-diagram',
  templateUrl: './circle-diagram.component.html',
  styleUrls: ['./circle-diagram.component.scss']
})
export class CircleDiagramComponent implements OnInit {
  public chartOptions: Array<Partial<ChartOptions>> | any = [];
  listCa: Array<any> = [];

  constructor(public auth: AuthenticationService) {}

  async ngOnInit() {
    try {
      const response = await fetch(`${environment.apiUrl}/RegionCAcategorieDetail2.php?region1=${this.auth.currentUser.region1}&region2=${this.auth.currentUser.region2}`);
      const data = await response.json();
      Object.keys(data).forEach((e) => {
        this.listCa = Object.values(data[e]);
        const ca = [];
        const color = [];
        const label = [];

        this.listCa.forEach((item) => {
          if (item.categorie !== 'n.c' && item.categorie !== 'Divers') {
            ca.push(item.ca);
            color.push(item.color);
            label.push(item.categorie);
          }
        });

        this.setDiagramme(ca, label, color, e);
      });
    } catch (error) {
      console.error(error);
    }
  }

  setDiagramme(series, label, color, nom) {
    this.chartOptions.push({
      nom: nom,
      series: series,
      chart: {
        type: "donut",
        height: "300px",
      },
      labels: label,
      responsive: [
        {
          breakpoint: 480,
          options: {
            chart: {
              height: 300
            },
            legend: {
              position: "bottom"
            }
          }
        }
      ],
      plotOptions: {
        pie: {
          donut: {
            labels: {
              show: true,
              total: {
                showAlways: true,
                show: true
              }
            }
          }
        }
      },
      colors: color
    });
  }
}
