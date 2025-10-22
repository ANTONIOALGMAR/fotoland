import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../auth/services/auth.service'; // Assuming AuthService will handle album creation
import { Router } from '@angular/router';

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

  constructor(private authService: AuthService, private router: Router) { }

  ngOnInit(): void {
    // Optional: Pre-fill some fields if needed
  }

  onSubmit(): void {
    this.authService.createAlbum(this.album).subscribe({
      next: (response) => {
        console.log('Album created successfully:', response);
        alert('Album created successfully!');
        this.router.navigate(['/home']); // Redirect to home or album list
      },
      error: (error) => {
        console.error('Album creation failed:', error);
        alert('Album creation failed: ' + (error.error.message || error.message));
      }
    });
  }
}
