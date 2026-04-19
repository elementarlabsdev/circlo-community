import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserStatusCellRendererComponent } from './user-status-cell-renderer.component';

describe('UserStatusCellRendererComponent', () => {
  let component: UserStatusCellRendererComponent;
  let fixture: ComponentFixture<UserStatusCellRendererComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserStatusCellRendererComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserStatusCellRendererComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
