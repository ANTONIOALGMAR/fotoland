import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../auth/services/auth.service';
import { User } from '../../../../api.models';
import { NavHeaderComponent } from '../shared/nav-header/nav-header.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, NavHeaderComponent],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  user: User | null = null;
  loading = true;
  saving = false;

  // Representação editável, inclui campos extras que não existem no tipo User
  form: { fullName: string; username: string; phoneNumber?: string; address?: string; profilePictureUrl?: string } = {
    fullName: '',
    username: '',
    phoneNumber: '',
    address: '',
    profilePictureUrl: ''
  };

  selectedFile: File | null = null;
  selectedFileName = '';
  imagePreview: string | null = null;

  constructor(public authService: AuthService) {}

  ngOnInit(): void {
    this.authService.getMe().subscribe({
      next: (u) => {
        this.user = u;
        this.form.fullName = u.fullName ?? '';
        this.form.username = u.username ?? '';
        // Copia campos extras se existirem
        this.form.phoneNumber = (u as any)?.phoneNumber ?? '';
        this.form.address = (u as any)?.address ?? '';
        this.form.profilePictureUrl = (u as any)?.profilePictureUrl ?? '';
        this.loading = false;
      },
      error: () => { this.loading = false; alert('Falha ao carregar perfil'); }
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] || null;
    this.selectedFile = file;
    this.selectedFileName = file ? file.name : '';
    if (file) {
      const reader = new FileReader();
      reader.onload = () => this.imagePreview = reader.result as string;
      reader.readAsDataURL(file);
    } else {
      this.imagePreview = null;
    }
  }

  uploadProfilePicture(): void {
    if (!this.selectedFile) { alert('Selecione uma imagem'); return; }
    this.saving = true;
    this.authService.uploadProfilePicture(this.selectedFile).subscribe({
      next: (res) => {
        this.form.profilePictureUrl = res.fileUrl;
        this.saving = false;
        alert('Foto atualizada!');
      },
      error: (err) => { this.saving = false; console.error(err); alert('Falha ao enviar foto'); }
    });
  }

  saveProfile(): void {
    this.saving = true;
    this.authService.updateMe(this.form).subscribe({
      next: (u) => {
        this.user = u;
        this.saving = false;
        alert('Perfil salvo!');
      },
      error: (err) => { this.saving = false; console.error(err); alert('Falha ao salvar perfil'); }
    });
  }
}