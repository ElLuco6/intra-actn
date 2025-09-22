import { Component, OnInit } from '@angular/core';
import {WindowService} from "@services/window.service";
import {animate, style, transition, trigger} from "@angular/animations";

@Component({
  selector: 'app-espace-client',
  templateUrl: './espace-client.component.html',
  styleUrls: ['./espace-client.component.scss'],
  animations: [
    trigger('routerFade', [
      transition('* => *', [
        style({ opacity: 0 }),
        animate('0.5s ease', style({ opacity: 1 }))
      ])
    ])
  ]
})
export class EspaceClientComponent implements OnInit {

  constructor(
    private window: WindowService
  ) { }

  ngOnInit() {
  }

  onActivate(event) {
    this.window.scroll(0, 0);
  }

}
