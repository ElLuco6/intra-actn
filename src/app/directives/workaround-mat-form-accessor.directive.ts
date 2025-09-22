import {Directive, ElementRef, HostBinding, Inject, Input} from '@angular/core';
import {MatFormFieldControl} from "@angular/material/form-field";
import {NgControl, Validators} from "@angular/forms";
import {Subject, Subscription} from "rxjs";
import {coerceBooleanProperty} from "@angular/cdk/coercion";

@Directive({
  selector: '[workaroundMatFormAccessor]',
  providers: [
    {
      provide: MatFormFieldControl,
      useExisting: WorkaroundMatFormAccessorDirective,
    }
  ]
})
export class WorkaroundMatFormAccessorDirective implements MatFormFieldControl<boolean>{

  constructor(
    public elRef: ElementRef,
    @Inject(NgControl) public ngControl: NgControl
  ) {   }

  private stateChangeSubscription: Subscription;

  set value(value: boolean | null) {
    this.ngControl.control.setValue(value);
    this.stateChanges.next();
  }

  get value(): boolean | null {
    return this.ngControl.control.value;
  }
  stateChanges = new Subject<void>();
  static nextId = 0;
  @HostBinding()
  id = `workaround-mat-form-field-noop-${WorkaroundMatFormAccessorDirective.nextId++}`;

  set placeholder(str: string){
    throw "Not implemented"
  };
  get focused(): boolean{
    return this.elRef.nativeElement.classList.contains("cdk-keyboard-focused")
  }
  empty: boolean = false;
  shouldLabelFloat: boolean = true;
  get required(): boolean{
    return this.ngControl.control.hasValidator(Validators.required);
  }
  get disabled(): boolean { return this.ngControl.disabled }
  set disabled(value: boolean) {
    if(coerceBooleanProperty(value)){
      this.ngControl.control.enable();
    }else{
      this.ngControl.control.disable();
    }
  }
  get errorState(): boolean{
    return this.ngControl.invalid
  };
  controlType: string = "workaround-mat-form-field-noop";
  autofilled: boolean = false;
  @Input('aria-describedby') userAriaDescribedBy: string;
  setDescribedByIds(ids: string[]) {
    // const controlElement = this._elementRef.nativeElement
    //   .querySelector('.example-tel-input-container')!;
    // controlElement.setAttribute('aria-describedby', ids.join(' '));
  }
  onContainerClick(event: MouseEvent) {
    if ((event.target as Element).tagName.toLowerCase() != 'input') {
      // Material Input Compoents mostly have a focus() Method
      // https://material.angular.io/components/slide-toggle/api
      (this.elRef.nativeElement as any).focus();
      this.elRef.nativeElement.classList.add("cdk-keyboard-focused")
    }
  }

  ngOnInit(){
    this.stateChangeSubscription = this.ngControl.valueChanges.subscribe(changed => {
      this.stateChanges.next();
    })
  }
  ngOnDestroy() {
    this.stateChanges.complete();
    this.stateChangeSubscription.unsubscribe()
  }
}
