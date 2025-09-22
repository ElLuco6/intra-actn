import { Component } from '@angular/core';
import {SnackbarService} from "@services/snackbar.service";
import {faTimes} from "@fortawesome/free-solid-svg-icons";

@Component({
  selector: 'app-snackbar',
  templateUrl: './snackbar.component.html',
  styleUrls: ['./snackbar.component.scss']
})
export class SnackbarComponent {

    constructor(
      public snackbarService: SnackbarService
    ) {}

  protected readonly faTimes = faTimes;
}
