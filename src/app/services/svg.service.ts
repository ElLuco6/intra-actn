import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { environment } from "../../environments/environment";
import { BehaviorSubject, Observable } from 'rxjs';
import { take } from 'rxjs/operators';

/**
 * Service chargé de charger des images SVG.
 *
 * @example
 * ```html
 * <ng-container *ngIf="svgService.getIcon('example') | async as exampleIcon">
 *     <svg [innerHTML]="exampleIcon" ></svg>
 * </ng-container>
 * ```
 */
@Injectable({
  providedIn: 'root'
})
export class SvgService {

  private _icons = new Map<string, BehaviorSubject<SafeHtml>>();
  private _iconsRepository = environment.production ? '/actn/assets/svg/' : '/assets/svg/';

  constructor(
    private http: HttpClient,
    private sanitize: DomSanitizer
  ) { }

  /**
   * Charge et renvoie un observable à injecter dans une balise SVG.
   * @param iconName 		 Le nom de l'icon
   * @param iconRepository Le dossier où se trouve l'icone
   * @returns 			 Un observable à injecter dans une balise SVG
   */
  public getIcon(iconName: string, iconRepository = this._iconsRepository): Observable<SafeHtml> {
    let icon = this._icons.get(iconName);
    if (icon) {
      return icon.asObservable();
    } else {
      icon = new BehaviorSubject(this.sanitize.bypassSecurityTrustHtml(''));
      this._icons.set(iconName, icon);
      const headers = new HttpHeaders();
      headers.set('Accept', 'image/svg+xml');
      this.http.get(
        iconRepository + iconName + '.svg',
        {
          headers,
          responseType: 'text',
        })
        .pipe(take(1))
        .subscribe(data => icon.next(this.sanitize.bypassSecurityTrustHtml(data)));
      return icon.asObservable();
    }
  }
}
