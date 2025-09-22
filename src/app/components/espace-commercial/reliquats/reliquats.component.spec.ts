import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReliquatsComponent } from './reliquats.component';

describe('ReliquatsComponent', () => {
  let component: ReliquatsComponent;
  let fixture: ComponentFixture<ReliquatsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReliquatsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReliquatsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
