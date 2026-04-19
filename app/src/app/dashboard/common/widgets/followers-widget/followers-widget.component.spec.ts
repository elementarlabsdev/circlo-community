import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FollowersWidgetComponent } from './followers-widget.component';

describe('FollowersWidgetComponent', () => {
  let component: FollowersWidgetComponent;
  let fixture: ComponentFixture<FollowersWidgetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FollowersWidgetComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FollowersWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
