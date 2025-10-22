import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../auth/services/auth.service'; // Assuming AuthService will handle post creation
import { Router } from '@angular/router';

// Enum for AlbumType (should match backend)
export enum AlbumType {
  GENERAL = 'GENERAL',
  PROFILE = 'PROFILE',
  LOCATION = 'LOCATION',
  EVENT = 'EVENT'
}

// Enum for PostType (should match backend)
export enum PostType {
  PHOTO = 'PHOTO',
  VIDEO = 'VIDEO'
}

@Component({
  selector: 'app-create-post',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './create-post.component.html',
  styleUrl: './create-post.component.css'
})
export class CreatePostComponent implements OnInit {
  post: any = {
    mediaUrl: '',
    caption: '',
    type: PostType.PHOTO // Default to PHOTO
  };
  albums: any[] = []; // To store user's albums for selection
  selectedAlbumId: number | null = null;
  PostType = PostType; // Make PostType enum accessible in template
  postTypes = Object.values(PostType); // For dropdown

  constructor(private authService: AuthService, private router: Router) { }

  ngOnInit(): void {
    this.loadMyAlbums();
  }

  loadMyAlbums(): void {
    this.authService.getMyAlbums().subscribe({
      next: (response) => {
        this.albums = response;
        if (this.albums.length > 0) {
          this.selectedAlbumId = this.albums[0].id;
        }
      },
      error: (error) => {
        console.error('Error fetching user albums:', error);
        alert('Failed to load albums for post creation.');
      }
    });
  }

  onSubmit(): void {
    if (this.selectedAlbumId === null) {
      alert('Please select an album.');
      return;
    }

    this.authService.createPost(this.post, this.selectedAlbumId).subscribe({
      next: (response) => {
        console.log('Post created successfully:', response);
        alert('Post created successfully!');
        this.router.navigate(['/feed']);
      },
      error: (error) => {
        console.error('Post creation failed:', error);
        alert('Post creation failed: ' + (error.error.message || error.message));
      }
    });
  }
}
