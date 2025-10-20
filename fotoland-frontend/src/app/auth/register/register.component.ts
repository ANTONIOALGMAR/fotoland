import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service'; // Importar AuthService

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  user: any = {}; // Objeto para armazenar os dados do formulário

  constructor(private router: Router, private authService: AuthService) { }

  onSubmit(): void {
    this.authService.register(this.user).subscribe({
      next: (response) => {
        console.log('User registered successfully:', response);
        alert('Registration successful!');
        this.router.navigate(['/login']);
      },
      error: (error) => {
        console.error('Registration failed:', error);
        alert('Registration failed: ' + (error.error.message || error.message));
      }
    });
  }
}
