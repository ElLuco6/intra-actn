import {Directive, ElementRef, Input, Renderer2} from '@angular/core';

@Directive({
  selector: '[appHighlight]',
  standalone: true
})
export class HighlightDirective {
  @Input() appHighlight: string;
  @Input() searchText: string;

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  ngOnChanges() {
    if (!this.searchText) {
      this.renderer.setProperty(this.el.nativeElement, 'innerHTML', this.appHighlight);
      return;
    }

    const regex = new RegExp(`(${this.searchText})`, 'gi');
    const newText = this.appHighlight.replace(regex, '<b>$1</b>');
    this.renderer.setProperty(this.el.nativeElement, 'innerHTML', newText);
  }
}
