import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TabSortComponent } from './tab-sort.component';

describe('TabSortComponent', () => {
  let component: TabSortComponent;
  let fixture: ComponentFixture<TabSortComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TabSortComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TabSortComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
