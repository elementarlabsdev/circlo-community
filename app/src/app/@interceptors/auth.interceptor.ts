import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { ApiService } from '@services/api.service';
import { catchError, throwError } from 'rxjs';

// Adds Authorization header if available and not already present
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const api = inject(ApiService);
  const token = api.getAuthToken?.() as string | undefined;

  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      return throwError(() => error);
    }),
  );
};
