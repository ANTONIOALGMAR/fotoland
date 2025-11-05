import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../auth/services/auth.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Album, AlbumType } from '../../../../api.models';
import { Location } from '@angular/common';
import { NavHeaderComponent } from '../shared/nav-header/nav-header.component';

@Component({
  selector: 'app-create-album',
  standalone: true,
  imports: [FormsModule, CommonModule, NavHeaderComponent],
  templateUrl: './create-album.component.html',
  styleUrl: './create-album.component.css'
})
export class CreateAlbumComponent implements OnInit {
  // Use a partial Album type for the form model
  album: Partial<Album> = {
    title: '',
    description: '',
    type: AlbumType.GENERAL,
    location: '',
    eventName: ''
  };
  albumTypes = Object.values(AlbumType); // For dropdown
  AlbumType = AlbumType; // Make AlbumType enum accessible in template
  isEditMode = false;
  albumId: number | null = null;

  constructor(private authService: AuthService, private router: Router, private route: ActivatedRoute, private location: Location) { }

  ngOnInit(): void {
    // Check if we're in edit mode by looking for an ID parameter
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.albumId = +params['id'];
        this.loadAlbumForEdit();
      }
    });
  }

  loadAlbumForEdit(): void {
    if (this.albumId) {
      this.authService.getAlbumById(this.albumId).subscribe({
        next: (album) => {
          this.album = { ...album };
          console.log('Album loaded for editing:', this.album);
        },
        error: (error) => {
          console.error('Error loading album for edit:', error);
          // Usando o operador de encadeamento opcional para mais segurança
          const status = error?.status ?? 0;

          if (status === 401) {
            alert('Sessão expirada. Faça login novamente.');
            this.router.navigate(['/login']);
          } else if (status === 403) {
            alert('Você não tem permissão para editar este álbum.');
            this.router.navigate(['/home']);
          } else if (status === 404) {
            alert('Álbum não encontrado.');
            this.router.navigate(['/home']);
          } else {
            // Mensagem de erro mais genérica para outros casos
            alert(`Erro ao carregar álbum para edição (status ${status}).`);
            this.router.navigate(['/home']);
          }
        }
      });
    }
  }

  onSubmit(): void {
    if (this.isEditMode && this.albumId) {
      // Update existing album
      this.authService.updateAlbum(this.albumId, this.album).subscribe({
        next: (response) => {
          console.log('Album updated successfully:', response);
          alert('Álbum atualizado com sucesso!');
          this.router.navigate(['/home']);
        },
        error: (error) => {
          console.error('❌ Falha ao atualizar álbum:', error);
          const status = error?.status ?? 0;
          const url = error?.url || 'URL de álbuns';
          const detail = error?.error?.message || error?.message || 'Erro desconhecido';
          alert(`Falha ao atualizar álbum (status ${status}) em ${url}: ${detail}`);
        }
      });
    } else {
      // Create new album
      this.authService.createAlbum(this.album).subscribe({
        next: (response) => {
          console.log('Album created successfully:', response);
          alert('Album created successfully!');
          this.router.navigate(['/home']); // Redirect to home or album list
        },
        error: (error) => {
          console.error('❌ Falha ao criar álbum:', error);
          const status = error?.status ?? 0;
          const url = error?.url || 'URL de álbuns';
          const detail = error?.error?.message || error?.message || 'Erro desconhecido';
          alert(`Falha ao criar álbum (status ${status}) em ${url}: ${detail}`);
        }
      });
    }
  }
  irParaPrivado(): void { this.router.navigate(['/private-chat']); }
  irParaColetivo(): void { this.router.navigate(['/chat']); }
  cancelar(): void {
    this.album = { title: '', description: '', type: AlbumType.GENERAL, location: '', eventName: '' };
    this.isEditMode = false;
    this.albumId = null;
  }
  voltar(): void { this.location.back(); }
}
