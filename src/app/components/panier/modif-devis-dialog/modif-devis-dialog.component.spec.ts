import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModifDevisDialogComponent } from './modif-devis-dialog.component';

describe('ModifDevisDialogComponent', () => {
  let component: ModifDevisDialogComponent;
  let fixture: ComponentFixture<ModifDevisDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModifDevisDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModifDevisDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
