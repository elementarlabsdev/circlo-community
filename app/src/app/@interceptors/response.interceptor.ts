import { HttpInterceptorFn, HttpStatusCode } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { inject, isDevMode } from '@angular/core';
import { Router } from '@angular/router';
import { SnackBar } from '@ngstarter-ui/components/snack-bar';
import { TranslocoService } from '@jsverse/transloco';
import { AuthService } from '@services/auth.service';

export const responseInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const snackbar = inject(SnackBar);
  const translocoService = inject(TranslocoService);
  const authService = inject(AuthService);
  const isLoginRequest = req.url.includes('identity/login');

  return next(req).pipe(
    catchError((error: any, caught: any) => {
      // Handle 401 Unauthorized globally - trigger logout
      if (error?.status === HttpStatusCode.Unauthorized) {
        if (!isLoginRequest) {
          authService.logout(router.url);
        }
        return throwError(() => error);
      }

      // Handle 400 Bad Request globally – show server message in a snackbar
      if (error?.status === HttpStatusCode.BadRequest) {
        const payload = error?.error;
        let message: string | undefined;
        if (payload) {
          const msg = (payload.message ?? payload.error);
          message = Array.isArray(msg) ? msg.join('\n') : msg;
        }

        if (message) {
          message = translocoService.translate(message);
        }

        snackbar.open(message || 'Bad Request', 'Close', {
          duration: 5000,
          verticalPosition: 'top'
        });
        return throwError(() => error);
      }

      if (error.status === HttpStatusCode.Forbidden) {
        if (!isLoginRequest) {
          router.navigateByUrl('/forbidden', {
            replaceUrl: false
          });
        }
        return throwError(() => error);
      }

      if (error.status === HttpStatusCode.NotFound) {
        router.navigateByUrl('/error/not-found', {
          replaceUrl: false
        });
        return throwError(() => error);
      }

      if (!isDevMode()) {
        return throwError(() => error);
      }

      return throwError(() => error);
    })
  );
};
