import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BarClientComponent } from './bar-client.component';

describe('BarClientComponent', () => {
  let component: BarClientComponent;
  let fixture: ComponentFixture<BarClientComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BarClientComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BarClientComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
