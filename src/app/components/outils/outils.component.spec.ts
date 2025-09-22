import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OutilsComponent } from './outils.component';

describe('OutilsComponent', () => {
  let component: OutilsComponent;
  let fixture: ComponentFixture<OutilsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OutilsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OutilsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
