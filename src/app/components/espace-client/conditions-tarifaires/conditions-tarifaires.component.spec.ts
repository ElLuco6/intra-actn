import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConditionsTarifairesComponent } from './conditions-tarifaires.component';

describe('ConditionsTarifairesComponent', () => {
  let component: ConditionsTarifairesComponent;
  let fixture: ComponentFixture<ConditionsTarifairesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ConditionsTarifairesComponent]
    });
    fixture = TestBed.createComponent(ConditionsTarifairesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
