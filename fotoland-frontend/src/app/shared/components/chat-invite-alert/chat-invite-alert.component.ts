import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-chat-invite-alert',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './chat-invite-alert.component.html',
  styleUrls: ['./chat-invite-alert.component.css']
})
export class ChatInviteAlertComponent {
  @Input() invite: any; // Pode ser um objeto com detalhes do convite
  @Output() accept = new EventEmitter<any>();
  @Output() decline = new EventEmitter<any>();

  onAccept(): void {
    this.accept.emit(this.invite);
  }

  onDecline(): void {
    this.decline.emit(this.invite);
  }
}
