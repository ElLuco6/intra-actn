import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BandeauClientComponent } from './bandeau-client.component';

describe('BandeauClientComponent', () => {
  let component: BandeauClientComponent;
  let fixture: ComponentFixture<BandeauClientComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [BandeauClientComponent]
    });
    fixture = TestBed.createComponent(BandeauClientComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
