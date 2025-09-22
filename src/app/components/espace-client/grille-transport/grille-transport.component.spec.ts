import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GrilleTransportComponent } from './grille-transport.component';

describe('GrilleTransportComponent', () => {
  let component: GrilleTransportComponent;
  let fixture: ComponentFixture<GrilleTransportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GrilleTransportComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GrilleTransportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
