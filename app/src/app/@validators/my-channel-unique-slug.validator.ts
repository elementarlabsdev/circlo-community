import { AbstractControl, AsyncValidatorFn } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ApiService } from '@services/api.service';

export function myChannelUniqueSlugValidator(api: ApiService): AsyncValidatorFn {
  return (control: AbstractControl): Observable<{ [key: string]: boolean } | null> => {
    return api.post(`studio/my-channel/slug/validate`, {
      slug: control.value
    }).pipe(
      map((res: any) => (res.invalid ? { uniqueSlug: true } : null)),
      catchError(() => of(null))
    );
  };
}
