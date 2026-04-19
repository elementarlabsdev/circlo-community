import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { isNotLoggedGuard } from './is-not-logged.guard';

describe('isNotLoggedGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => isNotLoggedGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
