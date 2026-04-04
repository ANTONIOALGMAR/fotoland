import { Component, EventEmitter, Input, Output, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../services/notification.service';
import { RouterLink } from '@angular/router';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../auth/services/auth.service';
import { ThemeService } from '../services/theme.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-nav-header',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslateModule],
  template: `
    <div class="flex flex-col gap-2 mb-4 w-full bg-emerald-50/90 dark:bg-slate-900/90 backdrop-blur-md p-3 rounded-2xl border border-emerald-100 dark:border-slate-800 shadow-sm transition-colors duration-300" [ngClass]="{'pl-14': shouldPad && !isMobile, 'pl-2': isMobile}">
      
      <!-- Linha Superior: Título e Notificações -->
      <div class="flex items-center justify-between w-full">
        <h2 *ngIf="!isAuthenticated" class="font-bold text-emerald-700 dark:text-emerald-500 italic text-sm sm:text-lg">Bem-vindo ao Fotoland</h2>
        <h2 *ngIf="isAuthenticated && title" class="font-bold text-gray-800 dark:text-slate-100 text-lg lg:text-xl truncate max-w-[150px] sm:max-w-none">{{ title }}</h2>

        <div class="flex items-center space-x-1" *ngIf="isAuthenticated">
          <!-- Mensagens (Azul) -->
          <a routerLink="/private-chat" class="relative p-1.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-full transition-all" title="Mensagens">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5 md:w-6 md:h-6">
              <path stroke-linecap="round" stroke-linejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3.091-3.091c-.333-.03-.662-.065-.99-.103l-4.578-.512a2.25 2.25 0 01-1.98-2.253V10.608c0-.969.616-1.813 1.5-2.097a17.523 17.523 0 0110.5 0z" />
            </svg>
            <span *ngIf="chatMessageCount > 0" class="absolute top-0.5 right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-red-600 text-[8px] font-bold text-white ring-1 ring-white">{{ chatMessageCount }}</span>
          </a>

          <!-- Convites (Índigo) -->
          <a routerLink="/notifications" class="relative p-1.5 text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-full transition-all" title="Convites">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5 md:w-6 md:h-6">
              <path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
            </svg>
            <span *ngIf="chatInviteCount > 0" class="absolute top-0.5 right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-red-600 text-[8px] font-bold text-white ring-1 ring-white">{{ chatInviteCount }}</span>
          </a>

          <!-- Catálogo (Verde Esmeralda) -->
          <a [routerLink]="['/explore']" [queryParams]="{tab: 'catalog'}" class="relative p-1.5 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-full transition-all" title="Catálogo de Membros">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5 md:w-6 md:h-6">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.25 0 11-5.25 0 2.625 2.25 0 015.25 0z" />
            </svg>
          </a>

          <!-- Notificações (Laranja/Vermelho) -->
          <a routerLink="/notifications" class="relative p-1.5 text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/30 rounded-full transition-all" title="Notificações">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5 md:w-6 md:h-6">
              <path stroke-linecap="round" stroke-linejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.248 24.248 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
            </svg>
            <span *ngIf="generalNotificationCount > 0" class="absolute top-0.5 right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-red-600 text-[8px] font-bold text-white ring-1 ring-white">{{ generalNotificationCount }}</span>
          </a>
        </div>
      </div>

      <!-- Linha Inferior: Botões de Ação e Idioma -->
      <div class="flex items-center justify-start gap-2 w-full overflow-x-auto pb-1 no-scrollbar">
        <ng-container *ngIf="isAuthenticated">
          <div class="flex gap-1">
            <button *ngIf="showChatNav && showPrivateNav" (click)="navigatePrivate.emit()" class="bg-blue-600 text-white px-2 py-1.5 rounded-lg text-[10px] sm:text-xs font-bold whitespace-nowrap shadow-sm hover:bg-blue-700 transition-colors">Privado</button>
            <button *ngIf="showChatNav && showGroupNav" (click)="navigateGroup.emit()" class="bg-indigo-600 text-white px-2 py-1.5 rounded-lg text-[10px] sm:text-xs font-bold whitespace-nowrap shadow-sm hover:bg-indigo-700 transition-colors">Coletivo</button>
          </div>

          <button *ngIf="showCancel" (click)="cancel.emit()" [disabled]="disableCancel" class="bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-300 px-2 py-1.5 rounded-lg border border-emerald-200 dark:border-slate-700 disabled:opacity-50 text-[10px] sm:text-xs font-bold whitespace-nowrap shadow-sm hover:bg-emerald-50 dark:hover:bg-slate-700 transition-colors">Cancelar</button>
          <button *ngIf="showBack" (click)="back.emit()" class="bg-gray-800 dark:bg-slate-700 text-white px-2 py-1.5 rounded-lg text-[10px] sm:text-xs font-bold whitespace-nowrap shadow-sm hover:bg-black dark:hover:bg-slate-600 transition-colors">Voltar</button>
        </ng-container>

        <div class="flex items-center gap-2" [ngClass]="{'ml-auto': isAuthenticated}">
          <!-- Theme Toggle -->
          <button (click)="themeService.toggleTheme()" class="p-1.5 text-gray-500 dark:text-yellow-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-all shadow-sm border border-emerald-50 dark:border-slate-800" [title]="themeService.isDarkMode() ? 'Modo Claro' : 'Modo Escuro'">
            <svg *ngIf="!themeService.isDarkMode()" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4 sm:w-5 sm:h-5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
            </svg>
            <svg *ngIf="themeService.isDarkMode()" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4 sm:w-5 sm:h-5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v2.25m0 13.5V21m8.25-9h2.25m-13.5 0H3m15.364-6.364l-1.591 1.591M6.75 16.5l-1.591 1.591m12.728 0l-1.591-1.591M6.75 7.5l-1.591-1.591M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
            </svg>
          </button>

          <!-- Language Selector -->
          <div class="flex items-center bg-gray-100 dark:bg-slate-800 p-1 rounded-xl border border-emerald-100 dark:border-slate-700 shadow-inner transition-colors duration-300">
            <button (click)="changeLang('pt')" 
              [class.bg-emerald-600]="currentLang === 'pt'" 
              [class.text-white]="currentLang === 'pt'"
              [class.shadow-md]="currentLang === 'pt'"
              class="text-[10px] text-gray-500 dark:text-slate-400 px-2 py-1 rounded-lg uppercase tracking-wider font-bold transition-all duration-200">
              PT
            </button>
            <button (click)="changeLang('en')" 
              [class.bg-emerald-600]="currentLang === 'en'" 
              [class.text-white]="currentLang === 'en'"
              [class.shadow-md]="currentLang === 'en'"
              class="text-[10px] text-gray-500 dark:text-slate-400 px-2 py-1 rounded-lg uppercase tracking-wider font-bold transition-all duration-200">
              EN
            </button>
          </div>
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
    private authService: AuthService,
    public themeService: ThemeService
  ) {
    this.currentLang = translate.currentLang || translate.defaultLang || 'pt';
    this.checkScreenSize();
  }


  ngOnInit(): void {
    this.currentLang = this.translate.currentLang || this.translate.defaultLang || 'pt';
    this.translate.onLangChange.subscribe((event) => {
      this.currentLang = event.lang;
    });

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
