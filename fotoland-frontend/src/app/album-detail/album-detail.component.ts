import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../auth/services/auth.service';
import { Album, Post } from '../../../../api.models';
import { Location } from '@angular/common';
import { NavHeaderComponent } from '../shared/nav-header/nav-header.component';

@Component({
  selector: 'app-album-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, NavHeaderComponent],
  templateUrl: './album-detail.component.html',
  styleUrls: ['./album-detail.component.css']
})
export class AlbumDetailComponent implements OnInit {
  album: Album | null = null;
  posts: Post[] = [];
  loading: boolean = true;
  error: string | null = null;
  albumId: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private location: Location
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
        // Usando optional chaining (?.) para acessar 'posts' de forma segura, caso 'album' seja nulo.
        this.posts = this.album?.posts || [];
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

  openLightbox(post: Post): void {    
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
    if (!url) return false;
    // More robust regex to match various YouTube URL formats
    const youtubeRegex = /^(https?:\/\/)?(www\.|m\.)?(youtube\.com|youtu\.be)\/.+$/;
    return youtubeRegex.test(url);
  }

  getYouTubeEmbedUrl(url: string): string {
    const videoId = this.extractYouTubeVideoId(url);
    // Use DomSanitizer in a real app to prevent XSS, but for now, this is a safe construction.
    return videoId ? `https://www.youtube.com/embed/${videoId}` : '';
  }

  private extractYouTubeVideoId(url: string): string {
    if (!url) return '';
    // This regex covers short, long, and embed URLs
    const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
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
          // Otimização: remove o post da lista local em vez de recarregar tudo.
          this.posts = this.posts.filter(p => p.id !== postId);
        },
        error: (error) => {
          console.error('Error deleting post:', error);
        }
      });
    }
  }
  irParaPrivado(): void { this.router.navigate(['/private-chat']); }
  irParaColetivo(): void { this.router.navigate(['/chat']); }
  cancelar(): void { this.closeLightbox(); }
  voltar(): void { this.location.back(); }
}