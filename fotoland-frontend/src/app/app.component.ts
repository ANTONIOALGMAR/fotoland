import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from './auth/services/auth.service';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'fotoland-frontend';
  isAuthenticated: boolean = false;
  private routerSubscription: Subscription = new Subscription();

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    // Verificar autenticação inicial
    this.checkAuthentication();
    
    // Escutar mudanças de rota para verificar autenticação
    this.routerSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.checkAuthentication();
      });
  }

  ngOnDestroy(): void {
    this.routerSubscription.unsubscribe();
  }

  private checkAuthentication(): void {
    const token = this.authService.getToken();
    this.isAuthenticated = !!token && token.trim() !== '';
    
    // Se não estiver autenticado, garantir que a sidebar esteja fechada
    if (!this.isAuthenticated) {
      this.isSidebarOpen = false;
    }
  }

  isSidebarOpen: boolean = true;
  sections = {
    album: true,
    post: true,
    feed: true,
    comment: false
  };

  onLogout(): void {
    this.authService.logout();
    this.checkAuthentication(); // Forçar verificação após logout
  }

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  toggleSection(section: 'album' | 'post' | 'feed' | 'comment'): void {
    this.sections[section] = !this.sections[section];
  }
}
