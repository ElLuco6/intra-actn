import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListUsersContactsComponent } from './list-users-contacts.component';

describe('ListUsersContactsComponent', () => {
  let component: ListUsersContactsComponent;
  let fixture: ComponentFixture<ListUsersContactsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ListUsersContactsComponent]
    });
    fixture = TestBed.createComponent(ListUsersContactsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
