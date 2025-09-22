import {
  Directive,
  Input,
  OnDestroy,
  ElementRef,
  Renderer2,
  SimpleChanges,
  OnChanges,
  HostListener
} from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Directive({
  selector: '[appAddClassOnChange]'
})
export class AddClassOnChangeDirective implements OnChanges, OnDestroy {
  @Input('appAddClassOnChange') className: string;
  @Input() listenTo: any = null;

  constructor(private el: ElementRef, private renderer: Renderer2) {
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.listenTo) {
      if (changes['listenTo']) {
        this.addClass(this.className);
      }
    } else {
      this.addClass(this.className);
    }
  }

  addClass(className: string) {
    this.renderer.removeClass(this.el.nativeElement, this.className);
    setTimeout(() => {
      this.renderer.addClass(this.el.nativeElement, this.className);
    }, 10);
  }

  ngOnDestroy(): void {}
}
