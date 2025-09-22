import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DevisConfirmationComponent } from './devis-confirmation.component';

describe('DevisConfirmationComponent', () => {
  let component: DevisConfirmationComponent;
  let fixture: ComponentFixture<DevisConfirmationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DevisConfirmationComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DevisConfirmationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
