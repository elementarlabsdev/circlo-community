import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { Ability } from '@casl/ability';
import { Action } from '@services/ability.service';

/**
 * Guard that checks if the user has permissions to manage everything (admin level).
 */
export const isAdminAllowedGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const ability = inject(Ability);

  if (ability.can(Action.Manage, 'all') || ability.can(Action.Read, 'AdminPanel')) {
    return true;
  }

  return router.createUrlTree(['/forbidden']);
};
