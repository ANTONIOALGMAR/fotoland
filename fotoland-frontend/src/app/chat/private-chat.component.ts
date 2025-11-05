import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService, ChatMsg } from './chat.service';
import { AuthService } from '../auth/services/auth.service';

@Component({
  selector: 'app-private-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
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

  constructor(private chat: ChatService, private auth: AuthService) {}

  ngOnInit(): void {
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
    this.messages = [];
    this.connecting = true;
    this.chat.connectToRoom(roomId, (msg) => this.messages.push(msg)).then(() => {
      this.connecting = false;
    });
  }

  invite(): void {
    if (!this.selectedRoomId) return;
    const username = (this.inviteUsername || '').trim();
    if (!username) return;
    this.auth.inviteToRoom(this.selectedRoomId, username).subscribe(() => {
      this.inviteUsername = '';
      alert('Convite enviado!');
    });
  }

  send(): void {
    if (!this.selectedRoomId) return;
    const text = (this.newMessage || '').trim();
    if (!text) return;
    this.chat.sendToRoom(this.selectedRoomId, text);
    this.newMessage = '';
  }
}