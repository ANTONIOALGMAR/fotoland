import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavHeaderComponent } from '../shared/nav-header/nav-header.component';
import { Notification as ApiNotification, Page } from '../../../../api.models';
import { NotificationService } from '../shared/services/notification.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, NavHeaderComponent, TranslateModule],
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.css']
})
export class NotificationsComponent implements OnInit {
  loading = true;
  error: string | null = null;
  notifications: ApiNotification[] = [];

  constructor(
    private notificationService: NotificationService,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.load();
    this.notificationService.resetGeneralNotificationCount();
    this.notificationService.resetChatInviteCount();
  }

  load(): void {
    this.loading = true;
    this.notificationService.getNotifications().subscribe({
      next: (response: Page<ApiNotification>) => { this.notifications = response.content; this.loading = false; },
      error: (err) => { console.error(err); this.error = this.translate.instant('COMMON.ERROR_LOAD'); this.loading = false; }
    });
  }

  markAsRead(n: ApiNotification): void {
    this.notificationService.markAsRead(n.id).subscribe({
      next: () => { n.readAt = new Date().toISOString(); },
      error: (err) => { console.error(err); alert(this.translate.instant('COMMON.ERROR_ACTION')); }
    });
  }

  delete(id: number): void {
    if (!confirm(this.translate.instant('NOTIFICATIONS.DELETE_CONFIRM'))) return;
    this.notificationService.delete(id).subscribe({
      next: () => { this.notifications = this.notifications.filter(n => n.id !== id); },
      error: (err) => { console.error(err); alert(this.translate.instant('COMMON.ERROR_ACTION')); }
    });
  }

  deleteAll(): void {
    if (!confirm(this.translate.instant('NOTIFICATIONS.DELETE_ALL_CONFIRM'))) return;
    this.notificationService.deleteAll().subscribe({
      next: () => { this.notifications = []; },
      error: (err) => { console.error(err); alert(this.translate.instant('COMMON.ERROR_ACTION')); }
    });
  }

  getNotificationMessage(notification: ApiNotification): { key: string, params: any } {
    try {
      const payload = JSON.parse(notification.payload);
      switch (notification.type) {
        case 'CHAT_INVITE':
          return { key: 'NOTIFICATIONS.MSG_CHAT_INVITE', params: { username: payload.senderUsername } };
        case 'CHAT_MESSAGE':
          return { key: 'NOTIFICATIONS.MSG_CHAT_MESSAGE', params: { username: payload.senderUsername, room: payload.chatRoomName } };
        case 'POST_COMMENT':
          return { key: 'NOTIFICATIONS.MSG_POST_COMMENT', params: { username: payload.commenterUsername, content: payload.commentContent } };
        case 'POST_LIKE':
          return { key: 'NOTIFICATIONS.MSG_POST_LIKE', params: { username: payload.likerUsername } };
        case 'FOLLOW':
          return { key: 'NOTIFICATIONS.MSG_FOLLOW', params: { username: payload.followerUsername } };
        case 'COMMENT_LIKE':
          return { key: 'NOTIFICATIONS.MSG_COMMENT_LIKE', params: { username: payload.likerUsername, content: payload.commentContent } };
        default:
          return { key: 'NOTIFICATIONS.MSG_UNKNOWN', params: { type: notification.type } };
      }
    } catch (e) {
      console.error('Error parsing notification payload:', e);
      return { key: 'NOTIFICATIONS.MSG_UNKNOWN', params: { type: notification.type } };
    }
  }
}
