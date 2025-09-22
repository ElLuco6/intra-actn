import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MapFiltreComponent } from './map-filtre.component';

describe('MapFiltreComponent', () => {
  let component: MapFiltreComponent;
  let fixture: ComponentFixture<MapFiltreComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MapFiltreComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MapFiltreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
