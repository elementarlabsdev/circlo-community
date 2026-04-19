import { AbstractControl, AsyncValidatorFn } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ApiService } from '@services/api.service';

export function topicUniqueSlugValidator(api: ApiService, topicId: string | null = null): AsyncValidatorFn {
  return (control: AbstractControl): Observable<{ [key: string]: boolean } | null> => {
    return api.post(`admin/topics/slug/validate`, {
      slug: control.value,
      topicId
    }).pipe(
      map((res: any) => (res.invalid ? { uniqueSlug: true } : null)),
      catchError(() => of(null))
    );
  };
}
