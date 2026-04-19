import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TextBlockSettingsComponent } from './text-block-settings.component';

describe('TextBlockSettingsComponent', () => {
  let component: TextBlockSettingsComponent;
  let fixture: ComponentFixture<TextBlockSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TextBlockSettingsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TextBlockSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
