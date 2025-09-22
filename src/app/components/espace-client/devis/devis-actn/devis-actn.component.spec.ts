import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DevisActnComponent } from './devis-actn.component';

describe('DevisActnComponent', () => {
  let component: DevisActnComponent;
  let fixture: ComponentFixture<DevisActnComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DevisActnComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DevisActnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
