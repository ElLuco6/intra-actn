import { Graph } from "@/components/espace-commercial/graph/suivi-activite/suivi-activite.component";
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from "@angular/core";

import {
  ChartComponent,
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexDataLabels,
  ApexStroke,
  ApexMarkers,
  ApexYAxis,
  ApexGrid,
  ApexTitleSubtitle,
  ApexLegend
} from "ng-apexcharts";

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  stroke: ApexStroke;
  dataLabels: ApexDataLabels;
  markers: ApexMarkers;
  tooltip: any; // ApexTooltip;
  yaxis: ApexYAxis;
  grid: ApexGrid;
  legend: ApexLegend;
  title: ApexTitleSubtitle;
};


@Component({
  selector: 'app-line-graph',
  templateUrl: './line-graph.component.html',
  styleUrls: ['./line-graph.component.scss']
})
export class LineGraphComponent implements OnInit, OnChanges {
  @Input()  series:Graph[][] =[]
  @Input()  currentLineArray:Graph[] =[]
  resultat: number[] = [];
  currResult:number[] = [];
  obj:number[] = [];
  @ViewChild("chart") chart: ChartComponent;
  done:boolean = false
  public chartOptions: Partial<ChartOptions>;
  lineDone =  false
  constructor() {


  }


  ngOnInit() {

// let resultat = this.additionnerTableaux(this.pastArray);
  // Appeler la fonction additionnerTableaux de manière asynchrone


}

ngOnChanges(changes: SimpleChanges) {
setTimeout(()=>{
  if (changes['series'] && changes['series'].currentValue) {
    // Appeler la fonction additionnerTableaux lorsque la donnée du parent change
    this.resultat = this.additionnerTableaux(this.series[0]);


    this.currResult = this.additionnerTableaux(this.series[1]);
    this.obj = this.additionnerTableaux(this.series[2]);

  }

  this.chartOptions = {
    series: [
      {
        name: "C.A en € de l\'année dernière",
        data: this.resultat
      },
      {
        name: "C.A en € de cette année",
        data: this.currResult
      },
      {
        name: "Objectif en € de cette année",
        data: this.obj
      }

    ],
    chart: {
      height: 350,
      type: "line"
    },
    dataLabels: {
      enabled: false
    },
    stroke: {
      width: 5,
      curve: "straight",
      dashArray: [0, 0, 5]
    },
    title: {
      text: "",
      align: "left"
    },
  /*   legend: {
      tooltipHoverFormatter: function (val, opts) {

        return (
          val +
          " - <strong>" +
          opts.w.globals.series[opts.seriesIndex][opts.dataPointIndex] +
          +
          "</strong>"
        );
      }
    }, */
    markers: {
      size: 0,
      hover: {
        sizeOffset: 6
      }
    },
    xaxis: {
      labels: {
        trim: false
      },
      categories:['Janvier', 'Fevrier', 'Mars', 'Avri', 'Mai', 'Juin', 'Juillet', 'Aout', 'Septembre', 'Octobre', 'Novembre', 'Décembre']
    },
  /*   tooltip: {
      y: [
        {
          title: {
            formatter: function (val) {
              return val ;
            }
          }
        },
        {
          title: {
            formatter: function (val) {
              return val ;
            }
          }
        },
        {
          title: {
            formatter: function (val) {
              return val ;
            }
          }
        }

      ]
    } ,*/
    grid: {
      borderColor: "#f1f1f1"
    }
  };
  this.lineDone =true
},3000)


}

additionnerTableaux(objets: Graph[]):number[]  {

  if (objets.length === 0) {
    return [];
  }

  const longueurTableau = objets[0].data.length;
  const resultat = new Array(longueurTableau).fill(0);

  for (let i = 0; i < objets.length; i++) {
    const objet = objets[i];

    if (!objet || !objet.data) {
      throw new Error('Les objets doivent avoir une propriété "data" définie.');
    }

    const tableau = objet.data;

    if (tableau.length !== longueurTableau) {
      throw new Error('Les tableaux n\'ont pas la même longueur.');
    }

    for (let j = 0; j < longueurTableau; j++) {
      resultat[j] += tableau[j];
    }
  }

  return resultat;
}


  // Exemple d'utilisation





}
