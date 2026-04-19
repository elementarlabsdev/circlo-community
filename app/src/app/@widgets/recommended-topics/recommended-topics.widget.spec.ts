import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecommendedTopicsWidget } from './recommended-topics.widget';

describe('RecommendedTopicsWidget', () => {
  let component: RecommendedTopicsWidget;
  let fixture: ComponentFixture<RecommendedTopicsWidget>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecommendedTopicsWidget]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecommendedTopicsWidget);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
