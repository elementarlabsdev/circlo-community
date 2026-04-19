import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserFollowersCount } from './user-followers-count';

describe('UserFollowersCount', () => {
  let component: UserFollowersCount;
  let fixture: ComponentFixture<UserFollowersCount>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserFollowersCount]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserFollowersCount);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
