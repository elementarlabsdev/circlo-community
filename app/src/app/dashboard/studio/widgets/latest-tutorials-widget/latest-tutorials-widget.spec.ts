import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LatestTutorialsWidget } from './latest-tutorials-widget';

describe('LatestTutorialsWidget', () => {
  let component: LatestTutorialsWidget;
  let fixture: ComponentFixture<LatestTutorialsWidget>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LatestTutorialsWidget]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LatestTutorialsWidget);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
