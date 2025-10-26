import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../auth/services/auth.service'; // Assuming AuthService will handle album creation
import { Router, ActivatedRoute } from '@angular/router';

// Enum for AlbumType (should match backend)
export enum AlbumType {
  GENERAL = 'GENERAL',
  PROFILE = 'PROFILE',
  LOCATION = 'LOCATION',
  EVENT = 'EVENT'
}

@Component({
  selector: 'app-create-album',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './create-album.component.html',
  styleUrl: './create-album.component.css'
})
export class CreateAlbumComponent implements OnInit {
  album: any = {
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

  constructor(private authService: AuthService, private router: Router, private route: ActivatedRoute) { }

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
          const status = (error && typeof error.status !== 'undefined') ? error.status : 0;

          if (status === 401) {
            alert('Sessão expirada. Faça login novamente.');
            this.router.navigate(['/login']);
            return;
          }
          if (status === 403) {
            alert('Você não tem permissão para editar este álbum.');
            this.router.navigate(['/home']);
            return;
          }
          if (status === 404) {
            alert('Álbum não encontrado.');
            this.router.navigate(['/home']);
            return;
          }

          alert(`Erro ao carregar álbum para edição (status ${status}).`);
          this.router.navigate(['/home']);
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
          const status = (error && typeof error.status !== 'undefined') ? error.status : 0;
          const url = error?.url || 'URL de álbuns';
          const detail = error?.error?.message || error.message || 'Erro desconhecido';
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
          const status = (error && typeof error.status !== 'undefined') ? error.status : 0;
          const url = error?.url || 'URL de álbuns';
          const detail = error?.error?.message || error.message || 'Erro desconhecido';
          alert(`Falha ao criar álbum (status ${status}) em ${url}: ${detail}`);
        }
      });
    }
  }
}
