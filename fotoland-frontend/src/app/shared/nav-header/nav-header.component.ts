import { Component, EventEmitter, Input, Output, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../services/notification.service';
import { RouterLink } from '@angular/router';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../auth/services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-nav-header',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslateModule],
  template: `
    <div class="flex flex-col gap-2 mb-4 w-full" [ngClass]="{'pl-14': shouldPad && !isMobile, 'pl-2': isMobile}">
      
      <!-- Linha Superior: Título e Notificações -->
      <div class="flex items-center justify-between w-full">
        <!-- Título principal: Se não logado, sempre mostra Bem-vindo. Se logado, mostra o título da página. -->
        <h2 *ngIf="!isAuthenticated" class="font-bold text-blue-600 italic text-sm sm:text-lg">Bem-vindo ao Fotoland</h2>
        <h2 *ngIf="isAuthenticated && title" class="font-bold text-gray-800 text-lg lg:text-xl truncate max-w-[150px] sm:max-w-none">{{ title }}</h2>

        <div class="flex items-center space-x-1" *ngIf="isAuthenticated">
          <!-- Ícone de Mensagens -->
          <a routerLink="/private-chat" class="relative p-1.5 text-gray-500 hover:text-blue-600 transition-all" title="Mensagens">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 md:w-6 md:h-6">
              <path stroke-linecap="round" stroke-linejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3.091-3.091c-.333-.03-.662-.065-.99-.103l-4.578-.512a2.25 2.25 0 01-1.98-2.253V10.608c0-.969.616-1.813 1.5-2.097a17.523 17.523 0 0110.5 0z" />
            </svg>
            <span *ngIf="chatMessageCount > 0" class="absolute top-0.5 right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-red-600 text-[8px] font-bold text-white ring-1 ring-white">{{ chatMessageCount }}</span>
          </a>

          <!-- Ícone de Convites -->
          <a routerLink="/notifications" class="relative p-1.5 text-gray-500 hover:text-indigo-600 transition-all" title="Convites">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 md:w-6 md:h-6">
              <path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
            </svg>
            <span *ngIf="chatInviteCount > 0" class="absolute top-0.5 right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-indigo-600 text-[8px] font-bold text-white ring-1 ring-white">{{ chatInviteCount }}</span>
          </a>

          <!-- Ícone Geral -->
          <a routerLink="/notifications" class="relative p-1.5 text-gray-500 hover:text-red-600 transition-all" title="Notificações">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 md:w-6 md:h-6">
              <path stroke-linecap="round" stroke-linejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.248 24.248 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
            </svg>
            <span *ngIf="generalNotificationCount > 0" class="absolute top-0.5 right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-red-600 text-[8px] font-bold text-white ring-1 ring-white">{{ generalNotificationCount }}</span>
          </a>
        </div>
      </div>

      <!-- Linha Inferior: Botões de Ação e Idioma -->
      <div class="flex items-center justify-start gap-2 w-full overflow-x-auto pb-1 no-scrollbar">
        <!-- Botões de ação mostrados APENAS se estiver logado -->
        <ng-container *ngIf="isAuthenticated">
          <div class="flex gap-1">
            <button *ngIf="showChatNav && showPrivateNav" (click)="navigatePrivate.emit()" class="bg-blue-600 text-white px-2 py-1.5 rounded-lg text-[10px] sm:text-xs font-bold whitespace-nowrap shadow-sm">Privado</button>
            <button *ngIf="showChatNav && showGroupNav" (click)="navigateGroup.emit()" class="bg-indigo-600 text-white px-2 py-1.5 rounded-lg text-[10px] sm:text-xs font-bold whitespace-nowrap shadow-sm">Coletivo</button>
          </div>

          <button *ngIf="showCancel" (click)="cancel.emit()" [disabled]="disableCancel" class="bg-white text-gray-600 px-2 py-1.5 rounded-lg border border-gray-300 disabled:opacity-50 text-[10px] sm:text-xs font-bold whitespace-nowrap shadow-sm">Cancelar</button>
          <button *ngIf="showBack" (click)="back.emit()" class="bg-gray-800 text-white px-2 py-1.5 rounded-lg text-[10px] sm:text-xs font-bold whitespace-nowrap shadow-sm">Voltar</button>
        </ng-container>

        <!-- Language Selector (Sempre disponível) -->
        <div class="flex items-center bg-gray-100 px-2 py-1.5 rounded-lg border border-gray-200" [ngClass]="{'ml-auto': isAuthenticated}">
          <button (click)="changeLang('pt')" [class.font-bold]="currentLang === 'pt'" [class.text-blue-600]="currentLang === 'pt'" class="text-[10px] text-gray-500 px-1 uppercase">PT</button>
          <span class="text-gray-300 text-[10px]">|</span>
          <button (click)="changeLang('en')" [class.font-bold]="currentLang === 'en'" [class.text-blue-600]="currentLang === 'en'" class="text-[10px] text-gray-500 px-1 uppercase">EN</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .no-scrollbar::-webkit-scrollbar { display: none; }
    .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
  `]
})
export class NavHeaderComponent implements OnInit, OnDestroy {
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
  generalNotificationCount: number = 0;
  currentLang: string = 'pt';
  
  shouldPad: boolean = false;
  isAuthenticated: boolean = false;
  isMobile: boolean = false;
  private authSubscription: Subscription = new Subscription();

  constructor(
    private notificationService: NotificationService, 
    private translate: TranslateService,
    private authService: AuthService
  ) {
    this.currentLang = translate.currentLang || translate.defaultLang || 'pt';
    this.checkScreenSize();
  }

  ngOnInit(): void {
    this.authSubscription = this.authService.isAuthenticated$.subscribe(status => {
      this.shouldPad = status;
      this.isAuthenticated = status;
    });

    this.notificationService.chatInviteCount$.subscribe(count => {
      this.chatInviteCount = count;
      this.updateTotalNotifications();
    });

    this.notificationService.chatMessageCount$.subscribe(count => {
      this.chatMessageCount = count;
      this.updateTotalNotifications();
    });

    this.notificationService.generalNotificationCount$.subscribe(count => {
      this.generalNotificationCount = count;
      this.updateTotalNotifications();
    });

    window.addEventListener('resize', () => this.checkScreenSize());
  }

  private checkScreenSize() {
    this.isMobile = window.innerWidth < 768;
  }

  ngOnDestroy(): void {
    this.authSubscription.unsubscribe();
    window.removeEventListener('resize', () => this.checkScreenSize());
  }

  updateTotalNotifications(): void {
    this.totalNotifications = this.chatInviteCount + this.chatMessageCount + this.generalNotificationCount;
  }

  changeLang(lang: string) {
    this.translate.use(lang);
    this.currentLang = lang;
    localStorage.setItem('selectedLang', lang);
  }
}
