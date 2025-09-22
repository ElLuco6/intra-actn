import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SuiviActiviteComponent } from './suivi-activite.component';

describe('SuiviActiviteComponent', () => {
  let component: SuiviActiviteComponent;
  let fixture: ComponentFixture<SuiviActiviteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SuiviActiviteComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SuiviActiviteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
