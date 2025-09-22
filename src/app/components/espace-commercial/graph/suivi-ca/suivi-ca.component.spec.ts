import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SuiviCAComponent } from './suivi-ca.component';

describe('SuiviCAComponent', () => {
  let component: SuiviCAComponent;
  let fixture: ComponentFixture<SuiviCAComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SuiviCAComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SuiviCAComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
