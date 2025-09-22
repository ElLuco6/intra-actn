import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import {BehaviorSubject, fromEvent, Observable, Subject} from "rxjs";
import {WindowService} from "../../../services/window.service";
import {debounceTime, takeUntil} from "rxjs/operators";
import {faChevronDown, faChevronUp} from "@fortawesome/free-solid-svg-icons";

@Component({
  selector: 'app-chips',
  templateUrl: './chips.component.html',
  styleUrls: ['./chips.component.scss']
})
export class ChipsComponent implements OnInit, OnDestroy, AfterViewInit {

  @Output() selectedValues = new EventEmitter<string[]>();

  @Input() title = '';

  private _selected = new Array<string>();

  @Input() set selected(values: Array<string>){
    this._selected = values;
  }

  get selected(): Array<string>{
    return this._selected;
  }

  private _values = new BehaviorSubject<Chips[]>([]);
  private _maxLines = 1;
  lastValue = -1;
  @ViewChild('container') private _container: ElementRef<HTMLElement>;

  @Input() set chips(values: Chips[]){
    this._values.next(values);
    setTimeout(() => {
      const elem = Array.from(this._container?.nativeElement.children ?? []);
      const x = elem.findIndex(element => element.getBoundingClientRect().top >
        this._container.nativeElement.getBoundingClientRect().top + 40 * this._maxLines)
      this.lastValue = x === -1 ? 1000 : x - 1
    });
  }

  get values$(): Observable<Chips[]>{
    return this._values.asObservable();
  }

  private _destroy$ = new Subject<void>();
  repli = true;

  constructor(
    private window: WindowService
  ) { }

  ngOnInit(): void {
    fromEvent(this.window.window, 'resize')
      .pipe(takeUntil(this._destroy$), debounceTime(20))
      .subscribe(() => {
        this.init();
      });
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  ngAfterViewInit(): void {
    this.init();
  }

  init(): void {
    const elements = Array.from(this._container?.nativeElement.children ?? []);
    const x = elements.findIndex(element => element.getBoundingClientRect().top > this._container.nativeElement.getBoundingClientRect().top + 40 * this._maxLines);
    setTimeout(() => {
      this.lastValue = x === -1 ? 1000 : x - 1;
      this.onClickMoins();
    });
  }

  onClickMoins(): void{
    if (this._container) {
      this._container.nativeElement.style.maxHeight = `${this._maxLines * 40}px`;
    }
    this.repli = true;
  }

  onClickPlus(): void {
    const elements = Array.from(this._container?.nativeElement.children);
    if (this._container) {
      const offset = this._container.nativeElement.getBoundingClientRect().right - elements[elements.length - 1].getBoundingClientRect().right < 60 ? 40 : 0;
      this._container.nativeElement.style.maxHeight = `${elements[elements.length - 1].getBoundingClientRect().top - this._container.nativeElement.getBoundingClientRect().top + 40 + offset}px`;
    }
    this.repli = false;
  }

  onClickChips(chips: Chips): void {
    if (chips.count !== 0 || (chips.count === 0 && this._selected.includes(chips.value))) {
      const elem = this._selected.findIndex(e => e === chips.value);
      if (elem === -1) {
        this._selected.push(chips.value);
      } else {
        this._selected.splice(elem, 1);
      }
      this.selectedValues.emit(this._selected);
    }
  }


  protected readonly faChevronDown = faChevronDown;
  protected readonly faChevronUp = faChevronUp;
}

export class Chips {
  value: string;
  libelle: string;
  count: number;
  tooltip: string;
}
