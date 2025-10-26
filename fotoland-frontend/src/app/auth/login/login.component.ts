import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true, // Este componente não faz parte de um módulo, é independente
  imports: [FormsModule, RouterLink], // Importa o FormsModule (para ngModel) e RouterLink (para navegação entre rotas)
  templateUrl: './login.component.html', // Caminho do arquivo HTML do componente
  styleUrls: ['./login.component.css'] // Corrigido para "styleUrls" (plural)
})
export class LoginComponent {
  // Objeto para armazenar as credenciais informadas pelo usuário no formulário
  credentials = {
    username: '',
    password: ''
  };

  // Injeta o roteador e o serviço de autenticação no construtor
  constructor(private router: Router, private authService: AuthService) {}

  // Método chamado quando o formulário é submetido
  onSubmit(): void {
    // Chama o método "login" do AuthService, passando as credenciais digitadas
    this.authService.login(this.credentials).subscribe({
      next: (response) => {
        console.log('✅ Login realizado com sucesso:', response);

        // Verifica se o backend retornou um token JWT
        if (response.jwt) {
          // Salva o token JWT no armazenamento local do navegador (localStorage)
          localStorage.setItem('jwt_token', response.jwt);

          // Exibe uma mensagem de sucesso
          alert('Login realizado com sucesso!');

          // Redireciona o usuário para a rota "/home"
          this.router.navigate(['/home']);
        } else {
          // Caso o token não venha na resposta
          alert('⚠️ Falha no login: token não recebido do servidor');
        }
      },
      error: (error) => {
        console.error('❌ Erro ao tentar logar:', error);
        const status = (error && typeof error.status !== 'undefined') ? error.status : 0;
        const url = error?.url || 'URL de login';
        const detail = error?.error?.message || error.message || 'Erro desconhecido';
        alert(`Falha no login (status ${status}) em ${url}: ${detail}`);
      }
    });
  }
}
