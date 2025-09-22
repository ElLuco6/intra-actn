import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NumerosDeSerieComponent } from './numeros-de-serie.component';

describe('NumerosDeSerieComponent', () => {
  let component: NumerosDeSerieComponent;
  let fixture: ComponentFixture<NumerosDeSerieComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NumerosDeSerieComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NumerosDeSerieComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
