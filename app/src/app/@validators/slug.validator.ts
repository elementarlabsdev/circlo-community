import { ValidatorFn, AbstractControl } from '@angular/forms';

export function slugValidator(): ValidatorFn {
  return (control: AbstractControl): { [key: string]: boolean } | null => {
    const slug = control.value;
    if (!slug) {
      return null;
    }

    // Slug validation rules:
    // - Only lowercase letters, numbers, and hyphens are allowed.
    // - No consecutive hyphens.
    const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

    if (!slugRegex.test(slug)) {
      return { 'slug': true };
    }

    // Check for consecutive hyphens.
    if (slug.match(/-{2,}/)) {
      return { 'slug': true };
    }

    return null; // If the slug is valid.
  };
}
