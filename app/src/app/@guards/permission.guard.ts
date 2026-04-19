import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { Ability } from '@casl/ability';
import { Action } from '@services/ability.service';
import { AppStore } from '@store/app.store';

/**
 * Guard that checks permissions using CASL Ability.
 * Usage in routes:
 * {
 *   path: 'admin',
 *   canActivate: [permissionGuard],
 *   data: { action: Action.Manage, subject: 'all' }
 * }
 */
export const permissionGuard: CanActivateFn = (route, state) => {
  const ability = inject(Ability);
  const router = inject(Router);
  const appStore = inject(AppStore);

  const action = route.data['action'] as Action || Action.Read;
  const subject = route.data['subject'] || 'all';

  if (ability.can(action, subject)) {
    return true;
  }

  // Fallback to direct AppStore rules check
  const rules = appStore.rules();
  const hasPermission = rules.some((rule: any) =>
    (((rule.action === Action.Manage && rule.subject === 'all') ||
    (rule.action === action && rule.subject === subject) ||
    (rule.action === 'manage' && rule.subject === 'all') ||
    (rule.action === action.toString().toLowerCase() && rule.subject === subject)) &&
    !rule.inverted)
  );

  if (hasPermission) {
    return true;
  }

  return router.createUrlTree(['/forbidden']);
};
