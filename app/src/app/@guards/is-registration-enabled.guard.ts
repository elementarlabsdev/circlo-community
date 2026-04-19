import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { AppStore } from '@store/app.store';
import { AuthService } from '@services/auth.service';

export const isRegistrationEnabledGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const appStore = inject(AppStore);

  if (authService.isLogged()) {
    return false;
  }

  return appStore.isRegistrationEnabled();
};
