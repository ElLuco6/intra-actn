import {Injectable, TemplateRef} from '@angular/core';
import {DynamicDialogComponent} from "@components/_util/components/dynamic-dialog/dynamic-dialog.component";
import {MatDialog} from "@angular/material/dialog";

@Injectable({
  providedIn: 'root'
})
export class DialogService {
  constructor(private dialog: MatDialog) {}

  openDialog(title: string, contentTemplate: TemplateRef<any>, context: any = {}, confirmCallback?: () => void): void {
    const dialogRef = this.dialog.open(DynamicDialogComponent, {
      width: '400px',
      data: { title, contentTemplate, context }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && confirmCallback) {
        confirmCallback();
      }
    });
  }

}
