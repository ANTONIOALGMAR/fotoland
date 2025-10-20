import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  credentials: any = {}; // Objeto para armazenar as credenciais do formulário

  constructor(private router: Router, private authService: AuthService) { }

  onSubmit(): void {
    this.authService.login(this.credentials).subscribe({
      next: (response) => {
        console.log('Login successful:', response);
        localStorage.setItem('jwt_token', response.jwt); // Salvar o token JWT
        alert('Login successful!');
        this.router.navigate(['/home']); // Redirecionar para a página principal
      },
      error: (error) => {
        console.error('Login failed:', error);
        alert('Login failed: ' + (error.error || error.message));
      }
    });
  }
}
