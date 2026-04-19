import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FacebookIntegrationComponent } from './facebook-integration.component';

describe('FacebookIntegrationComponent', () => {
  let component: FacebookIntegrationComponent;
  let fixture: ComponentFixture<FacebookIntegrationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FacebookIntegrationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FacebookIntegrationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
