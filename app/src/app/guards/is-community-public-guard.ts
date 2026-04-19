import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AppStore } from '@store/app.store';

export const isCommunityPublicGuard: CanActivateFn = (route, state) => {
  const appStore = inject(AppStore);
  const router = inject(Router);

  if (appStore.isPublicCommunity() || appStore.isLogged()) {
    return true;
  }

  return router.createUrlTree(['/login']);
};
