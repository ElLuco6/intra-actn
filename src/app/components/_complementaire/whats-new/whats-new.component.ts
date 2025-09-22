import { Component, OnInit } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {environment} from "@env/environment";
import {DomSanitizer, SafeHtml} from "@angular/platform-browser";

@Component({
  selector: 'app-whats-new',
  templateUrl: './whats-new.component.html',
  styleUrls: ['./whats-new.component.scss']
})
export class WhatsNewComponent implements OnInit {

  constructor(
    private http: HttpClient,
    private sanitizer: DomSanitizer
  ) { }

  listFile: Array<any> = [];
  htmlInit: SafeHtml = null;
  listHtmlInit: Array<any> = [];
  ngOnInit(): void {
    this.http.get(`${environment.apiUrl}/whatsNew.php`).subscribe(
      (data: Array<any>) => {
        this.listFile = data;
        this.listFile.forEach((e) => {
          this.http.get(`${environment.apiUrl}/news/` + e, {responseType: 'text'}).subscribe(
            (data) => {
              this.htmlInit = this.sanitizer.bypassSecurityTrustHtml(data);
              this.listHtmlInit.push(this.htmlInit);
            }
          );
        });
      }
    );

  }

}
