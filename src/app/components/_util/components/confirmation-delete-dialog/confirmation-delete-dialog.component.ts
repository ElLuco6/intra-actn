import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";

@Component({
  selector: 'app-confirmation-delete-dialog',
  templateUrl: './confirmation-delete-dialog.component.html',
  styleUrl: './confirmation-delete-dialog.component.scss'
})
export class ConfirmationDeleteDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmationDeleteDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: string) {}

  onNoClick(): void {
    this.dialogRef.close();
  }

  onYesClick(): void {
    this.dialogRef.close(true);
  }
}
