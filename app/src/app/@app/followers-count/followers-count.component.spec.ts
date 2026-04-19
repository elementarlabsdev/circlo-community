import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FollowersCountComponent } from './followers-count.component';

describe('FollowersCountComponent', () => {
  let component: FollowersCountComponent;
  let fixture: ComponentFixture<FollowersCountComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FollowersCountComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FollowersCountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
