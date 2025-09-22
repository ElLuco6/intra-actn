import { Component, OnInit, Input, Pipe, PipeTransform } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { take } from 'rxjs/operators';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { CookieService } from "@services/cookie.service";
import { WindowService } from "@services/window.service";

@Component({
  selector: 'app-youtube',
  templateUrl: './youtube.component.html',
  styleUrls: ['./youtube.component.scss']
})
export class YoutubeComponent implements OnInit {

  private _links = new Array<Link>();
  private _ids$ = new Subject<Array<Link>>();
  public ids$: Observable<Array<Link>>;

  get youtube(): boolean {
    return this.cookieService.youtube;
  }
  set youtube(value: boolean) {
    this.cookieService.youtube = value;
  }
  get gotowebinar(): boolean {
    return this.cookieService.gotowebinar;
  }
  set gotowebinar(value: boolean) {
    this.cookieService.gotowebinar = value;
  }

  @Input()
  set links(links: Array<string>) {
    this._links = [];
    links.forEach(link => {
      const regex = /(?:\/|%3D|v=|vi=)([0-9A-z-_]{11})(?:[%#?&]|$)/g;
      const youtubeLink = regex.exec(link)?.[1];
      if (youtubeLink != null) {
        this._links.push({ link: youtubeLink, type: 'YT' });
      } else if (link.startsWith('http')) {
        this._links.push({ link: link, type: 'IFRAME' });
      } else if (!link.startsWith(" ")){
        this._links.push({ link: link, type: 'TITLE' });
      }
    });
    this._ids$.next(this._links);
  }

  constructor(
    private window: WindowService,
    private cookieService: CookieService
  ) { }

  ngOnInit(): void {
    this.ids$ = this._ids$.asObservable().pipe(take(1));
  }

  youtubeLink(videoID: string): string {
    return (this.window.location.protocol
      + '//www.youtube.com/embed/'
      + videoID
      + '?enablejsapi=1&origin='
      + this.window.location.protocol
      + '//www.actn.fr');
  }

  acceptYoutube(): void {
    this.youtube = true;
    this.cookieService.set('cookie_consent_youtube', 'ACCEPT', 30);
  }

  acceptGoToWebinar(): void {
    this.gotowebinar = true;
    this.cookieService.set('cookie_consent_gotowebinar', 'ACCEPT', 30);
  }

}

interface Link {
  link: string;
  type: 'YT' | 'IFRAME' | 'TITLE';
}

@Pipe({ name: 'safe' })
export class SafePipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) { }
  transform(url: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
}
