import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GeminiIntegrationComponent } from './gemini-integration.component';

describe('GeminiIntegrationComponent', () => {
  let component: GeminiIntegrationComponent;
  let fixture: ComponentFixture<GeminiIntegrationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GeminiIntegrationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GeminiIntegrationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
