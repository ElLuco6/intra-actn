import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CircleDiagramComponent } from './circle-diagram.component';

describe('CircleDiagramComponent', () => {
  let component: CircleDiagramComponent;
  let fixture: ComponentFixture<CircleDiagramComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CircleDiagramComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CircleDiagramComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
