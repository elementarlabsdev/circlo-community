import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AppStore } from '@store/app.store';

export const isAlreadyPaidGuard: CanActivateFn = (route, state) => {
  const store = inject(AppStore);
  const router = inject(Router);

  const profile = store.profile();

  if (profile?.isPaid) {
    return router.createUrlTree(['/']);
  }

  return true;
};
