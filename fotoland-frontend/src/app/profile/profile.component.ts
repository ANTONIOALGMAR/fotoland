import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../auth/services/auth.service';
import { User } from '../../../../api.models';
import { NavHeaderComponent } from '../shared/nav-header/nav-header.component';
import { CepService } from '../shared/services/cep.service'; // novo

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

  form: {
    fullName: string; username: string; phoneNumber?: string; address?: string; profilePictureUrl?: string;
    email?: string; state?: string; country?: string; cep?: string
  } = {
    fullName: '', username: '', phoneNumber: '', address: '', profilePictureUrl: '', email: '', state: '', country: '', cep: ''
  };

  selectedFile: File | null = null;
  selectedFileName = '';
  imagePreview: string | null = null;

  constructor(public authService: AuthService, private cepService: CepService) {}

  ngOnInit(): void {
    this.authService.getMe().subscribe({
      next: (u) => {
        this.user = u;
        this.form.fullName = u.fullName ?? '';
        this.form.username = u.username ?? '';
        this.form.phoneNumber = (u as any)?.phoneNumber ?? '';
        this.form.address = (u as any)?.address ?? '';
        this.form.profilePictureUrl = (u as any)?.profilePictureUrl ?? '';
        this.form.email = (u as any)?.email ?? '';
        this.form.state = (u as any)?.state ?? '';
        this.form.country = (u as any)?.country ?? '';
        this.form.cep = (u as any)?.zipCode ?? ''; // backend usa zipCode
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

  onCepLookup(): void {
    const cep = (this.form.cep || '').trim();
    this.cepService.lookup(cep).subscribe({
      next: (res: { address: string; state: string; country: string }) => {
        this.form.address = res.address;
        this.form.state = res.state;
        this.form.country = res.country;
      },
      error: () => { alert('CEP inválido ou não encontrado.'); }
    });
  }

  saveProfile(): void {
    this.saving = true;
    const payload = {
      fullName: this.form.fullName,
      phoneNumber: this.form.phoneNumber,
      address: this.form.address,
      profilePictureUrl: this.form.profilePictureUrl,
      email: this.form.email,
      state: this.form.state,
      country: this.form.country,
      zipCode: this.form.cep
    };
    this.authService.updateMe(payload).subscribe({
      next: (u) => {
        this.user = u;
        this.saving = false;
        alert('Perfil salvo!');
      },
      error: (err) => { this.saving = false; console.error(err); alert('Falha ao salvar perfil'); }
    });
  }
}