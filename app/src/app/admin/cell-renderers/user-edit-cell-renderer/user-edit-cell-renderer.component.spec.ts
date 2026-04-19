import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserEditCellRendererComponent } from './user-edit-cell-renderer.component';

describe('UserEditCellRendererComponent', () => {
  let component: UserEditCellRendererComponent;
  let fixture: ComponentFixture<UserEditCellRendererComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserEditCellRendererComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserEditCellRendererComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
