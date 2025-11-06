import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { Client, IMessage, StompSubscription } from '@stomp/stompjs';
import { AuthService } from '../../auth/services/auth.service';

export interface Notification {
  type: 'CHAT_INVITE' | 'CHAT_MESSAGE';
  content: any; // Pode ser um roomId, sender, etc.
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService implements OnDestroy {
  private client: Client | null = null;
  private notificationSubscription: StompSubscription | null = null;
  private chatInviteCountSubject = new BehaviorSubject<number>(0);
  private chatMessageCountSubject = new BehaviorSubject<number>(0);
  private authSubscription: Subscription;

  chatInviteCount$: Observable<number> = this.chatInviteCountSubject.asObservable();
  chatMessageCount$: Observable<number> = this.chatMessageCountSubject.asObservable();

  private readonly BASE_URL_OVERRIDE = (typeof window !== 'undefined' ? localStorage.getItem('backend_base_url') : null);
  private readonly BASE_URL = (
    this.BASE_URL_OVERRIDE
      ? this.BASE_URL_OVERRIDE
      : (/^(localhost|127\.0\.0\.1|0\.0\.0\.0)$/.test(window.location.hostname)
          ? 'http://localhost:8080'
          : 'https://fotoland-backend.onrender.com')
  ).replace(/:+$/, '');

  constructor(private authService: AuthService) {
    this.authSubscription = this.authService.isAuthenticated$.subscribe(isAuthenticated => {
      if (isAuthenticated) {
        this.connect();
      } else {
        this.disconnect();
      }
    });
  }

  ngOnDestroy(): void {
    this.disconnect();
    this.authSubscription.unsubscribe();
  }

  private connect(): void {
    if (this.client && this.client.connected) {
      return;
    }

    const token = this.authService.getToken() || '';
    const scheme = window.location.protocol === 'https:' ? 'wss' : 'ws';
    const wsBase = this.BASE_URL.replace(/^http(s)?:/, `${scheme}:`);
    const url = `${wsBase}/ws-native`;

    this.client = new Client({
      webSocketFactory: () => new WebSocket(url),
      connectHeaders: token ? { Authorization: `Bearer ${token}` } : {},
      debug: (str) => console.debug('[STOMP Notification]', str),
      reconnectDelay: 5000,
    });

    this.client.onConnect = () => {
      console.log('Connected to Notification WebSocket');
      const username = this.authService.getUsernameFromToken();
      if (username) {
        this.notificationSubscription = this.client!.subscribe(`/user/${username}/queue/notifications`, (message: IMessage) => {
          try {
            const notification: Notification = JSON.parse(message.body);
            this.handleNotification(notification);
          } catch (e) {
            console.error('Error parsing notification:', e);
          }
        });
      }
    };

    this.client.onStompError = (frame) => {
      console.error('Broker STOMP error for notifications:', frame.headers['message'], frame.body);
    };

    this.client.activate();
  }

  private disconnect(): void {
    if (this.notificationSubscription) {
      this.notificationSubscription.unsubscribe();
      this.notificationSubscription = null;
    }
    if (this.client) {
      this.client.deactivate();
      this.client = null;
    }
    this.resetCounts();
  }

  private handleNotification(notification: Notification): void {
    switch (notification.type) {
      case 'CHAT_INVITE':
        this.chatInviteCountSubject.next(this.chatInviteCountSubject.getValue() + 1);
        break;
      case 'CHAT_MESSAGE':
        this.chatMessageCountSubject.next(this.chatMessageCountSubject.getValue() + 1);
        break;
      default:
        console.warn('Unknown notification type:', notification.type);
    }
  }

  resetChatInviteCount(): void {
    this.chatInviteCountSubject.next(0);
  }

  resetChatMessageCount(): void {
    this.chatMessageCountSubject.next(0);
  }

  private resetCounts(): void {
    this.chatInviteCountSubject.next(0);
    this.chatMessageCountSubject.next(0);
  }
}
