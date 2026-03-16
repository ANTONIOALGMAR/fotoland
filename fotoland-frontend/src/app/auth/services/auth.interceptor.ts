import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Autenticacao via cookie HttpOnly: nao adiciona Authorization.
    // Para APIs do backend, envia cookies e adiciona header anti-CSRF simples.
    const backendBaseUrlOverride = (typeof window !== 'undefined' ? localStorage.getItem('backend_base_url') : null);
    const backendBaseUrl = (
      backendBaseUrlOverride
        ? backendBaseUrlOverride
        : (/^(localhost|127\.0\.0\.1|0\.0\.0\.0)$/.test(window.location.hostname)
            ? 'http://localhost:8080'
            : 'https://fotoland-backend.onrender.com')
    ).replace(/:+$/, '');

    if (request.url.startsWith(backendBaseUrl)) {
      const token = typeof window !== 'undefined' ? localStorage.getItem('fotoland_token') : null;
      let headers = request.headers.set('X-Requested-With', 'XMLHttpRequest');
      
      if (token) {
        headers = headers.set('Authorization', `Bearer ${token}`);
      }

      request = request.clone({
        withCredentials: true,
        headers: headers
      });
    }

    return next.handle(request);
  }
}
