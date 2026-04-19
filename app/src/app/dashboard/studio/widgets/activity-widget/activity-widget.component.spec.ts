import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActivityWidgetComponent } from './activity-widget.component';

describe('ActivityWidgetComponent', () => {
  let component: ActivityWidgetComponent;
  let fixture: ComponentFixture<ActivityWidgetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActivityWidgetComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ActivityWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
