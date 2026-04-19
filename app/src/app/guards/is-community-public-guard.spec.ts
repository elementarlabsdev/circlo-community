import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { isCommunityPublicGuard } from './is-community-public-guard';

describe('isCommunityPublicGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => isCommunityPublicGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
