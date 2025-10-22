import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth/services/auth.service'; // Import AuthService
import { CommonModule } from '@angular/common'; // Import CommonModule for *ngIf
import { RouterLink } from '@angular/router'; // Import RouterLink for navigation

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

  constructor(private authService: AuthService) { } // Inject AuthService

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
}
