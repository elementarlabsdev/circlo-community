import { AbstractControl, AsyncValidatorFn } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ApiService } from '@services/api.service';

export function uniqueUsernameValidator(api: ApiService, userId: string): AsyncValidatorFn {
  return (control: AbstractControl): Observable<{ [key: string]: boolean } | null> => {
    if (!control.dirty) {
      return of(null);
    }

    return api.post(`studio/account/my-profile/username/validate`, {
      username: control.value,
      userId
    }).pipe(
      map((res: any) => (res.invalid ? { uniqueUsername: true } : null)),
      catchError(() => of(null))
    );
  };
}
