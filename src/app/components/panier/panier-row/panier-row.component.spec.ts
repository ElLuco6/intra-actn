import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PanierRowComponent } from './panier-row.component';

describe('PanierRowComponent', () => {
  let component: PanierRowComponent;
  let fixture: ComponentFixture<PanierRowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PanierRowComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PanierRowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
