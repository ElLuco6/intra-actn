import {Component, Inject} from '@angular/core';
import {MatDialogModule, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import {MatButtonModule} from '@angular/material/button';
import {MatCard, MatCardActions, MatCardTitle} from "@angular/material/card";

@Component({
  selector: 'app-modif-devis-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, MatCard, MatCardTitle, MatCardActions],
  templateUrl: './modif-devis-dialog.component.html',
  styleUrl: './modif-devis-dialog.component.scss'
})
export class ModifDevisDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ModifDevisDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {numDevis: string}
  ) {
  }
}
