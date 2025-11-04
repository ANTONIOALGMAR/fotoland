import { Injectable } from '@angular/core';
import { Client, IMessage, StompSubscription } from '@stomp/stompjs';
import * as SockJS from 'sockjs-client';

export interface ChatMsg {
  sender: string;
  content: string;
  timestamp: number;
}

@Injectable({ providedIn: 'root' })
export class ChatService {
  private client: Client | null = null;
  private subscription: StompSubscription | null = null;

  private readonly BASE_URL_OVERRIDE = (typeof window !== 'undefined' ? localStorage.getItem('backend_base_url') : null);
  private readonly BASE_URL = (
    this.BASE_URL_OVERRIDE
      ? this.BASE_URL_OVERRIDE
      : (/^(localhost|127\.0\.0\.1|0\.0\.0\.0)$/.test(window.location.hostname)
          ? 'http://localhost:8080'
          : 'https://fotoland-backend.onrender.com')
  ).replace(/:+$/, '');

  connect(onMessage: (msg: ChatMsg) => void): Promise<void> {
    return new Promise((resolve, reject) => {
      const token = localStorage.getItem('jwt_token') || '';

      this.client = new Client({
        webSocketFactory: () => new SockJS(`${this.BASE_URL}/ws`),
        connectHeaders: token ? { Authorization: `Bearer ${token}` } : {},
        debug: (str) => console.debug('[STOMP]', str),
        reconnectDelay: 5000,
      });

      this.client.onConnect = () => {
        this.subscription = this.client!.subscribe('/topic/global', (message: IMessage) => {
          try {
            onMessage(JSON.parse(message.body));
          } catch {
            console.warn('Invalid chat message payload:', message.body);
          }
        });
        resolve();
      };

      this.client.onStompError = (frame) => {
        console.error('Broker STOMP error:', frame.headers['message'], frame.body);
        reject(new Error(frame.headers['message']));
      };

      this.client.activate();
    });
  }

  disconnect(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
      this.subscription = null;
    }
    this.client?.deactivate();
    this.client = null;
  }

  send(content: string): void {
    if (!this.client || !this.client.connected) return;
    const token = localStorage.getItem('jwt_token') || '';
    const payload: ChatMsg = {
      sender: '',
      content,
      timestamp: Date.now(),
    };
    this.client.publish({
      destination: '/app/chat.send',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: JSON.stringify(payload),
    });
  }
}