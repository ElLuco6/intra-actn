import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommandesBloquesComponent } from './commandes-bloques.component';

describe('CommandesBloquesComponent', () => {
  let component: CommandesBloquesComponent;
  let fixture: ComponentFixture<CommandesBloquesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CommandesBloquesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CommandesBloquesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
