import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth/services/auth.service'; // Import AuthService
import { CommonModule } from '@angular/common'; // Import CommonModule for *ngIf

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule], // Add CommonModule
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  user: any = null; // Property to store user data

  constructor(private authService: AuthService) { } // Inject AuthService

  ngOnInit(): void {
    this.authService.getMe().subscribe({
      next: (response) => {
        this.user = response;
        console.log('User profile:', this.user);
      },
      error: (error) => {
        console.error('Error fetching user profile:', error);
      }
    });
  }
}
