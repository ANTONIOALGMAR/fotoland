import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-chat-invite-alert',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  template: `
    <div *ngIf="invite" class="fixed bottom-4 right-4 bg-white shadow-xl border-2 border-indigo-500 p-4 rounded-xl z-50 max-w-sm animate-bounce-in">
      <div class="flex items-center gap-3 mb-2">
        <div class="bg-indigo-100 p-2 rounded-full text-indigo-600">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
          </svg>
        </div>
        <h3 class="font-bold text-gray-800">Novo Convite de Chat</h3>
      </div>
      <p class="text-sm text-gray-600 mb-4">
        <strong>{{ invite.senderUsername }}</strong> convidou você para entrar na sala <strong>{{ invite.chatRoomName }}</strong>.
      </p>
      <div class="flex gap-2">
        <button (click)="onAccept()" class="flex-1 bg-indigo-600 text-white text-xs font-bold py-2 rounded-lg hover:bg-indigo-700 transition-colors">Aceitar</button>
        <button (click)="onDecline()" class="flex-1 bg-gray-100 text-gray-600 text-xs font-bold py-2 rounded-lg hover:bg-gray-200 transition-colors">Ignorar</button>
      </div>
    </div>
  `,
  styles: [`
    @keyframes bounce-in {
      0% { transform: scale(0.3); opacity: 0; }
      50% { transform: scale(1.05); }
      70% { transform: scale(0.9); }
      100% { transform: scale(1); opacity: 1; }
    }
    .animate-bounce-in { animation: bounce-in 0.5s ease-out; }
  `]
})
export class ChatInviteAlertComponent {
  @Input() invite: any;
  @Output() accept = new EventEmitter<any>();
  @Output() decline = new EventEmitter<any>();

  onAccept(): void {
    this.accept.emit(this.invite);
  }

  onDecline(): void {
    this.decline.emit(this.invite);
  }
}
