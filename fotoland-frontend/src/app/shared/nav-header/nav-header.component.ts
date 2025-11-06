import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../services/notification.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-nav-header',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="flex gap-2 mb-3 items-center">
      <h2 *ngIf="title" class="font-semibold mr-4">{{ title }}</h2>
      <button *ngIf="showChatNav && showPrivateNav" (click)="navigatePrivate.emit()" class="bg-blue-600 text-white px-3 py-1 rounded">Ir para privado</button>
      <button *ngIf="showChatNav && showGroupNav" (click)="navigateGroup.emit()" class="bg-indigo-600 text-white px-3 py-1 rounded">Ir para coletivo</button>
      <button *ngIf="showCancel" (click)="cancel.emit()" [disabled]="disableCancel" class="bg-gray-500 text-white px-3 py-1 rounded disabled:opacity-50">Cancelar</button>
      <button *ngIf="showBack" (click)="back.emit()" class="bg-gray-700 text-white px-3 py-1 rounded">Voltar</button>

      <a routerLink="/notifications" class="relative ml-auto p-2 text-gray-600 hover:text-gray-900">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
          <path stroke-linecap="round" stroke-linejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.248 24.248 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
        </svg>
        <span *ngIf="totalNotifications > 0" class="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full">{{ totalNotifications }}</span>
      </a>
    </div>
  `
})
export class NavHeaderComponent implements OnInit {
  @Input() title = '';
  @Input() disableCancel = false;
  @Input() showChatNav = false;
  @Input() showPrivateNav = true;
  @Input() showGroupNav = true;
  @Input() showCancel = true;
  @Input() showBack = true;

  @Output() navigatePrivate = new EventEmitter<void>();
  @Output() navigateGroup = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();
  @Output() back = new EventEmitter<void>();

  totalNotifications: number = 0;
  chatInviteCount: number = 0;
  chatMessageCount: number = 0;

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.notificationService.chatInviteCount$.subscribe(count => {
      this.chatInviteCount = count;
      this.updateTotalNotifications();
    });

    this.notificationService.chatMessageCount$.subscribe(count => {
      this.chatMessageCount = count;
      this.updateTotalNotifications();
    });
  }

  updateTotalNotifications(): void {
    this.totalNotifications = this.chatInviteCount + this.chatMessageCount;
  }
}