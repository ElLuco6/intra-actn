import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PistageComponent } from './pistage.component';

describe('PistageComponent', () => {
  let component: PistageComponent;
  let fixture: ComponentFixture<PistageComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PistageComponent]
    });
    fixture = TestBed.createComponent(PistageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
