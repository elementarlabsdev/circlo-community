import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaidAccount } from './paid-account';

describe('PaidAccount', () => {
  let component: PaidAccount;
  let fixture: ComponentFixture<PaidAccount>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaidAccount]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PaidAccount);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
