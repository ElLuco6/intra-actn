import {AfterViewInit, Component, NgZone, OnDestroy, OnInit} from '@angular/core';
import {WindowService} from "../../../services/window.service";
import {fromEvent, Subject, takeUntil} from "rxjs";
import {debounceTime} from "rxjs/operators";
import { faChevronUp } from '@fortawesome/free-solid-svg-icons';


@Component({
  selector: 'app-back-to-top',
  templateUrl: './back-to-top.component.html',
  styleUrls: ['./back-to-top.component.scss']
})
export class BackToTopComponent implements OnDestroy, AfterViewInit {
  faChevronUp = faChevronUp;
  timeToTop = 600;
  toStop = false;
  windowScrolled = false;

  private _destroy$ = new Subject<void>();

  constructor(
    private window: WindowService,
    private ngZone: NgZone
  ) { }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  ngAfterViewInit(): void {
    this.ngZone.runOutsideAngular(() => {
      fromEvent(this.window.document, 'scroll')
        .pipe(
          debounceTime(20),
          takeUntil(this._destroy$))
        .subscribe(e => {
          if (!this.windowScrolled && this.window.pageYOffset > 100) {
            this.ngZone.run(() => this.windowScrolled = true);
          } else if (this.windowScrolled && this.window.pageYOffset < 10) {
            this.ngZone.run(() => this.windowScrolled = false);
          }
        });
    });
  }

  scrollToTop() {
    const start = Date.now();
    const animation = setInterval(() => {
      const timePassed = Date.now() - start;
      if (timePassed >= this.timeToTop) {
        window.scrollTo(0, 0);
        clearInterval(animation);
      } else {
        let currentScroll = window.scrollY;
        window.scrollTo(0, currentScroll - (currentScroll * (timePassed / this.timeToTop)));
      }
    }, 16.6);
  }
}
