import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CodeBlockSettingsComponent } from './code-block-settings.component';

describe('CodeBlockSettingsComponent', () => {
  let component: CodeBlockSettingsComponent;
  let fixture: ComponentFixture<CodeBlockSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CodeBlockSettingsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CodeBlockSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
