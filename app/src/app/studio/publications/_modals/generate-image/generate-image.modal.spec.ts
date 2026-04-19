import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenerateImageModal } from './generate-image.modal';

describe('GenerateImageModal', () => {
  let component: GenerateImageModal;
  let fixture: ComponentFixture<GenerateImageModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GenerateImageModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GenerateImageModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
