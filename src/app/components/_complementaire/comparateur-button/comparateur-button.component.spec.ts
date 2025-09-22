import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComparateurButtonComponent } from './comparateur-button.component';

describe('ComparateurButtonComponent', () => {
  let component: ComparateurButtonComponent;
  let fixture: ComponentFixture<ComparateurButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ComparateurButtonComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ComparateurButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
