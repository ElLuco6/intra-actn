import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RollingHeaderComponent } from './rolling-header.component';

describe('RollingHeaderComponent', () => {
  let component: RollingHeaderComponent;
  let fixture: ComponentFixture<RollingHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RollingHeaderComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RollingHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
