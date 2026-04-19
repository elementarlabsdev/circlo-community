import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaypalIntegrationComponent } from './paypal-integration.component';

describe('PaypalIntegrationComponent', () => {
  let component: PaypalIntegrationComponent;
  let fixture: ComponentFixture<PaypalIntegrationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaypalIntegrationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PaypalIntegrationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
