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
    fullName: '', // Adicionado
    username: '', // Adicionado
    password: '',
    phoneNumber: '', // Adicionado
    address: '', // Adicionado
    profilePictureUrl: ''
  };
  
  selectedFile: File | null = null;
  selectedFileName = '';
  imagePreview: string | ArrayBuffer | null = null;
  isSubmitting = false;

  constructor(private router: Router, private authService: AuthService) {}

  irParaPrivado(): void { this.router.navigate(['/private-chat']); }
  irParaColetivo(): void { this.router.navigate(['/chat']); }
  cancelar(): void {
    this.user = { fullName: '', username: '', password: '', phoneNumber: '', address: '', profilePictureUrl: '' };
    this.selectedFile = null;
    this.selectedFileName = '';
    this.imagePreview = null;
    this.isSubmitting = false;
  }
  voltar(): void { history.back(); }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input?.files?.[0] || null;
    if (!file) {
      this.selectedFile = null;
      this.selectedFileName = '';
      this.imagePreview = null;
      return;
    }
    this.selectedFile = file;
    this.selectedFileName = file.name;

    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview = reader.result;
    };
    reader.readAsDataURL(file);
  }

  onSubmit(): void {
    if (this.isSubmitting) return;
    this.isSubmitting = true;

    const afterUploadAndRegister = () => {
      // Primeiro registra o usuário
      this.authService.register(this.user).subscribe({
        next: () => {
          // Em seguida faz login automático com as credenciais informadas
          this.authService.login({
            username: this.user.username,
            password: this.user.password
          }).subscribe({
            next: (resp) => {
              if (resp.jwt) {
                localStorage.setItem('jwt_token', resp.jwt);
                alert('✅ Conta criada e login efetuado!');
                this.router.navigate(['/home']);
              } else {
                alert('⚠️ Registro ok, mas falha ao logar automaticamente. Faça login manualmente.');
                this.router.navigate(['/login']);
              }
              this.isSubmitting = false;
            },
            error: (err) => {
              console.error('Erro ao fazer login pós-registro:', err);
              alert('⚠️ Registro ok, mas falha ao logar automaticamente. Faça login manualmente.');
              this.isSubmitting = false;
              this.router.navigate(['/login']);
            }
          });
        },
        error: (error: HttpErrorResponse) => {
          this.isSubmitting = false;
          console.error('Erro no registro:', error);
          const detail = typeof error?.error === 'string'
            ? error.error
            : (error?.error?.message || error.message || 'Erro desconhecido');
          alert(`❌ Falha no registro: ${detail}`);
        }
      });
    };

    if (this.selectedFile) {
      this.authService.uploadProfilePicture(this.selectedFile).subscribe({
        next: (res) => {
          this.user.profilePictureUrl = res.fileUrl;
          afterUploadAndRegister();
        },
        error: (error: HttpErrorResponse) => {
          this.isSubmitting = false;
          console.error('Erro ao enviar foto de perfil:', error);
          const detail = typeof error?.error === 'string'
            ? error.error
            : (error?.error?.message || error.message || 'Erro no upload');
          alert(`❌ Falha ao enviar a foto: ${detail}`);
        }
      });
    } else {
      afterUploadAndRegister();
    }
  }
}
