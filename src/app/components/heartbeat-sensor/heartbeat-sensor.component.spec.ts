import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeartbeatSensorComponent } from './heartbeat-sensor.component';

describe('HeartbeatSensorComponent', () => {
  let component: HeartbeatSensorComponent;
  let fixture: ComponentFixture<HeartbeatSensorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HeartbeatSensorComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HeartbeatSensorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
