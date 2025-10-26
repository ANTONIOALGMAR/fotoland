import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): Observable<boolean | UrlTree> {
    const token = this.authService.getToken();
    if (!token) {
      return of(this.router.createUrlTree(['/login']));
    }

    // Valida o token chamando o backend. Se falhar, redireciona para login
    return this.authService.getMe().pipe(
      map(() => true),
      catchError(() => {
        this.authService.logout();
        return of(this.router.createUrlTree(['/login']));
      })
    );
  }
}