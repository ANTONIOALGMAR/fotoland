import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  user = {
    name: '',
    email: '',
    password: '',
    profilePictureUrl: ''
  };
  
  selectedFile: File | null = null;
  selectedFileName = '';
  imagePreview: string | ArrayBuffer | null = null;
  isSubmitting = false;

  constructor(private router: Router, private authService: AuthService) {}

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    
    if (file) {
      this.selectedFile = file;
      this.selectedFileName = file.name;

      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result;
      };
      reader.readAsDataURL(file);
    }
  }

  async onSubmit(): Promise<void> {
    if (this.isSubmitting) return; // evita duplo clique
    this.isSubmitting = true;

    try {
      // Se o usuário escolheu uma imagem, faz upload primeiro
      if (this.selectedFile) {
        const uploadResponse = await this.authService.uploadProfilePicture(this.selectedFile).toPromise();
        this.user.profilePictureUrl = uploadResponse?.fileUrl || '';
      }

      // Em seguida, registra o usuário
      const response = await this.authService.register(this.user).toPromise();
      console.log('Usuário registrado com sucesso:', response);
      alert('Cadastro realizado com sucesso!');
      this.router.navigate(['/login']);
    } catch (error) {
      console.error('Erro no cadastro:', error);
      if (error instanceof HttpErrorResponse) {
        alert('Falha no cadastro: ' + (error.error?.message || error.message));
      } else {
        alert('Ocorreu um erro inesperado. Tente novamente.');
      }
    } finally {
      this.isSubmitting = false;
    }
  }
}
