import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecommendedChannelsWidget } from './recommended-channels.widget';

describe('RecommendedChannelsWidget', () => {
  let component: RecommendedChannelsWidget;
  let fixture: ComponentFixture<RecommendedChannelsWidget>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecommendedChannelsWidget]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecommendedChannelsWidget);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
