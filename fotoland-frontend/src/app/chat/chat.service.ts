import { Injectable } from '@angular/core';
import { Client, IMessage, StompSubscription } from '@stomp/stompjs';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ChatMsg {
  sender: string;
  content: string;
  timestamp: number;
  id?: number;
  roomId?: number;
  profilePictureUrl?: string;
  username?: string; // alias opcional para compatibilidade de template
  text?: string;     // alias opcional para compatibilidade de template
}

@Injectable({ providedIn: 'root' })
export class ChatService {
  private client: Client | null = null;
  private globalSubscription: StompSubscription | null = null;
  private globalOnMessageCallback: ((msg: ChatMsg) => void) | null = null;
  private subscription: StompSubscription | null = null; // Adicionado para gerenciar a subscrição da sala

  private readonly BASE_URL_OVERRIDE = (typeof window !== 'undefined' ? localStorage.getItem('backend_base_url') : null);
  private readonly BASE_URL = (
    this.BASE_URL_OVERRIDE
      ? this.BASE_URL_OVERRIDE
      : (/^(localhost|127\.0\.0\.1|0\.0\.0\.0)$/.test(window.location.hostname)
          ? 'http://localhost:8080'
          : 'https://fotoland-backend.onrender.com')
  ).replace(/:+$/, '');

  connect(onMessage: (msg: ChatMsg) => void): Promise<void> {
    this.globalOnMessageCallback = onMessage;

    return new Promise((resolve, reject) => {
      if (this.client && this.client.connected) {
        // Já conectado, apenas atualiza o callback e resolve
        resolve();
        return;
      }

      const token = localStorage.getItem('jwt_token') || '';

      // Escolhe o esquema ws/wss baseado no protocolo atual
      const scheme = window.location.protocol === 'https:' ? 'wss' : 'ws';
      const wsBase = this.BASE_URL.replace(/^http(s)?:/, `${scheme}:`);
      const url = `${wsBase}/ws-native`;

      this.client = new Client({
        webSocketFactory: () => new WebSocket(url),
        connectHeaders: token ? { Authorization: `Bearer ${token}` } : {},
        debug: (str) => console.debug('[STOMP]', str),
        reconnectDelay: 5000,
      });

      this.client.onConnect = () => {
        this.globalSubscription = this.client!.subscribe('/topic/global', (message: IMessage) => {
          try {
            if (this.globalOnMessageCallback) {
              this.globalOnMessageCallback(JSON.parse(message.body));
            }
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
    if (this.globalSubscription) {
      this.globalSubscription.unsubscribe();
      this.globalSubscription = null;
    }
    if (this.client) {
      this.client.deactivate();
      this.client = null;
    }
    this.globalOnMessageCallback = null;
  }

  connectToRoom(roomId: number, onMessage: (msg: ChatMsg) => void): Promise<void> {
    if (!this.client || !this.client.connected) {
      // Se não estiver conectado, tenta conectar primeiro (sem callback global)
      return this.connect(() => {}).then(() => this._connectToRoom(roomId, onMessage));
    }
    return this._connectToRoom(roomId, onMessage);
  }

  private _connectToRoom(roomId: number, onMessage: (msg: ChatMsg) => void): Promise<void> {
    // Desinscreve de qualquer subscrição de sala anterior para evitar duplicação
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    this.subscription = this.client!.subscribe(`/topic/room.${roomId}`, (message: IMessage) => {
      try {
        onMessage(JSON.parse(message.body));
      } catch {
        console.warn('Invalid chat room message payload:', message.body);
      }
    });
    return Promise.resolve();
  }

  // Ajuste da interface para permitir CRUD
  // (id e roomId podem vir do backend)
  constructor(private http: HttpClient) {}

  getRoomMessages(roomId: number): Observable<ChatMsg[]> {
    return this.http.get<ChatMsg[]>(`${this.BASE_URL}/api/chat/rooms/${roomId}/messages`);
  }

  updateMessage(messageId: number, content: string): Observable<ChatMsg> {
    return this.http.put<ChatMsg>(`${this.BASE_URL}/api/chat/messages/${messageId}`, { content });
  }

  deleteMessage(messageId: number): Observable<void> {
    return this.http.delete<void>(`${this.BASE_URL}/api/chat/messages/${messageId}`);
  }

  send(content: string): void {
    if (!this.client || !this.client.connected) return;
    const token = localStorage.getItem('jwt_token') || '';
    const payload: ChatMsg = {
      sender: this.getUsernameFromToken(),
      content,
      timestamp: Date.now(),
    };
    this.client.publish({
      destination: '/app/chat.send',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: JSON.stringify(payload),
    });
  }

  sendToRoom(roomId: number, content: string): void {
    if (!this.client || !this.client.connected) return;
    const token = localStorage.getItem('jwt_token') || '';
    const payload: ChatMsg = {
      sender: this.getUsernameFromToken(),
      content,
      timestamp: Date.now(),
      roomId
    };
    this.client.publish({
      destination: '/app/chat.room.send',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: JSON.stringify(payload),
    });
  }

  getUsernameFromToken(): string {
    const token = localStorage.getItem('jwt_token') || '';
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return 'me';
      // Handle URL-safe base64
      const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      const padded = base64.padEnd(base64.length + (4 - (base64.length % 4)) % 4, '=');
      const payload = JSON.parse(atob(padded));
      return payload?.username || payload?.sub || 'me';
    } catch {
      return 'me';
    }
  }
}