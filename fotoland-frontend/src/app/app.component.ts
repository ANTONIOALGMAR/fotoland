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
  isAuthenticated: boolean = false; // Será atualizado via observable
  private routerSubscription: Subscription = new Subscription();
  private notificationSubscriptions: Subscription = new Subscription();
  private authStatusSubscription: Subscription = new Subscription();

  chatInviteCount: number = 0;
  chatMessageCount: number = 0;

  constructor(private authService: AuthService, private router: Router, private notificationService: NotificationService) {}

  ngOnInit(): void {
    // Escutar mudanças de autenticação do AuthService
    this.authStatusSubscription = this.authService.isAuthenticated$.subscribe(status => {
      this.isAuthenticated = status;
      // Se não estiver autenticado, garantir que a sidebar esteja fechada
      if (!this.isAuthenticated) {
        this.isSidebarOpen = false;
      }
    });
    
    // Escutar mudanças de rota para verificar autenticação (se necessário, mas agora o authService já gerencia)
    this.routerSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        // O estado de autenticação já é gerenciado pelo authService.isAuthenticated$
        // this.checkAuthentication(); // Não é mais necessário chamar aqui
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
    this.authStatusSubscription.unsubscribe();
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
    // O estado de autenticação será atualizado via authStatusSubscription
    // this.checkAuthentication(); // Não é mais necessário chamar aqui
  }

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  toggleSection(section: 'album' | 'post' | 'feed' | 'comment' | 'chat' | 'account' | 'discover' | 'notifications'): void {
    this.sections[section] = !this.sections[section];
  }
}
