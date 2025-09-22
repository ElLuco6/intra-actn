import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LabelPanierComponent } from './label-panier.component';

describe('LabelPanierComponent', () => {
  let component: LabelPanierComponent;
  let fixture: ComponentFixture<LabelPanierComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabelPanierComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LabelPanierComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
