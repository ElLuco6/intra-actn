import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { NosMarquesComponent } from './nos-marques.component';

describe('NosMarquesComponent', () => {
  let component: NosMarquesComponent;
  let fixture: ComponentFixture<NosMarquesComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ NosMarquesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NosMarquesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
