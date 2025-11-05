import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-nav-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex gap-2 mb-3 items-center">
      <h2 *ngIf="title" class="font-semibold mr-4">{{ title }}</h2>
      <button *ngIf="showChatNav" (click)="navigatePrivate.emit()" class="bg-blue-600 text-white px-3 py-1 rounded">Ir para privado</button>
      <button *ngIf="showChatNav" (click)="navigateGroup.emit()" class="bg-indigo-600 text-white px-3 py-1 rounded">Ir para coletivo</button>
      <button (click)="cancel.emit()" [disabled]="disableCancel" class="bg-gray-500 text-white px-3 py-1 rounded disabled:opacity-50">Cancelar</button>
      <button (click)="back.emit()" class="bg-gray-700 text-white px-3 py-1 rounded">Voltar</button>
    </div>
  `
})
export class NavHeaderComponent {
  @Input() title = '';
  @Input() disableCancel = false;
  @Input() showChatNav = false;

  @Output() navigatePrivate = new EventEmitter<void>();
  @Output() navigateGroup = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();
  @Output() back = new EventEmitter<void>();
}