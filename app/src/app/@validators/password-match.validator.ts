import { ValidatorFn, AbstractControl } from '@angular/forms';

export function passwordMatchValidator(): ValidatorFn {
  return (control: AbstractControl): { [key: string]: boolean } | null => {
    const password = control.value['password'].trim();
    const confirmPassword = control.value['confirmPassword'].trim();

    if (password && confirmPassword && password !== confirmPassword) {
      return {
        passwordMatch: true
      };
    }

    return null;
  };
}
