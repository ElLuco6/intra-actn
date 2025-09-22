import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-tab-sort',
  templateUrl: './tab-sort.component.html',
  styleUrls: ['./tab-sort.component.scss']
})
export class TabSortComponent implements OnInit {

  get state(): string {
    return this._state;
  }
  @Input() set state(s: string) {
    switch (s) {
      case 'off':
      case 'asc':
      case 'desc':
        this._state = s;
        break;
      default:
        this._state = 'off';
        break;
    }
  }

  private _state = 'off';

  constructor() { }

  ngOnInit(): void {
  }

}
