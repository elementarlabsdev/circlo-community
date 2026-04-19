import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenerateAiImageModal } from './generate-ai-image.modal';

describe('GenerateAiImageModal', () => {
  let component: GenerateAiImageModal;
  let fixture: ComponentFixture<GenerateAiImageModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GenerateAiImageModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GenerateAiImageModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
