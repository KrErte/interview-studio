import { inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { TokenStorageService } from './token-storage.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const tokenStorage = inject(TokenStorageService);
  const token = tokenStorage.getToken();

  const path = (() => {
    if (req.url.startsWith('http')) {
      try {
        return new URL(req.url).pathname;
      } catch {
        return req.url;
      }
    }
    return req.url;
  })();

  const isApi = path.startsWith('/api/');
  const isAuth = path.startsWith('/api/auth/');

  if (!token || !isApi || isAuth) {
    return next(req);
  }

  const authReq = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  });

  return next(authReq);
};
