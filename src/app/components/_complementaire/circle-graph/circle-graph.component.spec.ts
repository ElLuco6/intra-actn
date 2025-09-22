import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CircleGraphComponent } from './circle-graph.component';

describe('CircleGraphComponent', () => {
  let component: CircleGraphComponent;
  let fixture: ComponentFixture<CircleGraphComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CircleGraphComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CircleGraphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
