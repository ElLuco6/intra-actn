import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TableauObjectifsComponent } from './tableau-objectifs.component';

describe('TableauObjectifsComponent', () => {
  let component: TableauObjectifsComponent;
  let fixture: ComponentFixture<TableauObjectifsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TableauObjectifsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TableauObjectifsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
