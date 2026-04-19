import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserNameRenderer } from './user-name-renderer';

describe('UserNameRenderer', () => {
  let component: UserNameRenderer;
  let fixture: ComponentFixture<UserNameRenderer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserNameRenderer]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserNameRenderer);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
