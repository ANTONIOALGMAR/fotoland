import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService, ChatMsg } from './chat.service';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit, OnDestroy {
  messages: ChatMsg[] = [];
  newMessage: string = '';
  connecting: boolean = true;

  constructor(private chat: ChatService) {}

  async ngOnInit() {
    this.connecting = true;
    try {
      await this.chat.connect((msg) => this.messages.push(msg));
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
}