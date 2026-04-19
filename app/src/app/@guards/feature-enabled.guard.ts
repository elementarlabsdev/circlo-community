import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { SettingsService } from '@services/settings.service';
import { Ability } from '@casl/ability';
import { Action } from '@services/ability.service';

export const featureEnabledGuard = (featureName: string): CanActivateFn => {
  return async () => {
    const settingsService = inject(SettingsService);
    const router = inject(Router);
    const ability = inject(Ability);

    const isEnabled = await settingsService.findValueByName(featureName, true);

    if (!isEnabled) {
      if (ability.can(Action.Manage, 'all')) {
        return true;
      }

      router.navigate(['/']);
      return false;
    }

    return true;
  };
};
