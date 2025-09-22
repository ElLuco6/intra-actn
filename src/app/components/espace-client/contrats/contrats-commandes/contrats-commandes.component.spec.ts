import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContratsCommandesComponent } from './contrats-commandes.component';

describe('ContratsCommandesComponent', () => {
  let component: ContratsCommandesComponent;
  let fixture: ComponentFixture<ContratsCommandesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ContratsCommandesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ContratsCommandesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
