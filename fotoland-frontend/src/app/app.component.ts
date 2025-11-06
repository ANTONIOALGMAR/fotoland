import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from './auth/services/auth.service';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { NotificationService } from './shared/services/notification.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'fotoland-frontend';
  isAuthenticated: boolean = false;
  private routerSubscription: Subscription = new Subscription();
  private notificationSubscriptions: Subscription = new Subscription();

  chatInviteCount: number = 0;
  chatMessageCount: number = 0;

  constructor(private authService: AuthService, private router: Router, private notificationService: NotificationService) {}

  ngOnInit(): void {
    // Verificar autenticação inicial
    this.checkAuthentication();
    
    // Escutar mudanças de rota para verificar autenticação
    this.routerSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.checkAuthentication();
      });

    this.notificationSubscriptions.add(this.notificationService.chatInviteCount$.subscribe(count => {
      this.chatInviteCount = count;
    }));
    this.notificationSubscriptions.add(this.notificationService.chatMessageCount$.subscribe(count => {
      this.chatMessageCount = count;
    }));
  }

  ngOnDestroy(): void {
    this.routerSubscription.unsubscribe();
    this.notificationSubscriptions.unsubscribe();
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
    comment: false,
    chat: false,
    account: true,
    discover: true,
    notifications: true
  };

  onLogout(): void {
    this.authService.logout();
    this.checkAuthentication(); // Forçar verificação após logout
  }

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  toggleSection(section: 'album' | 'post' | 'feed' | 'comment' | 'chat' | 'account' | 'discover' | 'notifications'): void {
    this.sections[section] = !this.sections[section];
  }
}
