import {Component, Inject} from '@angular/core';
import {MatButton} from "@angular/material/button";
import {MAT_DIALOG_DATA, MatDialogActions, MatDialogClose, MatDialogContent} from "@angular/material/dialog";
import {ReactiveFormsModule} from "@angular/forms";

@Component({
  selector: 'app-supprimer-filtrage',
  standalone: true,
    imports: [
        MatButton,
        MatDialogActions,
        MatDialogClose,
        MatDialogContent,
        ReactiveFormsModule
    ],
  templateUrl: './supprimer-filtrage.component.html',
  styleUrl: './supprimer-filtrage.component.scss'
})
export class SupprimerFiltrageComponent {

  constructor(@Inject(MAT_DIALOG_DATA) public data: {displayName: string }) {
  }
}
