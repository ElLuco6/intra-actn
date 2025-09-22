import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EnduserFormComponent } from './enduser-form.component';

describe('EnduserFormComponent', () => {
  let component: EnduserFormComponent;
  let fixture: ComponentFixture<EnduserFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EnduserFormComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EnduserFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
