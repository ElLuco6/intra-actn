import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SuiviRetourComponent } from './suivi-retour.component';

describe('SuiviRetourComponent', () => {
  let component: SuiviRetourComponent;
  let fixture: ComponentFixture<SuiviRetourComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SuiviRetourComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SuiviRetourComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
