import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AiApiKeyModal } from './ai-api-key.modal';

describe('AiApiKeyModal', () => {
  let component: AiApiKeyModal;
  let fixture: ComponentFixture<AiApiKeyModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AiApiKeyModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AiApiKeyModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
