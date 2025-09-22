import { Component, OnInit } from '@angular/core';
import { environment } from "@env/environment";

@Component({
  selector: 'app-incidents-cards',
  templateUrl: './incidents-cards.component.html',
  styleUrls: ['./incidents-cards.component.scss']
})
export class IncidentsCardsComponent implements OnInit {
  nbClientBloque: number = 0;
  nbCdeBloquee: number = 0;
  nbRmaBloque: number = 0;
  nbCdeRupture: number = 0;
  filtreRegion: string = 'O';
  checked = true;
  isAllLoaded: boolean = false;

  ngOnInit(): void {
    this.loadData(this.filtreRegion);
  }

  isChecked(): void {
    this.checked = !this.checked;
    this.filtreRegion = this.checked ? 'O' : 'N';
    this.loadData(this.filtreRegion);
  }

  async loadData(filtreRegion: string): Promise<void> {
    try {
      const [clientsBloques, cdeBloquee, rma, cdeRupture] = await Promise.all([
        this.getClientsBloques(filtreRegion),
        this.getCdeBloquee(filtreRegion),
        this.getRma(filtreRegion),
        this.getCdeRupture(filtreRegion)
      ]);

      this.nbClientBloque = clientsBloques;
      this.nbCdeBloquee = cdeBloquee;
      this.nbRmaBloque = rma;
      this.nbCdeRupture = cdeRupture;
      this.isAllLoaded = true;
    } catch (error) {
      console.error(error);
    }
  }

  async getClientsBloques(filtreRegion: string): Promise<any> {
    const data = await fetch(`${environment.apiUrl}/ListeclientsBloques.php?fitreregion=${filtreRegion}&compteur=O`);
    return (await data.json()) ?? [];
  }

  async getCdeBloquee(filtreRegion: string): Promise<any> {
    const data = await fetch(`${environment.apiUrl}/ListeCdeBloquees.php?fitreregion=${filtreRegion}&compteur=O`);
    return (await data.json()) ?? [];
  }

  async getRma(filtreRegion: string): Promise<any> {
    const data = await fetch(`${environment.apiUrl}/ListeRMA.php?fitreregion=${filtreRegion}&compteur=O`);
    return (await data.json()) ?? [];
  }

  async getCdeRupture(filtreRegion: string): Promise<any> {
    const data = await fetch(`${environment.apiUrl}/testReliquats.php?region=${filtreRegion}`, {
      credentials: 'include'
    });
    return (await data.json()) ?? [];
  }
}
