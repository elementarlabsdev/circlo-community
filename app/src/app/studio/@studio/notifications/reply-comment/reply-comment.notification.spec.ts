import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReplyCommentNotification } from './reply-comment.notification';

describe('ReplyCommentNotification', () => {
  let component: ReplyCommentNotification;
  let fixture: ComponentFixture<ReplyCommentNotification>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReplyCommentNotification]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReplyCommentNotification);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
