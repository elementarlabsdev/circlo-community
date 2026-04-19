import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeadingBlockSettingsComponent } from './heading-block-settings.component';

describe('HeadingBlockSettingsComponent', () => {
  let component: HeadingBlockSettingsComponent;
  let fixture: ComponentFixture<HeadingBlockSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeadingBlockSettingsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HeadingBlockSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
