import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImageBlockSettingsComponent } from './image-block-settings.component';

describe('ImageBlockSettingsComponent', () => {
  let component: ImageBlockSettingsComponent;
  let fixture: ComponentFixture<ImageBlockSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImageBlockSettingsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ImageBlockSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
