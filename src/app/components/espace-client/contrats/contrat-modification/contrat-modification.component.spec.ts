import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContratModificationComponent } from './contrat-modification.component';

describe('ContratModificationComponent', () => {
  let component: ContratModificationComponent;
  let fixture: ComponentFixture<ContratModificationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ContratModificationComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ContratModificationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
