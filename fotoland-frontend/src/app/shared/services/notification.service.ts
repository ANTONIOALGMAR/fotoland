import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, Subscription, Subject } from 'rxjs';
import { Client, IMessage, StompSubscription } from '@stomp/stompjs';
import { AuthService } from '../../auth/services/auth.service';
import { Notification as ApiNotification, Page } from '../../../../../api.models';
import { tap } from 'rxjs/operators';

export interface Notification {
  type: 'CHAT_INVITE' | 'CHAT_MESSAGE';
  content: any;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService implements OnDestroy {
  private client: Client | null = null;
  private notificationSubscription: StompSubscription | null = null;
  private chatInviteCountSubject = new BehaviorSubject<number>(0);
  private chatMessageCountSubject = new BehaviorSubject<number>(0);
  private chatInviteSubject = new Subject<any>(); // Para emitir convites de chat
  private authSubscription: Subscription;

  chatInviteCount$: Observable<number> = this.chatInviteCountSubject.asObservable();
  chatMessageCount$: Observable<number> = this.chatMessageCountSubject.asObservable();
  chatInvite$: Observable<any> = this.chatInviteSubject.asObservable(); // Observable para convites de chat

  private readonly BASE_URL_OVERRIDE = (typeof window !== 'undefined' ? localStorage.getItem('backend_base_url') : null);
  private readonly BASE_URL = (
    this.BASE_URL_OVERRIDE
      ? this.BASE_URL_OVERRIDE
      : (/^(localhost|127\.0\.0\.1|0\.0\.0\.0)$/.test(window.location.hostname)
          ? 'http://localhost:8080'
          : 'https://fotoland-backend.onrender.com')
  ).replace(/:+$/, '');

  constructor(private authService: AuthService, private http: HttpClient) {
    this.authSubscription = this.authService.isAuthenticated$.subscribe(isAuthenticated => {
      if (isAuthenticated) {
        this.connect();
      } else {
        this.disconnect();
      }
    });
  }

  getNotifications(status: 'ALL' | 'UNREAD' = 'ALL'): Observable<Page<ApiNotification>> {
    const params = new HttpParams().set('status', status);
    return this.http.get<Page<ApiNotification>>(`${this.BASE_URL}/api/notifications`, { params });
  }

  markAsRead(id: number): Observable<void> {
    return this.http.post<void>(`${this.BASE_URL}/api/notifications/${id}/read`, {}).pipe(
      tap(() => {
        // Opcional: Atualizar o estado localmente se necessário
      })
    );
  }

  markAllAsRead(): Observable<void> {
    return this.http.post<void>(`${this.BASE_URL}/api/notifications/read-all`, {});
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
        this.chatInviteSubject.next(notification.content); // Emitir o conteúdo do convite
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

