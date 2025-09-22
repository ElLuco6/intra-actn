import {Component} from '@angular/core';
import {WindowService} from "@services/window.service";

@Component({
  selector: 'app-incidents',
  templateUrl: './incidents.component.html',
  styleUrls: ['./incidents.component.scss']
})
export class IncidentsComponent {
  constructor(private window: WindowService) { }
  onActivate(event) {
    this.window.scroll(0, 0);
  }
}
