import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ThreadNumberOfReplies } from './thread-number-of-replies';

describe('ThreadNumberOfReplies', () => {
  let component: ThreadNumberOfReplies;
  let fixture: ComponentFixture<ThreadNumberOfReplies>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ThreadNumberOfReplies]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ThreadNumberOfReplies);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
