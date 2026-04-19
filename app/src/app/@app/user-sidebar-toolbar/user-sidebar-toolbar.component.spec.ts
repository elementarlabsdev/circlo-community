import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserSidebarToolbarComponent } from './user-sidebar-toolbar.component';

describe('UserSidebarToolbarComponent', () => {
  let component: UserSidebarToolbarComponent;
  let fixture: ComponentFixture<UserSidebarToolbarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserSidebarToolbarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserSidebarToolbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
