import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService, ChatMsg } from './chat.service';
import { AuthService } from '../auth/services/auth.service';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { NavHeaderComponent } from '../shared/nav-header/nav-header.component';

@Component({
  selector: 'app-private-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, NavHeaderComponent],
  templateUrl: './private-chat.component.html',
  styleUrls: ['./private-chat.component.css']
})
export class PrivateChatComponent implements OnInit, OnDestroy {
  rooms: Array<{ id: number; room: { id: number; name: string } }> = [];
  selectedRoomId: number | null = null;
  newRoomName = '';
  inviteUsername = '';
  messages: ChatMsg[] = [];
  newMessage = '';
  connecting = false;
  selectedRoomName: string | null = null;
  currentUsername: string = '';
  editingMessageId: number | null = null;
  editContent: string = '';

  constructor(private chat: ChatService, private auth: AuthService, private router: Router, private location: Location) {}

  ngOnInit(): void {
    this.currentUsername = this.chat.getUsernameFromToken();
    this.auth.getMyRooms().subscribe({
      next: (memberships) => {
        this.rooms = memberships.map(m => ({ id: m.room.id, room: m.room }));
      }
    });
  }

  ngOnDestroy(): void {
    this.chat.disconnect();
  }

  createRoom(): void {
    const name = (this.newRoomName || '').trim();
    if (!name) return;
    this.auth.createRoom(name).subscribe({
      next: (room) => {
        this.rooms.push({ id: room.id, room: { id: room.id, name: room.name } });
        this.newRoomName = '';
      }
    });
  }

  joinRoom(roomId: number): void {
    this.selectedRoomId = roomId;
    const room = this.rooms.find(r => r.id === roomId);
    this.selectedRoomName = room?.room.name || null;
    this.messages = [];
    this.connecting = true;

    this.chat.getRoomMessages(roomId).subscribe({
      next: (msgs: ChatMsg[]) => this.messages = msgs || []
    });

    this.chat.connectToRoom(roomId, (msg) => this.messages.push(msg)).then(() => {
      this.connecting = false;
    });
  }

  canEdit(m: ChatMsg): boolean {
    return !!m.id && m.sender === this.currentUsername;
  }

  startEdit(m: ChatMsg): void {
    if (!this.canEdit(m)) return;
    this.editingMessageId = m.id!;
    this.editContent = m.content;
  }

  cancelEdit(): void {
    this.editingMessageId = null;
    this.editContent = '';
  }

  saveEdit(m: ChatMsg): void {
    if (!this.canEdit(m) || !this.editContent.trim()) return;
    this.chat.updateMessage(m.id!, this.editContent.trim()).subscribe({
      next: (updated: ChatMsg) => {
        const idx = this.messages.findIndex(x => x.id === m.id);
        if (idx >= 0) this.messages[idx] = { ...this.messages[idx], ...updated };
        this.cancelEdit();
      }
    });
  }

  delete(m: ChatMsg): void {
    if (!this.canEdit(m)) return;
    this.chat.deleteMessage(m.id!).subscribe({
      next: () => {
        this.messages = this.messages.filter(x => x.id !== m.id);
      }
    });
  }

  send(): void {
    if (!this.selectedRoomId) return;
    const text = (this.newMessage || '').trim();
    if (!text) return;
    this.chat.sendToRoom(this.selectedRoomId, text);
    this.newMessage = '';
    this.chat.getRoomMessages(this.selectedRoomId).subscribe({
      next: (msgs: ChatMsg[]) => this.messages = msgs || this.messages
    });
  }

  // Navegação
  irParaPrivado(): void {
    this.router.navigate(['/private-chat']);
  }

  irParaColetivo(): void {
    this.router.navigate(['/chat']);
  }

  cancelar(): void {
    this.newMessage = '';
    this.inviteUsername = '';
    this.cancelEdit();
  }

  voltar(): void {
    this.location.back();
  }
  invite(): void {
      if (!this.selectedRoomId) return;
      const username = (this.inviteUsername || '').trim();
      if (!username) return;
      this.auth.inviteToRoom(this.selectedRoomId, username).subscribe({
          next: () => {
              this.inviteUsername = '';
              alert('Convite enviado!');
          }
      });
  }
}