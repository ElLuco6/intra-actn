import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';
import {faCalendarAlt, faNewspaper} from "@fortawesome/free-solid-svg-icons";

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit {

  environment = environment;
  urlAP: string;

  // urlLogicielAssistance: string = "https://my.splashtop.eu/sos/packages/download/JKAXYXX73YTKEU";
  urlLogicielAssistanceWIN: string = environment.backend+"SupportACTN.exe";
  urlLogicielAssistanceMOS: string = environment.backend+"SupportACTN.dmg";

  constructor(
    //public cookieService: CookieService
  ) { }

  ngOnInit() {
   // this.urlAP = `${environment.pdfUrl}/apropos_ACTN.pdf`;
  }

  protected readonly faNewspaper = faNewspaper;
  protected readonly faCalendarAlt = faCalendarAlt;
}
