import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SaveFiltersComponent } from './save-filters.component';

describe('SaveFiltersComponent', () => {
  let component: SaveFiltersComponent;
  let fixture: ComponentFixture<SaveFiltersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SaveFiltersComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SaveFiltersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
