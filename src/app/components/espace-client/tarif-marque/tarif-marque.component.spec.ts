import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TarifMarqueComponent } from './tarif-marque.component';

describe('TarifMarqueComponent', () => {
  let component: TarifMarqueComponent;
  let fixture: ComponentFixture<TarifMarqueComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TarifMarqueComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TarifMarqueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
