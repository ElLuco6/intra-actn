import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewSpinnerComponent } from './new-spinner.component';

describe('NewSpinnerComponent', () => {
  let component: NewSpinnerComponent;
  let fixture: ComponentFixture<NewSpinnerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NewSpinnerComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewSpinnerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
