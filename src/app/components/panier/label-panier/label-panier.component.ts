import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-label-panier',
  templateUrl: './label-panier.component.html',
  styleUrls: ['./label-panier.component.scss']
})
export class LabelPanierComponent implements OnInit {

  @Input() modeAffichage:number = 0;
  constructor() { }

  ngOnInit(): void {
  }

}
