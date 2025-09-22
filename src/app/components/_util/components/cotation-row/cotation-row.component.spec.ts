import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CotationRowComponent } from './cotation-row.component';

describe('CotationRowComponent', () => {
  let component: CotationRowComponent;
  let fixture: ComponentFixture<CotationRowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CotationRowComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CotationRowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
