import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavHeaderComponent } from '../shared/nav-header/nav-header.component';
import { Notification as ApiNotification, Page } from '../../../../api.models';
import { NotificationService } from '../shared/services/notification.service';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, NavHeaderComponent],
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.css']
})
export class NotificationsComponent implements OnInit {
  loading = true;
  error: string | null = null;
  notifications: ApiNotification[] = [];

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.notificationService.getNotifications().subscribe({
      next: (response: Page<ApiNotification>) => { this.notifications = response.content; this.loading = false; },
      error: (err) => { console.error(err); this.error = 'Falha ao carregar notificações.'; this.loading = false; }
    });
  }

  markAsRead(n: ApiNotification): void {
    this.notificationService.markAsRead(n.id).subscribe({
      next: () => { n.readAt = new Date().toISOString(); },
      error: (err) => { console.error(err); alert('Falha ao marcar como lida.'); }
    });
  }

  getNotificationMessage(notification: ApiNotification): string {
    try {
      const payload = JSON.parse(notification.payload);
      switch (notification.type) {
        case 'CHAT_INVITE':
          return `Você recebeu um convite de chat de ${payload.senderUsername}.`;
        case 'CHAT_MESSAGE':
          return `Nova mensagem de ${payload.senderUsername} no chat ${payload.chatRoomName}.`;
        case 'POST_COMMENT':
          return `${payload.commenterUsername} comentou na sua publicação: "${payload.commentContent}"`;
        case 'POST_LIKE':
          return `${payload.likerUsername} curtiu sua publicação.`;
        case 'COMMENT_LIKE':
          return `${payload.likerUsername} curtiu seu comentário: "${payload.commentContent}"`;
        default:
          return `Nova notificação: ${notification.type}`; // Fallback
      }
    } catch (e) {
      console.error('Error parsing notification payload:', e);
      return `Nova notificação (${notification.type})`;
    }
  }
}