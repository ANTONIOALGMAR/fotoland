import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private authService: AuthService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.authService.getToken();
    const url = request.url;

    // Evita enviar Authorization em endpoints públicos
    const isPublicEndpoint =
      /\/api\/auth\/(register|login)(\/)?$/.test(url) ||
      /\/api\/upload(\/)?$/.test(url);

    if (token && token.trim() !== '' && token.includes('.') && !isPublicEndpoint) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }

    return next.handle(request);
  }
}
