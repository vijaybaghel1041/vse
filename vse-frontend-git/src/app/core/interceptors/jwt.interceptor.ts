import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { catchError, switchMap, throwError } from 'rxjs';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {

  const authService = inject(AuthService);
  const token = localStorage.getItem('accessToken');

  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // On 401 Unauthorized, intercept and attempt token refresh
      if (error.status === 401 && !req.url.includes('/auth/login') && !req.url.includes('/auth/refresh')) {
        
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          authService.logout();
          return throwError(() => error);
        }

        return authService.refresh().pipe(
          switchMap((res: any) => {
            // Successfully refreshed! Clone the original failed request with the new access token.
            const clonedReq = req.clone({
              setHeaders: { Authorization: `Bearer ${res.accessToken}` }
            });
            return next(clonedReq);
          }),
          catchError((refreshErr) => {
            // If the refresh token is ALSO expired, clear storage
            authService.logout();
            return throwError(() => refreshErr);
          })
        );
      }
      
      // Pass other errors forward
      return throwError(() => error);
    })
  );
};
