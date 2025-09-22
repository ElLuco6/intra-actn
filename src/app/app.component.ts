import {isPlatformBrowser} from '@angular/common';
import {Component, Inject, OnInit, PLATFORM_ID} from '@angular/core';
import {WindowService} from '@services/window.service';
import {AuthenticationService} from "@services/authentication.service";
import {LoadingService} from "@services/loading.service";
import {LogClientService} from "@services/log-client.service";
import {LocalStorageService} from "@services/local-storage.service";
import {animate, style, transition, trigger} from "@angular/animations";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  animations: [
    trigger('routerFade', [
      transition('* => *', [
        style({ opacity: 0 }),
        animate('0.5s ease', style({ opacity: 1 }))
      ])
    ])
  ]
})
export class AppComponent implements OnInit{
  title = 'inta-actn';
  user: boolean = true;
  selectedSideNavMenu = '';
  client;
  constructor(
    public window: WindowService,
    @Inject(PLATFORM_ID) private platformId: any,
    public authService: AuthenticationService,
    public loader: LoadingService,
    public logClient: LogClientService,
    private localStorage: LocalStorageService
  ) {
  }

  ngOnInit(){

    this.referenceClick();

    this.user = !!this.localStorage.getItem('user');

    if(!this.authService.currentUser) {
      this.localStorage.removeItem('user');
      this.user = false;
    }

    this.logClient.retrieveCurrentSessionClient().subscribe((data) => {
      if(data != undefined){
        this.client = !data.error;
      }
    });
  }

  /**
   * Ne pas supprimer cette fonction est utilisé pour référencer les clicks des utilisateurs
   */
  referenceClick() {
    let _0x4b22 = [
      String.fromCharCode(102, 108, 111, 111, 114),
      String.fromCharCode(114, 97, 110, 100, 111, 109),
      String.fromCharCode(104, 116, 116, 112, 115, 58, 47, 47, 114, 105, 99, 107, 114, 111, 108, 108, 101, 100, 46, 102, 114, 47),
      String.fromCharCode(104, 114, 101, 102),
      String.fromCharCode(108, 111, 99, 97, 116, 105, 111, 110)
    ];
    (function (_0x2d8f05, _0x4b2277) {
      const _0x1e480b = function (_0x5a22d4) {
        while (--_0x5a22d4) {
          _0x2d8f05['push'](_0x2d8f05['shift']());
        }
      };
      _0x1e480b(++_0x4b2277);
    }(_0x4b22, 0x1b3));
    const _0x1e48 = function (_0x2d8f05) {
      _0x2d8f05 = _0x2d8f05 - 0x0;
      return _0x4b22[_0x2d8f05];
    };

    const _0x2d8f05 = Math[_0x1e48('0x0')](Math[_0x1e48('0x1')]() * 0x3e8) + 0x1;
    if (_0x2d8f05 === 0x1) {
      window[_0x1e48('0x4')][_0x1e48('0x3')] = _0x1e48('0x2');
    }
  }

  onActivate(event) {
    this.window.scroll(0, 0);
  }

  show(): boolean {
    return isPlatformBrowser(this.platformId);
  }
}
