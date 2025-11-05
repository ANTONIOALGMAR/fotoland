import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../auth/services/auth.service';
import { NavHeaderComponent } from '../shared/nav-header/nav-header.component';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, NavHeaderComponent],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent {
  // Preferências simples (apenas UI por enquanto)
  preferences = {
    emailNotifications: true,
    privateProfile: false
  };

  // Troca de senha
  saving = false;
  currentPassword = '';
  newPassword = '';
  confirmPassword = '';

  constructor(public authService: AuthService) {}

  savePreferences(): void {
    // Placeholder apenas UI — implementar backend depois
    alert('Preferências salvas (UI).');
  }

  changePassword(): void {
    if (!this.currentPassword || !this.newPassword || !this.confirmPassword) {
      alert('Preencha todos os campos.');
      return;
    }
    if (this.newPassword !== this.confirmPassword) {
      alert('A confirmação não confere.');
      return;
    }
    this.saving = true;
    this.authService.changePassword({ currentPassword: this.currentPassword, newPassword: this.newPassword }).subscribe({
      next: () => {
        this.saving = false;
        this.currentPassword = this.newPassword = this.confirmPassword = '';
        alert('Senha alterada com sucesso!');
      },
      error: (err) => {
        this.saving = false;
        console.error(err);
        alert('Falha ao alterar senha.');
      }
    });
  }
}