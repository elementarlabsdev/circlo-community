import { AbstractControl, AsyncValidatorFn } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ApiService } from '@services/api.service';

export function channelUniqueSlugValidator(
  api: ApiService,
  channelId: string | null = null,
  isAdmin: boolean = true
): AsyncValidatorFn {
  return (control: AbstractControl): Observable<{ [key: string]: boolean } | null> => {
    if (!control.dirty) {
      return of(null);
    }

    const prefix = isAdmin ? 'admin' : 'studio';

    return api.post(`${prefix}/channels/slug/validate`, {
      slug: control.value,
      channelId
    }).pipe(
      map((res: any) => (res.invalid ? { uniqueSlug: true } : null)),
      catchError(() => of(null))
    );
  };
}
