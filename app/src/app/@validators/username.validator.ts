import { ValidatorFn, AbstractControl } from '@angular/forms';

export function usernameValidator(): ValidatorFn {
  return (control: AbstractControl): { [key: string]: boolean } | null => {
    const username = control.value;

    if (!username) {
      return null;
    }

    // Slug validation rules:
    // - Only lowercase letters, numbers, and hyphens are allowed.
    // - No consecutive hyphens.
    const usernameRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

    if (!usernameRegex.test(username)) {
      return { username: true };
    }

    // Check for consecutive hyphens.
    if (username.match(/-{2,}/)) {
      return { 'username': true };
    }

    return null; // If the username is valid.
  };
}
