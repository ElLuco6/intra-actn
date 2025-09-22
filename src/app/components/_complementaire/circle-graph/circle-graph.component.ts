import { Component, Input, ViewChild } from '@angular/core';
import { ApexChart, ApexFill, ApexNonAxisChartSeries, ApexPlotOptions, ApexStroke, ChartComponent } from 'ng-apexcharts';

export type ChartOptions = {
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  labels: string[];
  plotOptions: ApexPlotOptions;
  fill: ApexFill;
  stroke: ApexStroke;
};

@Component({
  selector: 'app-circle-graph',
  templateUrl: './circle-graph.component.html',
  styleUrls: ['./circle-graph.component.scss']
})

export class CircleGraphComponent {
  @ViewChild("chart") chart: ChartComponent;
  public chartOptions: Partial<ChartOptions>;
  @Input() series :any[];

  colors: ['#F44336',  '#E91E63', '#9C27B0']
  constructor(){}
  ngOnInit(){
    this.chartOptions  = {
      series:  this.series,
      chart: {
        height: 350,
        type: "radialBar"
      },
      plotOptions: {
        radialBar: {
          dataLabels: {
            total: {
              show: true,
              label: "Total",
              formatter: function(w) {
                return this.series[0];
              }
            }
          }
        }
      },
      labels: ["Apples", "Oranges", "Bananas"]
      };
  }
}
