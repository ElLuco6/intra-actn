import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

@Component({
  selector: 'app-input-number',
  templateUrl: './input-number.component.html',
  styleUrls: ['./input-number.component.scss']
})
export class InputNumberComponent implements OnInit {

  @Input()
  get number(): number {
    return this._number;
  }
  set number(value: number) {
    if (value.toString() !== '-') {
      if (value > this.max) {
        this._number = +this.max;
      } else if (value < this.min) {
        this._number = +this.min;
      } else {
        this._number = +value;
      }
      this.value.emit(this._number);
    }
  }

  @Input()
  get min(): number {
    return this._min;
  }
  set min(value: number) {
    this._min = value;
    if (this._number < value) {
      this._number = value;
    }
  }
  @Input()
  get max(): number {
    return this._max;
  }
  set max(value: number) {
    this._max = value;
    if (this._number > value) {
      this._number = value;
    }
  }

  @Input() wrongValue = false;
  @Input() isDisabled = false;
  @Input() size: 'small' | 'medium' = 'medium';

  protected _number = 1;
  protected _min = 0;
  protected _max = Number.MAX_SAFE_INTEGER;

  @Output() value = new EventEmitter<number>();

  constructor() { }

  ngOnInit(): void { }

  /**
   * Augmente la quantité de 1.
   */
  ajouter(): void {
    this.number++;
  }

  /**
   * Réduit la quantité de 1.
   */
  reduire(): void {
    this.number--;
  }

  /**
   * Met à jour la quantité quand le champ est modifié manuellement.
   */
  onChange(event: number) {
    this.number = event;
  }
}
