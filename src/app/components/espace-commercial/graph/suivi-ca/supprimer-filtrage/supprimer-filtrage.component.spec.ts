import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SupprimerFiltrageComponent } from './supprimer-filtrage.component';

describe('SupprimerFiltrageComponent', () => {
  let component: SupprimerFiltrageComponent;
  let fixture: ComponentFixture<SupprimerFiltrageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SupprimerFiltrageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SupprimerFiltrageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
