import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AppStore } from '@store/app.store';
import { ApiService } from '@services/api.service';
import { map } from 'rxjs';
import { Ability } from '@casl/ability';
import { Action } from '@services/ability.service';

export const isPaidGuard: CanActivateFn = (route, state) => {
  const store = inject(AppStore);
  const router = inject(Router);
  const api = inject(ApiService);
  const ability = inject(Ability);

  const profile = store.profile();

  if (!profile) {
    return true;
  }

  if (
    state.url === '/' ||
    state.url.startsWith('/checkout') ||
    state.url.startsWith('/logout') ||
    state.url.startsWith('/publication/') ||
    state.url.startsWith('/channel/') ||
    state.url.startsWith('/topic/') ||
    state.url.startsWith('/page/') ||
    state.url.startsWith('/search') ||
    state.url.startsWith('/channels') ||
    state.url.startsWith('/topics') ||
    state.url.startsWith('/user/') ||
    state.url.startsWith('/discussion/') ||
    state.url.startsWith('/thread/')
  ) {
    return true;
  }

  return api.get('identity/page-settings/login').pipe(
    map((res: any) => {
      const monetizationPaidAccountEnabled = res.monetizationPaidAccountEnabled;

      if (monetizationPaidAccountEnabled && !profile.isPaid && !ability.can(Action.Manage, 'all')) {
        return router.createUrlTree(['/checkout']);
      }

      return true;
    })
  );
};
