import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../auth/services/auth.service';
import { NavHeaderComponent } from '../shared/nav-header/nav-header.component';
import { Notification as AppNotification } from '../../../../api.models';

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
  notifications: AppNotification[] = [];

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.authService.getMyNotifications().subscribe({
      next: (items: AppNotification[]) => { this.notifications = items; this.loading = false; },
      error: (err) => { console.error(err); this.error = 'Falha ao carregar notificações.'; this.loading = false; }
    });
  }

  markAsRead(n: AppNotification): void {
    this.authService.markNotificationAsRead(n.id).subscribe({
      next: () => { n.read = true; },
      error: (err) => { console.error(err); alert('Falha ao marcar como lida.'); }
    });
  }
}