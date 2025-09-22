import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LogClientComponent } from './log-client.component';

describe('LogClientComponent', () => {
  let component: LogClientComponent;
  let fixture: ComponentFixture<LogClientComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LogClientComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LogClientComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
