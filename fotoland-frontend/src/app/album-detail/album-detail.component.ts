import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../auth/services/auth.service';

@Component({
  selector: 'app-album-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './album-detail.component.html',
  styleUrls: ['./album-detail.component.css']
})
export class AlbumDetailComponent implements OnInit {
  album: any = null;
  posts: any[] = [];
  loading: boolean = true;
  error: string | null = null;
  albumId: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.albumId = +params['id'];
      if (this.albumId) {
        this.loadAlbumDetails();
      }
    });
  }

  loadAlbumDetails(): void {
    if (!this.albumId) return;

    this.loading = true;
    this.authService.getAlbumById(this.albumId).subscribe({
      next: (response) => {
        this.album = response;        
        this.posts = this.album.posts || []; // Assumindo que os posts vêm com o álbum
        this.loading = false;
        console.log('Album details:', this.album);
        console.log('Album posts:', this.posts);
      },
      error: (error) => {
        console.error('Error fetching album details:', error);
        this.error = 'Failed to load album details';
        this.loading = false;
      }
    });
  }

  // Este método irá construir a URL completa para a imagem/vídeo
  resolveMediaUrl(url: string): string {
    // A implementação deste método deve estar no AuthService
    return this.authService.resolveMediaUrl(url);
  }

  // Lightbox para zoom
  lightboxOpen: boolean = false;
  lightboxUrl: string = '';
  lightboxType: 'PHOTO' | 'VIDEO' | null = null;

  openLightbox(post: any): void {    
    this.lightboxType = post.type;
    this.lightboxUrl = post.mediaUrl || '';
    this.lightboxOpen = true;
  }

  closeLightbox(): void {
    this.lightboxOpen = false;
    this.lightboxUrl = '';
    this.lightboxType = null;
  }

  addPhoto(): void {
    if (this.albumId) {
      this.router.navigate(['/create-post', this.albumId]);
    }
  }

  editAlbum(): void {
    if (this.albumId) {
      this.router.navigate(['/edit-album', this.albumId]);
    }
  }

  goBack(): void {
    this.router.navigate(['/home']);
  }

  isYouTubeVideo(url: string): boolean {
    return url.includes('youtube.com') || url.includes('youtu.be');
  }

  getYouTubeEmbedUrl(url: string): string {
    const videoId = this.extractYouTubeVideoId(url);
    return `https://www.youtube.com/embed/${videoId}`;
  }

  private extractYouTubeVideoId(url: string): string {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : '';
  }

  editPost(postId: number): void {
    this.router.navigate(['/edit-post', postId]);
  }

  deletePost(postId: number): void {
    if (confirm('Are you sure you want to delete this post?')) {
      this.authService.deletePost(postId).subscribe({
        next: () => {
          this.loadAlbumDetails(); // Reload posts
        },
        error: (error) => {
          console.error('Error deleting post:', error);
        }
      });
    }
  }
}