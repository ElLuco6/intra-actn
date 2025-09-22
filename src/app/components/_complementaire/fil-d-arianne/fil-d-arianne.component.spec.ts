import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FilDArianneComponent } from './fil-d-arianne.component';

describe('FilDArianneComponent', () => {
  let component: FilDArianneComponent;
  let fixture: ComponentFixture<FilDArianneComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FilDArianneComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FilDArianneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
