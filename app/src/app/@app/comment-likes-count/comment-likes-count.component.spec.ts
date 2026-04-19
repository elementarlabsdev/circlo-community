import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommentLikesCountComponent } from './comment-likes-count.component';

describe('CommentLikesCountComponent', () => {
  let component: CommentLikesCountComponent;
  let fixture: ComponentFixture<CommentLikesCountComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommentLikesCountComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CommentLikesCountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
