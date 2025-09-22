import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RechercheToutComponent } from './recherche-tout.component';

describe('RechercheToutComponent', () => {
  let component: RechercheToutComponent;
  let fixture: ComponentFixture<RechercheToutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RechercheToutComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RechercheToutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
