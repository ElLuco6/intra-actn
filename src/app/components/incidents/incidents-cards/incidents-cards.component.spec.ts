import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IncidentsCardsComponent } from './incidents-cards.component';

describe('IncidentsCardsComponent', () => {
  let component: IncidentsCardsComponent;
  let fixture: ComponentFixture<IncidentsCardsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IncidentsCardsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IncidentsCardsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
