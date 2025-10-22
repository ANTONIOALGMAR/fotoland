import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth/services/auth.service'; // Assuming AuthService will handle fetching albums
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser'; // Import DomSanitizer

@Component({
  selector: 'app-feed',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './feed.component.html',
  styleUrl: './feed.component.css'
})
export class FeedComponent implements OnInit {
  albums: any[] = [];
  loading: boolean = true;
  error: string | null = null;

  constructor(private authService: AuthService, private sanitizer: DomSanitizer) { } // Inject DomSanitizer

  ngOnInit(): void {
    this.loadAllAlbums();
  }

  loadAllAlbums(): void {
    this.loading = true;
    this.error = null;
    this.authService.getAllAlbums().subscribe({
      next: (response) => {
        this.albums = response;
        this.loading = false;
        console.log('All albums for feed:', this.albums);
      },
      error: (err) => {
        console.error('Error fetching all albums:', err);
        this.error = 'Failed to load albums. Please try again later.';
        this.loading = false;
      }
    });
  }

  isYouTubeVideo(url: string): boolean {
    return url.includes('youtube.com') || url.includes('youtu.be');
  }

  getYouTubeEmbedUrl(url: string): SafeResourceUrl {
    let videoId = '';
    if (url.includes('watch?v=')) {
      videoId = url.split('v=')[1].split('&')[0];
    } else if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1].split('?')[0];
    }
    return this.sanitizer.bypassSecurityTrustResourceUrl(`https://www.youtube.com/embed/${videoId}`);
  }
}
