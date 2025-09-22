import {AfterViewInit, Component, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {AuthenticationService} from "@services/authentication.service";
import {AdresseService} from "@services/adresse.service";
import {Observable, of} from "rxjs";
import {Adresse} from "@/models";
import {DialogService} from "@services/dialog.service";

@Component({
  selector: 'app-adresse',
  templateUrl: './adresse.component.html',
  styleUrls: ['./adresse.component.scss']
})
export class AdresseComponent {
  addrData: Observable<Adresse[]>;
  @ViewChild('defaultDialog') defaultDialog: TemplateRef<any>;
  @ViewChild('removeDefaultDialog') removeDefaultDialog: TemplateRef<any>;
  @ViewChild('deleteDialog') deleteDialog: TemplateRef<any>;

  constructor(
    public authService: AuthenticationService,
    public adresseService: AdresseService,
    private dialogService: DialogService
  ) {
    this.adresseService.adressesList$.subscribe((data) => {
      this.addrData = of(data);
    });
  }

  defaultAddr(data) {
    this.dialogService.openDialog('Adresse par défaut', this.defaultDialog, { someData: data }, () => {
      this.adresseService.changeDefaultAddress(data, true);
    });
  }

  removeDefaultAddr(data) {
    this.dialogService.openDialog('Adresse par défaut', this.removeDefaultDialog, { someData: data }, () => {
      this.adresseService.changeDefaultAddress(data, false);
    });
  }

  deleteAddr(data) {
    this.dialogService.openDialog('Supprimer l\'adresse', this.deleteDialog, { someData: data }, () => {
      this.adresseService.deleteAddress(data.codeadresse)
    });
  }

}
