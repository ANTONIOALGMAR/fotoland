import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from './auth/services/auth.service';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription, interval, of } from 'rxjs';
import { filter, startWith, switchMap, catchError } from 'rxjs/operators';
import { NotificationService } from './shared/services/notification.service';
import { TranslateService } from '@ngx-translate/core';
import { ThemeService } from './shared/services/theme.service';
import { User } from '../../../api.models';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'fotoland-frontend';
  isAuthenticated: boolean = false;
  isSidebarOpen: boolean = false;
  
  private routerSubscription: Subscription = new Subscription();
  private notificationSubscriptions: Subscription = new Subscription();
  private authStatusSubscription: Subscription = new Subscription();
  private onlineSubscription: Subscription = new Subscription();

  chatInviteCount: number = 0;
  chatMessageCount: number = 0;
  generalNotificationCount: number = 0;
  totalNotifications: number = 0;
  currentInvite: any = null;
  
  onlineFollowers: User[] = [];

  sections = {
    album: true,
    post: true,
    feed: true,
    comment: true,
    chat: true,
    account: true,
    discover: true,
    notifications: true
  };

  constructor(
    public authService: AuthService, 
    private router: Router, 
    private notificationService: NotificationService,
    private translate: TranslateService,
    private themeService: ThemeService
  ) {
    const savedLang = localStorage.getItem('selectedLang') || 'pt';
    this.translate.addLangs(['pt', 'en']);
    this.translate.setDefaultLang('pt');
    this.translate.use(savedLang);
  }


  ngOnInit(): void {
    this.authStatusSubscription = this.authService.isAuthenticated$.subscribe(status => {
      this.isAuthenticated = status;
      if (!this.isAuthenticated) {
        this.isSidebarOpen = false;
        this.onlineSubscription.unsubscribe();
        this.onlineFollowers = [];
      } else {
        this.startOnlineTracking();
      }
    });
    
    this.routerSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        if (this.isSidebarOpen) {
          this.isSidebarOpen = false;
        }
      });

    this.notificationSubscriptions.add(this.notificationService.chatInviteCount$.subscribe({
      next: count => {
        this.chatInviteCount = count;
        this.updateTotalNotifications();
      },
      error: err => console.error('Error in chatInviteCount:', err)
    }));
    this.notificationSubscriptions.add(this.notificationService.chatMessageCount$.subscribe({
      next: count => {
        this.chatMessageCount = count;
        this.updateTotalNotifications();
      },
      error: err => console.error('Error in chatMessageCount:', err)
    }));
    this.notificationSubscriptions.add(this.notificationService.generalNotificationCount$.subscribe({
      next: count => {
        this.generalNotificationCount = count;
        this.updateTotalNotifications();
      },
      error: err => console.error('Error in generalNotificationCount:', err)
    }));

    this.notificationSubscriptions.add(this.notificationService.chatInvite$.subscribe(invite => {
      this.currentInvite = invite;
    }));
  }

  updateTotalNotifications(): void {
    this.totalNotifications = this.chatInviteCount + this.chatMessageCount + this.generalNotificationCount;
  }

  startOnlineTracking(): void {
    this.onlineSubscription.unsubscribe();
    this.onlineSubscription = interval(30000).pipe(
      startWith(0),
      switchMap(() => {
        if (this.isAuthenticated) {
          return this.authService.getOnlineFollowers().pipe(
            catchError(() => of([]))
          );
        }
        return of([]);
      })
    ).subscribe({
      next: (users) => this.onlineFollowers = users,
      error: (err) => console.error('Error tracking online followers:', err)
    });
  }

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  toggleSection(section: keyof typeof this.sections): void {
    this.sections[section] = !this.sections[section];
  }

  acceptInvite(invite: any): void {
    this.authService.acceptInvite(invite.id).subscribe({
      next: () => {
        this.currentInvite = null;
        this.notificationService.resetChatInviteCount();
        this.router.navigate(['/private-chat']);
      },
      error: (err) => console.error('Error accepting invite:', err)
    });
  }

  declineInvite(): void {
    this.currentInvite = null;
  }

  onLogout(): void {
    this.authService.logout();
  }

  ngOnDestroy(): void {
    this.routerSubscription.unsubscribe();
    this.notificationSubscriptions.unsubscribe();
    this.authStatusSubscription.unsubscribe();
    this.onlineSubscription.unsubscribe();
  }
}
