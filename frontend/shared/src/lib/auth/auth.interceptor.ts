import {HttpErrorResponse, HttpInterceptorFn} from '@angular/common/http';
import { inject } from '@angular/core';
import { Auth } from './auth';
import {catchError, throwError} from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(Auth);

  const token = auth.getToken();
  console.log('TOKEN INTERCEPTOR =', token);
  if (token) {
    const cloned = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });

    return next(cloned);
  }

  return next(req);
};

export const loggingInterceptor: HttpInterceptorFn = (req, next) => {
  console.log('HTTP request:', req.method, req.url);
  return next(req);
};

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        console.error('Non authentifié');
      } else if (error.status === 403) {
        console.error('Accès refusé');
      }

      return throwError(() => error);
    })
  );
};
