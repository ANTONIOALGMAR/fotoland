import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth/services/auth.service'; // Import AuthService
import { CommonModule } from '@angular/common'; // Import CommonModule for *ngIf
import { RouterLink, Router } from '@angular/router'; // Import RouterLink and Router for navigation

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink], // Add CommonModule and RouterLink
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  user: any = null; // Property to store user data
  albums: any[] = []; // Property to store user albums

  constructor(private authService: AuthService, private router: Router) { } // Inject AuthService and Router

  ngOnInit(): void {
    this.authService.getMe().subscribe({
      next: (response) => {
        this.user = response;
        console.log('User profile:', this.user);
        this.loadAlbums(); // Load albums after user profile is fetched
      },
      error: (error) => {
        console.error('Error fetching user profile:', error);
      }
    });
  }

  loadAlbums(): void {
    this.authService.getMyAlbums().subscribe({
      next: (response) => {
        this.albums = response;
        console.log('User albums:', this.albums);
      },
      error: (error) => {
        console.error('Error fetching user albums:', error);
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
}
