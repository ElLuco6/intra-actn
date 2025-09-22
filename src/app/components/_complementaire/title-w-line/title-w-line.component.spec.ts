import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TitleWLineComponent } from './title-w-line.component';

describe('TitleWLineComponent', () => {
  let component: TitleWLineComponent;
  let fixture: ComponentFixture<TitleWLineComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TitleWLineComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TitleWLineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
