import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientsBloquesComponent } from './clients-bloques.component';

describe('ClientsBloquesComponent', () => {
  let component: ClientsBloquesComponent;
  let fixture: ComponentFixture<ClientsBloquesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ClientsBloquesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClientsBloquesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
