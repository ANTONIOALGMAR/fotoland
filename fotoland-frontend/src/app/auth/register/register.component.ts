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

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (file) {
      // Validação de tipo e tamanho (até 10MB)
      const MAX_FILE_SIZE_MB = 10;
      if (!file.type.startsWith('image/')) {
        alert('Por favor, selecione um arquivo de imagem.');
        this.selectedFile = null;
        this.selectedFileName = '';
        this.imagePreview = null;
        return;
      }
      if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        alert(`Arquivo excede ${MAX_FILE_SIZE_MB}MB. Escolha um menor.`);
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
  }

  async onSubmit(): Promise<void> {
    if (this.isSubmitting) return; // evita duplo clique
    this.isSubmitting = true;
  
    try {
      // Se o usuário escolheu uma imagem, faz upload primeiro
      if (this.selectedFile) {
        try {
          const uploadResponse = await this.authService.uploadProfilePicture(this.selectedFile).toPromise();
          this.user.profilePictureUrl = uploadResponse?.fileUrl || '';
        } catch (uploadError) {
          console.error('Falha no upload, prosseguindo sem foto:', uploadError);
          this.user.profilePictureUrl = '';
        }
      }
  
      // Em seguida, registra o usuário
      const response = await this.authService.register(this.user).toPromise();
      console.log('Usuário registrado com sucesso:', response);
      alert('Cadastro realizado com sucesso!');
      this.router.navigate(['/login']);
    } catch (error) {
      console.error('Erro no cadastro:', error);
      if (error instanceof HttpErrorResponse) {
        const detail =
          typeof error.error === 'string'
            ? error.error
            : (error.error?.message || error.message);
        alert('Falha no cadastro: ' + detail);
      } else {
        alert('Ocorreu um erro inesperado. Tente novamente.');
      }
    } finally {
      this.isSubmitting = false;
    }
  }
}
