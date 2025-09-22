import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MailDeRelanceComponent } from './mail-de-relance.component';

describe('MailDeRelanceComponent', () => {
  let component: MailDeRelanceComponent;
  let fixture: ComponentFixture<MailDeRelanceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MailDeRelanceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MailDeRelanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
