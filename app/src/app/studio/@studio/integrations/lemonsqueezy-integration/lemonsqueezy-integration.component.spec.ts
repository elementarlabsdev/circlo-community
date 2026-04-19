import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LemonsqueezyIntegrationComponent } from './lemonsqueezy-integration.component';

describe('LemonsqueezyIntegrationComponent', () => {
  let component: LemonsqueezyIntegrationComponent;
  let fixture: ComponentFixture<LemonsqueezyIntegrationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LemonsqueezyIntegrationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LemonsqueezyIntegrationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
