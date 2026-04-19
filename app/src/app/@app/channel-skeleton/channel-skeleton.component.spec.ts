import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChannelSkeletonComponent } from './channel-skeleton.component';

describe('ChannelSkeletonComponent', () => {
  let component: ChannelSkeletonComponent;
  let fixture: ComponentFixture<ChannelSkeletonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChannelSkeletonComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChannelSkeletonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
