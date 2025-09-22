import {Component, Input, OnInit} from '@angular/core';
import { Clipboard } from '@angular/cdk/clipboard';
import {faFacebookSquare, faTwitterSquare} from "@fortawesome/free-brands-svg-icons";
import {faClipboard, faEnvelope} from "@fortawesome/free-solid-svg-icons";
import { environment } from '@env/environment';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-share',
  templateUrl: './share.component.html',
  styleUrls: ['./share.component.scss']
})
export class ShareComponent implements OnInit {

  @Input() title = 'Partager';
  @Input() textToClipboard = '';
  @Input() reseaux: boolean = false;
  /* Input qui servent a envoyer le mail*/
  @Input() refClient = ""
  @Input() nFacture = ""

  get encodedTextToClipboard(): string {
    return this.fixedEncodeURI(this.textToClipboard);
  }

  showPopup = false;
  emailLink=''
  constructor(private clipboard: Clipboard, public http: HttpClient) {
  }

  ngOnInit(): void {
    this.textToClipboard = this.textToClipboard.replace('https://intra.actn.fr/', 'https://www.actn.fr/');
    this.emailLink = encodeURIComponent(this.encodedTextToClipboard)
  }

  public copyToClipboard(): void {
    const success = this.clipboard.copy(this.encodedTextToClipboard);
    if (!success) {
      const pending = this.clipboard.beginCopy(this.encodedTextToClipboard);
      let remainingAttempts = 3;
      const attempt = () => {
        const result = pending.copy();
        if (!result && --remainingAttempts) {
          setTimeout(attempt);
        } else {
          pending.destroy();
        }
      };
      attempt();
    }
  }

  openMailbox(): void {
    this.http.get<any>(`${environment.apiUrl}/shareByMail.php`,{
      params: {
        link: this.emailLink,
        refClient: this.refClient,
        nFacture: this.nFacture
      }

    }).subscribe((res) => {
      setTimeout(() => {
        window.location.href = res.mailto_link;
      }, 0);
    })
  }

  private fixedEncodeURI(str: string): string {

    return encodeURI(decodeURI(str)).replace(/[!'()*]/g, (c) => {
      return '%' + c.charCodeAt(0).toString(16);
    });
  }

  public twitterURI(str: string): string {
    return str.replace(/[#]/g, (c) => {
      return '%' + c.charCodeAt(0).toString(16);
    });
  }

  protected readonly faFacebookSquare = faFacebookSquare;
  protected readonly faTwitterSquare = faTwitterSquare;
  protected readonly faEnvelope = faEnvelope;
  protected readonly faClipboard = faClipboard;
}
