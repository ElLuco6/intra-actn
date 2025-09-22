import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmationPanierComponent } from './confirmation-panier.component';

describe('ConfirmationPanierComponent', () => {
  let component: ConfirmationPanierComponent;
  let fixture: ComponentFixture<ConfirmationPanierComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConfirmationPanierComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConfirmationPanierComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
