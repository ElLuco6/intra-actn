import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog, MatDialogActions, MatDialogClose, MatDialogContent} from "@angular/material/dialog";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MatButton} from "@angular/material/button";
import {UserService} from "@services/user.service";
import {MatChipListbox, MatChipOption} from "@angular/material/chips";
import {MatTooltip} from "@angular/material/tooltip";
import {
  EditContactComponent
} from "@components/espace-commercial/campagnes/phoning/edit-contact/edit-contact.component";

@Component({
  selector: 'app-mail-de-relance',
  standalone: true,
  imports: [
    MatDialogContent,
    ReactiveFormsModule,
    MatDialogActions,
    MatButton,
    MatDialogClose,
    MatChipListbox,
    MatChipOption,
    MatTooltip,
    FormsModule
  ],
  templateUrl: './mail-de-relance.component.html',
  styleUrl: './mail-de-relance.component.scss'
})
export class MailDeRelanceComponent implements OnInit {

  contactsDest: any[];
  contactsCC: any[];

  destinataire: string = '';
  copiesCarbone: string[] = [];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialog: MatDialog,
    private userService: UserService) {
  }

  ngOnInit() {
    this.userService.getContact(this.data.numClient).subscribe((contacts) => {
      this.contactsDest = contacts;
      this.contactsCC = contacts;
    });
  }

  openAddContactPopup() {
    const dialogRef = this.dialog.open(EditContactComponent, {
      minWidth: '1000px',
      data: {
        idClient: this.data.numClient,
        isProspect: false,
        idCampagne: null,
        mode: 'add',
        oldContact: null
      }
    });

    dialogRef.afterClosed().subscribe(() => {
      this.ngOnInit();
    });
  }

  updatePossibleCC($event: any) {
    this.contactsCC = this.contactsDest;
    if ($event !== undefined) {
      this.contactsCC = this.contactsCC.filter(contact => contact.mail !== $event);
    }
  }
}
