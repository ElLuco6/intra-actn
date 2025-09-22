import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImporterProspectsNonQualifiesComponent } from './importer-prospects-non-qualifies.component';

describe('ImporterProspectsNonQualifiesComponent', () => {
  let component: ImporterProspectsNonQualifiesComponent;
  let fixture: ComponentFixture<ImporterProspectsNonQualifiesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImporterProspectsNonQualifiesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ImporterProspectsNonQualifiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
