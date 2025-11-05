import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { CommonModule } from '@angular/common';
import { Location } from '@angular/common';
import { NavHeaderComponent } from '../../shared/nav-header/nav-header.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink, CommonModule, NavHeaderComponent],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  // Objeto para armazenar as credenciais informadas pelo usuário no formulário
  credentials = {
    username: '',
    password: ''
  };
  loading: boolean = false;
  errorMessage: string | null = null;

  // Injeta o roteador e o serviço de autenticação no construtor
  constructor(private router: Router, private authService: AuthService, private location: Location) {}

  // Método chamado quando o formulário é submetido
  onSubmit(): void {
    this.errorMessage = null;
    this.loading = true;
    this.authService.login(this.credentials).subscribe({
      next: (response) => {
        if (response.jwt) {
          localStorage.setItem('jwt_token', response.jwt);
          this.router.navigate(['/home']);
        } else {
          this.errorMessage = '⚠️ Falha no login: token não recebido do servidor';
        }
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
  voltar(): void { this.location.back(); }
}
