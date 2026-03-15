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
    // Cookie HttpOnly: valida chamando o backend. Se falhar, redireciona para login.
    return this.authService.getMe().pipe(
      map(() => true),
      catchError(() => {
        // Evitar navegação ativa dentro do guard; apenas retornar UrlTree
        return of(this.router.createUrlTree(['/login']));
      })
    );
  }
}
