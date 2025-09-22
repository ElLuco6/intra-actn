import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CaJournalierDetailsComponent } from './ca-journalier-details.component';

describe('CaJournalierDetailsComponent', () => {
  let component: CaJournalierDetailsComponent;
  let fixture: ComponentFixture<CaJournalierDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CaJournalierDetailsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CaJournalierDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
