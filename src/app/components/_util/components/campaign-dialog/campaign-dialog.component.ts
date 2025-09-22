import {Component, Inject} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {Campagne} from "@models/campagne";
import {environment} from "@env/environment";

@Component({
  selector: 'app-campaign-dialog',
  templateUrl: './campaign-dialog.component.html',
  styleUrl: './campaign-dialog.component.scss'
})
export class CampaignDialogComponent {
  campaigns: Campagne[] = [];
  selectedCampaign: Campagne;

  constructor(
    public dialogRef: MatDialogRef<CampaignDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private http: HttpClient
  ) {
    this.http.get<Campagne[]>(`${environment.apiUrl}/Campagnes.php`, {params: {mode: 'SEL'}}).subscribe(data => {
      this.campaigns = data.sort((a, b) => a.campagne < b.campagne ? -1 : 1);
    });
  }

  isOver(campaign: Campagne): boolean {
    const today = new Date();
    const endDate = new Date(this.formateDate(campaign.datefin));
    return endDate.toString() === 'Invalid Date' || endDate < today;
  }

  formateDate(date: any): any {
    let parts = date.split('/');
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  }

  onNoClick(): void {
    this.dialogRef.close();
  }
}
