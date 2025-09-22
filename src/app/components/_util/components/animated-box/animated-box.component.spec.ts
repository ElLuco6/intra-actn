import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnimatedBoxComponent } from './animated-box.component';

describe('AnimatedBoxComponent', () => {
  let component: AnimatedBoxComponent;
  let fixture: ComponentFixture<AnimatedBoxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AnimatedBoxComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AnimatedBoxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
