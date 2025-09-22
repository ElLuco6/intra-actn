import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmationDeleteDialogComponent } from './confirmation-delete-dialog.component';

describe('ConfirmationDialogComponent', () => {
  let component: ConfirmationDeleteDialogComponent;
  let fixture: ComponentFixture<ConfirmationDeleteDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfirmationDeleteDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConfirmationDeleteDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
