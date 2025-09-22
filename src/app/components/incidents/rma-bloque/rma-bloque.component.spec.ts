import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RmaBloqueComponent } from './rma-bloque.component';

describe('RmaBloqueComponent', () => {
  let component: RmaBloqueComponent;
  let fixture: ComponentFixture<RmaBloqueComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RmaBloqueComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RmaBloqueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
