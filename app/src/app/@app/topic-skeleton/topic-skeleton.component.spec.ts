import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TopicSkeletonComponent } from './topic-skeleton.component';

describe('TopicSkeletonComponent', () => {
  let component: TopicSkeletonComponent;
  let fixture: ComponentFixture<TopicSkeletonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TopicSkeletonComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TopicSkeletonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
