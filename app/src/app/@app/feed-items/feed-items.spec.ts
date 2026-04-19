import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FeedItems } from './feed-items';

describe('FeedItems', () => {
  let component: FeedItems;
  let fixture: ComponentFixture<FeedItems>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeedItems]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FeedItems);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
