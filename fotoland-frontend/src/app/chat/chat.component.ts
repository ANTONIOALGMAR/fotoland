import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService, ChatMsg } from './chat.service';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { NavHeaderComponent } from '../shared/nav-header/nav-header.component';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, NavHeaderComponent],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit, OnDestroy {
  messages: ChatMsg[] = [];
  newMessage: string = '';
  connecting: boolean = true;

  constructor(private chat: ChatService, private router: Router, private location: Location) {}

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

  irParaPrivado(): void {
    this.router.navigate(['/private-chat']);
  }

  irParaColetivo(): void {
    this.router.navigate(['/chat']);
  }

  cancelar(): void {
    this.newMessage = '';
  }

  voltar(): void {
    this.location.back();
  }
}