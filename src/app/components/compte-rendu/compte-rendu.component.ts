import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {faPaperPlane} from "@fortawesome/free-solid-svg-icons";
import {FormBuilder, FormControl, Validators} from "@angular/forms";
import {CompteRenduVisite} from "@models/compteRenduVisite";
import {VisiteService} from "@services/visite.service";
import {Contact} from "@models/contact";
import {MotifCompteRendu} from "@components/client-detail/client-detail.component";
import {Client} from "@/models";
import {Prospect} from "@models/prospect";
import {forkJoin, map, Observable, startWith} from "rxjs";

@Component({
  selector: 'app-compte-rendu',
  templateUrl: './compte-rendu.component.html',
  styleUrl: './compte-rendu.component.scss'
})
export class CompteRenduComponent implements OnInit {

  maxDate: Date;
  @Input() isClient: boolean;
  @Input() idIdentity: number;
  @Input() client?: Client;
  @Input() prospect?: Prospect;
  supprPopUp: boolean = false;
  addPopUp: boolean = false;
  editPopUp: boolean = false;
  mailPopUp: boolean = false;
  contactsList: Array<Contact> = []
  motifsList: Array<MotifCompteRendu> = []
  reportsList: Array<CompteRenduVisite> = [];
  @Output() reportsListFilled: EventEmitter<boolean> = new EventEmitter<boolean>();
  visiteForm = this.fb.group({
    date: '',
    action: ['', [Validators.required]],
    commentaire: ['', [Validators.required]],
    contact: [['']]
  });

  toRegion = new FormControl(true);

  mailForm = this.fb.group({
    compteRendu: '',
    to: '',
    toRegion: this.toRegion,
    cc: '',
    date: '',
    contact: '',
    action: ''
  })

  emailOptions: string[] = [];
  filteredEmailOptions: Observable<string[]>;
  filteredCopyOptions: Observable<string[]>;

  constructor(
    private visite: VisiteService,
    private fb: FormBuilder
  ) {

  }

  ngOnInit() {
    this.maxDate = new Date();

    let getVisites$ = this.visite.getVisites(this.isClient, this.idIdentity);
    let getContacts$ = this.visite.getContacts(this.idIdentity);
    let getMotifs$ = this.visite.getMotifs();

    forkJoin([getVisites$, getContacts$, getMotifs$]).subscribe(
      ([visites, contacts, motifs]) => {
        this.reportsList = this.visite.convertDate(visites);
        this.motifsList = motifs;
        this.contactsList = contacts;
      }
    );
    this.checkReportsList();

    if (this.client) {
      if (this.client.commercialMail) this.emailOptions.push(this.client.commercialMail);
    }

    const entite: Client | Prospect = this.isClient ? this.client : this.prospect;
    if (entite.commercialMail1) this.emailOptions.push(entite.commercialMail1);
    if (entite.commercialMail2) this.emailOptions.push(entite.commercialMail2);



    this.filteredEmailOptions = this.mailForm.controls.to.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value || '')),
    );

    this.filteredCopyOptions = this.mailForm.controls.cc.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value || '')),
    );
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.emailOptions.filter(option => option.toLowerCase().includes(filterValue));
  }

  checkReportsList() {
    setTimeout(() => {
      const isFilled = this.reportsList.length > 0;
      this.reportsListFilled.emit(isFilled);
    },1000)
  }

  openPopUp(type: string, report?: CompteRenduVisite){
    switch (type) {
      case 'add':
        this.visiteForm.setValue({
          date: '',
          action: '',
          commentaire: '',
          contact: ['']
        })
        this.addPopUp = true;
        break;
      case 'edit':
        this.editPopUp = true;
        break;
      case 'suppr':
        this.supprPopUp = true;
        break;
      case 'mail':
        this.mailForm.get('compteRendu').setValue(report.texte);
        this.mailForm.get('date').setValue(report.date);
        this.mailForm.get('action').setValue(report.action);
        this.mailForm.get('contact').setValue(report.contactnom);
        this.mailPopUp = true;
        break;
    }
    if(type != 'add'){
      this.visiteForm.setValue({
        date: report.date,
        action: report.action,
        commentaire: report.texte,
        contact: Array.isArray(report.contactmail) ? report.contactmail : [report.contactmail],
      });
    }
  }

  addCompteRendu(){
    this.visite.addCompteRendu(this.visiteForm, this.idIdentity, this.contactsList).subscribe(
      () => {
        this.visite.getVisites(this.isClient, this.idIdentity).subscribe(
          (reports) => {
            this.reportsList = this.visite.convertDate(reports);
            const isFilled = this.reportsList.length > 0;
            this.reportsListFilled.emit(isFilled);
            this.addPopUp = false;
          });
      }
    )
  }

  editCompteRendu(){
    this.visite.editCompteRendu(this.idIdentity, this.visiteForm).subscribe(
      () => {
        this.visite.getVisites(this.isClient, this.idIdentity).subscribe(
          (reports) => {
            this.reportsList = this.visite.convertDate(reports);
            this.editPopUp = false;
          });
      }
    )
  }

  supprCompteRendu(){
    this.visite.deleteCompteRendu(this.idIdentity, this.visiteForm.value.action, this.visiteForm.value.date).subscribe(
      () => {
        this.visite.getVisites(this.isClient, this.idIdentity).subscribe(
          (reports) => {
            this.reportsList = this.visite.convertDate(reports);
            const isFilled = this.reportsList.length > 0;
            this.reportsListFilled.emit(isFilled);
            this.supprPopUp = false;
          });
      }
    )
  }


  envoyerMail(){
    this.visite.sendMail(this.toRegion.value, this.mailForm, this.client, this.prospect).subscribe(
      () => {
        this.mailPopUp = false;
      }
    )
  }

  protected readonly faPaperPlane = faPaperPlane;
}
