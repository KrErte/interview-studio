import { HttpInterceptorFn } from '@angular/common/http';
import { tap } from 'rxjs';

/**
 * Attaches JWT from localStorage to all /api/** requests as Authorization header.
 * Skips when no token, when a header already exists, or for auth endpoints.
 * On 401 response, clears auth and redirects to login.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('auth_token');

  const isApiRequest = req.url.includes('/api/');
  const isAuthRequest = req.url.includes('/api/auth');
  const hasAuthHeader = req.headers.has('Authorization');

  if (!token || !isApiRequest || hasAuthHeader || isAuthRequest) {
    return next(req);
  }

  const authReq = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  });

  return next(authReq).pipe(
    tap({
      error: (err) => {
        if (err.status === 401 && !req.url.includes('/api/auth')) {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('auth_email');
          localStorage.removeItem('auth_fullName');
          localStorage.removeItem('auth_role');
          localStorage.removeItem('auth_tier');
          window.location.href = '/login?reason=session-expired';
        }
      }
    })
  );
};
