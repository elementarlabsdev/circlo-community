import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Stripe } from './stripe';

describe('Stripe', () => {
  let component: Stripe;
  let fixture: ComponentFixture<Stripe>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Stripe]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Stripe);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
