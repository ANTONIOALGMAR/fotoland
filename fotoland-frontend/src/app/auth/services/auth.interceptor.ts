import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpInterceptor,
  HttpHandler,
  HttpRequest,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from './auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const token = this.authService.getToken();

    if (token) {
      const cloned = req.clone({
        headers: req.headers.set('Authorization', `Bearer ${token}`),
      });
      // Pipe para adicionar tratamento de erro
      return next.handle(cloned).pipe(
        catchError(error => {
          if (error.status === 401) {
            // Token inválido ou expirado, desloga o usuário
            this.authService.logout();
          }
          return throwError(() => error);
        })
      );
    }

    return next.handle(req);
  }
}