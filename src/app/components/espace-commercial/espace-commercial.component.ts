import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {WindowService} from "@services/window.service";
import {animate, style, transition, trigger} from "@angular/animations";

@Component({
  selector: 'app-espace-commercial',
  templateUrl: './espace-commercial.component.html',
  styleUrls: ['./espace-commercial.component.scss'],
  animations: [
    trigger('routerFade', [
      transition('* => *', [
        style({ opacity: 0 }),
        animate('0.5s ease', style({ opacity: 1 }))
      ])
    ])
  ]
})
export class EspaceCommercialComponent implements OnInit {

  constructor(private window: WindowService,
              private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {

  }

  onActivate(event) {
    this.window.scroll(0, 0);
    this.cdr.detectChanges();
  }
}
