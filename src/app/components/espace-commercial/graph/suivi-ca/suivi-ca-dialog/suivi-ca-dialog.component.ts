import { Component, inject, OnInit } from "@angular/core";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";

@Component({
    selector: 'suivi-global-dialog',
    templateUrl: './suivi-ca-dialog.component.html',
    styleUrl: './suivi-ca-dialog.component.scss'
})
export class SuiviCADialogComponent implements OnInit {
    data = inject(MAT_DIALOG_DATA);
    infosClient = this.data.infosClient;
    transactionsClient = this.data.transactionsClient;

    tableData: { marque: string, caDuMois: number[], total: number }[][] = [];

    listeMois = [
        'Janvier',
        'Février',
        'Mars',
        'Avril',
        'Mai',
        'Juin',
        'Juillet',
        'Août',
        'Septembre',
        'Octobre',
        'Novembre',
        'Décembre'];

    displayedColumns: string[] = [
        'marque',
        'Janvier',
        'Février',
        'Mars',
        'Avril',
        'Mai',
        'Juin',
        'Juillet',
        'Août',
        'Septembre',
        'Octobre',
        'Novembre',
        'Décembre',
        'total'];

    ngOnInit(): void {
        this.fillTableData();
    }

    fillTableData() {
        for (let i = 0; i < this.transactionsClient.length; i++) {
            if (this.transactionsClient[i]) {
                this.transactionsClient[i].forEach((transaction) => {
                    if (!this.tableData[i]) {
                        this.tableData[i] = [];
                    }
                    const marqueExistante = this.tableData[i].some(item => item.marque === transaction.marque);

                    if (!marqueExistante) {
                        const nouvelleLigne = { marque: transaction.marque, caDuMois: Array(12).fill(0), total: 0 };
                        nouvelleLigne.caDuMois[transaction.mois - 1] += transaction.ca;
                        nouvelleLigne.total += transaction.ca;

                        this.tableData[i].push(nouvelleLigne);
                    } else {
                        const ligneExistante = this.tableData[i].find(item => item.marque === transaction.marque);
                        ligneExistante.caDuMois[transaction.mois - 1] += transaction.ca;
                        ligneExistante.total += transaction.ca;
                    }
                });
                this.tableData[i] = this.tableData[i]?.sort((a, b) => {
                    return a.marque.localeCompare(b.marque);
                });
            }
        }
    }
}
