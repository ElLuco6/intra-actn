import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CaJournalierComponent } from './ca-journalier.component';

describe('CaJournalierComponent', () => {
  let component: CaJournalierComponent;
  let fixture: ComponentFixture<CaJournalierComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CaJournalierComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CaJournalierComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
