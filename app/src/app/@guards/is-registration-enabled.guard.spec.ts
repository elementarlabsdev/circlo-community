import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { isRegistrationEnabledGuard } from './is-registration-enabled.guard';

describe('isRegistrationEnabledGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => isRegistrationEnabledGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
