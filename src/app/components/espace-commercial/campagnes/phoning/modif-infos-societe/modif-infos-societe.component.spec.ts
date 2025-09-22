import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModifInfosSocieteComponent } from './modif-infos-societe.component';

describe('ModifInfosSocieteComponent', () => {
  let component: ModifInfosSocieteComponent;
  let fixture: ComponentFixture<ModifInfosSocieteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModifInfosSocieteComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModifInfosSocieteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
