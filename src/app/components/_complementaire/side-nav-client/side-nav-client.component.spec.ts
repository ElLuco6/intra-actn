import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SideNavClientComponent } from './side-nav-client.component';

describe('SideNavClientComponent', () => {
  let component: SideNavClientComponent;
  let fixture: ComponentFixture<SideNavClientComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SideNavClientComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SideNavClientComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
