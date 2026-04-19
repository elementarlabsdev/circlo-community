import { ComponentFixture, TestBed } from '@angular/core/testing';

import { YoutubeBlockSettingsComponent } from './youtube-block-settings.component';

describe('YoutubeBlockSettingsComponent', () => {
  let component: YoutubeBlockSettingsComponent;
  let fixture: ComponentFixture<YoutubeBlockSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [YoutubeBlockSettingsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(YoutubeBlockSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
