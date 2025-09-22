import {Component} from '@angular/core';
import {
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef
} from "@angular/material/dialog";
import {FormsModule} from "@angular/forms";
import {MatButton} from "@angular/material/button";
import {MatFormField, MatInput} from "@angular/material/input";

@Component({
  selector: 'app-save-filters',
  standalone: true,
  imports: [
    FormsModule,
    MatButton,
    MatDialogActions,
    MatDialogClose,
    MatDialogContent,
    MatFormField,
    MatInput,
  ],
  templateUrl: './save-filters.component.html',
  styleUrl: './save-filters.component.scss'
})
export class SaveFiltersComponent {

  displayName: string = "";

  constructor(public dialogRef: MatDialogRef<SaveFiltersComponent>) { }
}
