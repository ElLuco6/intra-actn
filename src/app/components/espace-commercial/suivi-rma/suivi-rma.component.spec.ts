import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SuiviRmaComponent } from './suivi-rma.component';

describe('SuiviRmaComponent', () => {
  let component: SuiviRmaComponent;
  let fixture: ComponentFixture<SuiviRmaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SuiviRmaComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SuiviRmaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
