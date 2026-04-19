import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StripeIntegrationComponent } from './stripe-integration.component';

describe('StripeIntegrationComponent', () => {
  let component: StripeIntegrationComponent;
  let fixture: ComponentFixture<StripeIntegrationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StripeIntegrationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StripeIntegrationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
