import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'] // Corrigido para styleUrls
})
export class LoginComponent {
  credentials: any = {}; // Objeto para armazenar as credenciais do formulário

  constructor(private router: Router, private authService: AuthService) { }

  onSubmit(): void {
    this.authService.login(this.credentials).subscribe({
      next: (response) => {
        console.log('Login successful:', response);
        if (response.jwt) {
          localStorage.setItem('jwt_token', response.jwt); // Salvar o token JWT
          alert('Login successful!');
          this.router.navigate(['/home']); // Redirecionar para a página principal
        } else {
          alert('Login failed: no token received');
        }
      },
      error: (error) => {
        console.error('Login failed:', error);
        alert('Login failed: ' + (error.error?.message || error.message || 'Unknown error'));
      }
    });
  }
}
