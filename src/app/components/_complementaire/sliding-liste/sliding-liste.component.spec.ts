import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SlidingListeComponent } from './sliding-liste.component';

describe('SlidingListeComponent', () => {
  let component: SlidingListeComponent;
  let fixture: ComponentFixture<SlidingListeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SlidingListeComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SlidingListeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
