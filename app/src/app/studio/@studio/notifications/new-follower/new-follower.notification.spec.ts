import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewFollowerNotification } from './new-follower.notification';

describe('NewFollowerNotification', () => {
  let component: NewFollowerNotification;
  let fixture: ComponentFixture<NewFollowerNotification>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewFollowerNotification]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewFollowerNotification);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
