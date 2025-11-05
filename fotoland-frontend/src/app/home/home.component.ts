import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth/services/auth.service';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { User, Album } from '../../../../api.models';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  user: User | null = null;
  albums: Album[] = [];

  constructor(private authService: AuthService, private router: Router) { }

  ngOnInit(): void {
    forkJoin({
      user: this.authService.getMe(),
      albums: this.authService.getMyAlbums()
    }).subscribe({
      next: ({ user, albums }: { user: User; albums: Album[] }) => {
        this.user = user;
        this.albums = albums;
      },
      error: (error: unknown) => {
        console.error('Error fetching data:', error);
      }
    });
  }

  viewAlbum(albumId: number): void {
    this.router.navigate(['/album', albumId]);
  }

  editAlbum(albumId: number): void {
    this.router.navigate(['/edit-album', albumId]);
  }

  deleteAlbum(albumId: number): void {
    if (confirm('Tem certeza que deseja excluir este álbum? Esta ação não pode ser desfeita.')) {
      this.authService.deleteAlbum(albumId).subscribe({
        next: () => {
          console.log('Album deleted successfully');
          this.loadAlbums(); // Reload albums after deletion
        },
        error: (error) => {
          console.error('Error deleting album:', error);
          alert('Erro ao excluir álbum. Tente novamente.');
        }
      });
    }
  }
  loadAlbums(): void {
    this.authService.getMyAlbums().subscribe({
      next: (response) => {
        this.albums = response;
      },
      error: (error) => {
        console.error('Error fetching user albums:', error);
      }
    });
  }
}
