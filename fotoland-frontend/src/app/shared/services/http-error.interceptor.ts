import { Injectable, Injector } from '@angular/core';
import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../../auth/services/auth.service';

@Injectable()
export class HttpErrorInterceptor implements HttpInterceptor {
  constructor(private injector: Injector) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((err: unknown) => {
        if (err instanceof HttpErrorResponse) {
          const isAuthRoute = /\/api\/auth\//.test(req.url);
          if (!isAuthRoute && (err.status === 401 || err.status === 403)) {
            const authService = this.injector.get(AuthService);
            authService.handleAuthExpired();
          }
        }
        return throwError(() => err);
      })
    );
  }
}

