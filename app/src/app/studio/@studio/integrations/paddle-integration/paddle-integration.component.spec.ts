import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaddleIntegrationComponent } from './paddle-integration.component';

describe('PaddleIntegrationComponent', () => {
  let component: PaddleIntegrationComponent;
  let fixture: ComponentFixture<PaddleIntegrationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaddleIntegrationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PaddleIntegrationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
