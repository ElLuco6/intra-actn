import {Component, OnInit, ViewChild} from '@angular/core';
import {FinanceService} from "@services/finance.service";
import {ActivatedRoute} from "@angular/router";
import {FormControl, FormGroup} from "@angular/forms";
import {animate, state, style, transition, trigger} from "@angular/animations";
import {MatSort} from "@angular/material/sort";
import {faFilePdf, faPaperPlane} from "@fortawesome/free-solid-svg-icons";
import {HttpClient} from "@angular/common/http";
import {environment} from "@env/environment";
import {Finance} from "@models/finance";
import {MailDeRelanceComponent} from "@components/finance/mail-de-relance/mail-de-relance.component";
import {MatDialog} from "@angular/material/dialog";
import {AuthenticationService} from "@services/authentication.service";
import {SelectionModel} from "@angular/cdk/collections";

@Component({
  selector: 'app-finance',
  templateUrl: './finance.component.html',
  styleUrls: ['./finance.component.scss'],
  animations: [
    /**
     * Animation sur la hauteur de l'élément, alterne entre 0 et sa hauteur par défaut.
     * ! Ajouter directement overflow: hidden sur l'élément concerné si besoin de masquer son contenu.
     * L'ajout de cet attribut par l'animation ne fonctionne pas sur Safari !
     */
    trigger('expandVertical', [
      state(
        'open',
        style({
          height: '*'
        })
      ),
      state(
        'closed',
        style({
          height: '0'
        })
      ),
      transition('open => closed', animate('300ms ease-in-out')),
      transition('closed => open', animate('300ms ease-in-out'))
    ])
  ]
})
export class FinanceComponent {

  constructor(
    public _financeService: FinanceService,
    public _activatedRoute: ActivatedRoute,
    private http: HttpClient,
    private dialog: MatDialog,
    private authService: AuthenticationService
  ) {
    _financeService.getListOfFinance(_activatedRoute.snapshot.params['client']);
  }

  @ViewChild(MatSort) sort: MatSort;
  selection = new SelectionModel<Finance>(true, []);

  columnsEchus: string[] = ['nfacture', 'refclient', 'date', 'echeance', 'libelle', 'montant'];
  columnsFactureNonReglee: string[] = ['select', 'nfacture', 'refclient', 'date', 'echeance', 'libelle', 'montant'];

  collapsedIdsArray: string[] = [];

  campaignOne = new FormGroup({
    start: new FormControl(''),
    end: new FormControl(''),
  });

  campaignTwo = new FormGroup({
    start: new FormControl(''),
    end: new FormControl(''),
  });

  nFactureFiltre = new FormControl('');
  refClientFiltre = new FormControl('');

  /**
   * Ouvre ou ferme un élément.
   * @param event L'élément DOM déclencheur
   * @param id L'identifiant de l'élément
   */
  toggleCollapseDivById(event, id: string): void {
    // On vérifie que l'on a pas à faire à un sous-évenement pour ne pas déclencher plusieurs fois le handler.
    if (!event.srcEvent) {
      if (this.collapsedIdsArray.includes(id)) {
        this.collapsedIdsArray.splice(this.collapsedIdsArray.indexOf(id), 1); // retirer l'id de collapsedIdsArray
      } else {
        this.collapsedIdsArray.push(id);
      }
    }
  }

  filtrer(event, type, champ) {
    this._financeService.applyFilter(event, type, champ);
    this.reOpenDiv();
  }

  reOpenDiv() {
    this.collapsedIdsArray = [];
  }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this._financeService.getNbResultEchus();
    return numSelected === numRows;
  }

  toggleAllRows() {
    if (this.isAllSelected()) {
      this.selection.clear();
      return;
    }

    this.selection.select(...this._financeService.filteredAlertItems.value);
  }

  checkboxLabel(row?: Finance): string {
    if (!row) {
      return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} ${row.nfacture}`;
  }

  openConfirmationPopup() {
    const currentUser: any = this.authService.currentUser;
    const dialogRef = this.dialog.open(MailDeRelanceComponent, {
      minWidth: '620px',
      data: {
        numClient: this._activatedRoute.snapshot.params['client']
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const liensFactures: string[] = [];
        const numClient = this._activatedRoute.snapshot.params['client'];
        const urlFactures = `${environment.apiUrlActn}/document/generate_intra.php?document=FACTURE/${numClient}/`;

        this.selection.selected.forEach(facture => {
          liensFactures.push(urlFactures + facture.nfacture);
        })

        const payload = {
          params: {
            from: currentUser.mail,
            dest: result.destinataire,
            cc: result.copiesCarbone,
            liensFactures: liensFactures
          }
        };

        this.http.post(`${environment.apiUrl}/mailRelance.php`, payload, {
          withCredentials: true,
          responseType: 'text'
        }).subscribe();
      }
    });
  }

  protected readonly faFilePdf = faFilePdf;
  protected readonly faPaperPlane = faPaperPlane;
  protected readonly environment = environment;
}
