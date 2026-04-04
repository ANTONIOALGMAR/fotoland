import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { CommonModule } from '@angular/common';
import { Location } from '@angular/common';
import { NavHeaderComponent } from '../../shared/nav-header/nav-header.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink, CommonModule, NavHeaderComponent, TranslateModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  // Objeto para armazenar as credenciais informadas pelo usuário no formulário
  credentials = {
    username: '',
    password: ''
  };
  loading: boolean = false;
  errorMessage: string | null = null;
  currentLang: string = 'pt';
  showPassword: boolean = false;

  // Injeta o roteador e o serviço de autenticação no construtor
  constructor(
    private router: Router, 
    private authService: AuthService, 
    private location: Location,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.currentLang = this.translate.currentLang || this.translate.defaultLang || 'pt';
    this.translate.onLangChange.subscribe((event) => {
      this.currentLang = event.lang;
    });
  }

  changeLang(lang: string) {
    this.translate.use(lang);
    localStorage.setItem('selectedLang', lang);
  }

  // Método chamado quando o formulário é submetido
  onSubmit(): void {
    this.errorMessage = null;
    this.loading = true;
    this.authService.login(this.credentials).subscribe({
      next: () => {
        this.router.navigate(['/home']);
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
        console.error('❌ Erro ao tentar logar:', error);
        const status = (error && typeof error.status !== 'undefined') ? error.status : 0;
        const url = error?.url || 'URL de login';
        const detail = typeof error?.error === 'string'
          ? error.error
          : (error?.error?.message || error.message || 'Erro desconhecido');
        this.errorMessage = `Falha no login (status ${status}) em ${url}: ${detail}`;
        alert(this.errorMessage);
      }
    });
  }
  irParaPrivado(): void { this.router.navigate(['/private-chat']); }
  irParaColetivo(): void { this.router.navigate(['/chat']); }
  cancelar(): void { this.credentials = { username: '', password: '' }; this.errorMessage = null; }
  toggleShowPassword(): void { this.showPassword = !this.showPassword; }
  voltar(): void { this.location.back(); }
}
