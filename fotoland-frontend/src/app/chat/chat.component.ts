import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService, ChatMsg } from './chat.service';
import { AuthService } from '../auth/services/auth.service';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { NavHeaderComponent } from '../shared/nav-header/nav-header.component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, NavHeaderComponent, TranslateModule],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit, OnDestroy {
  messages: ChatMsg[] = [];
  newMessage: string = '';
  connecting: boolean = true;
  currentUsername: string = '';
  editingMessageId: number | null = null;
  editContent: string = '';

  constructor(private chat: ChatService, private router: Router, private location: Location, public authService: AuthService) {}

  async ngOnInit() {
    this.authService.getMe().subscribe({
      next: (u: any) => this.currentUsername = u?.username || u?.email || '',
      error: () => this.currentUsername = '',
    });
    this.connecting = true;
    try {
      await this.chat.connect((msg) => {
        // Evita duplicatas se o backend enviar via socket o que já está na lista
        const exists = this.messages.some(m => m.id && m.id === msg.id);
        if (!exists) {
          this.messages.push(msg);
        }
      });
    } finally {
      this.connecting = false;
    }
  }

  ngOnDestroy(): void {
    this.chat.disconnect();
  }

  send(): void {
    const text = (this.newMessage || '').trim();
    if (!text) return;
    this.chat.send(text);
    this.newMessage = '';
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
      },
      error: (err) => console.error('Erro ao editar mensagem:', err)
    });
  }

  delete(m: ChatMsg): void {
    if (!this.canEdit(m)) return;
    if (!confirm('Deseja excluir esta mensagem?')) return;
    this.chat.deleteMessage(m.id!).subscribe({
      next: () => {
        this.messages = this.messages.filter(x => x.id !== m.id);
      },
      error: (err) => console.error('Erro ao excluir mensagem:', err)
    });
  }

  irParaPrivado(): void {
    this.router.navigate(['/private-chat']);
  }

  irParaColetivo(): void {
    this.router.navigate(['/chat']);
  }

  cancelar(): void {
    this.newMessage = '';
    this.cancelEdit();
  }

  voltar(): void {
    this.location.back();
  }
}
