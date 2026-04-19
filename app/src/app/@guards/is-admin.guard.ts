import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { Ability } from '@casl/ability';
import { Action } from '@services/ability.service';
import { AppStore } from '@store/app.store';

/**
 * Guard that checks if the user has permissions to manage everything (admin level).
 */
export const isAdminGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const ability = inject(Ability);
  const appStore = inject(AppStore);

  // First check Ability (it should be updated by AbilityService)
  if (ability.can(Action.Manage, 'all') || ability.can(Action.Read, 'AdminPanel')) {
    return true;
  }

  // Fallback to direct AppStore rules check if Ability hasn't updated yet
  const rules = appStore.rules();
  const hasAdminPermission = rules.some((rule: any) =>
    (((rule.action === Action.Manage && rule.subject === 'all') ||
    (rule.action === Action.Read && rule.subject === 'AdminPanel') ||
    (rule.action === 'manage' && rule.subject === 'all') ||
    (rule.action === 'read' && rule.subject === 'AdminPanel')) &&
    !rule.inverted)
  );

  if (hasAdminPermission) {
    return true;
  }

  return router.createUrlTree(['/forbidden']);
};
