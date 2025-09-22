import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CotationComponent } from './cotation.component';

describe('CotationComponent', () => {
  let component: CotationComponent;
  let fixture: ComponentFixture<CotationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CotationComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CotationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
