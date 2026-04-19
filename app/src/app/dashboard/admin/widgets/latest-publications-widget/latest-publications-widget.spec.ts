import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LatestPublicationsWidget } from './latest-publications-widget';

describe('LatestPublicationsWidget', () => {
  let component: LatestPublicationsWidget;
  let fixture: ComponentFixture<LatestPublicationsWidget>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LatestPublicationsWidget]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LatestPublicationsWidget);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
