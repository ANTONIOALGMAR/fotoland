import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth/services/auth.service';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router'; // Import Router
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-feed',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './feed.component.html',
  styleUrls: ['./feed.component.css']
})
export class FeedComponent implements OnInit {
  albums: any[] = [];
  loading: boolean = true;
  error: string | null = null;
  currentUserId: number | null = null; // To store the ID of the currently logged-in user
  
  // Comment-related properties
  commentsByPostId: { [postId: number]: any[] } = {};
  newCommentText: { [postId: number]: string } = {};
  showComments: { [postId: number]: boolean } = {};

  constructor(private authService: AuthService, private sanitizer: DomSanitizer, private router: Router) { } // Inject Router

  ngOnInit(): void {
    this.loadAllAlbums();
    this.authService.getMe().subscribe({
      next: (user) => {
        this.currentUserId = user.id;
      },
      error: (err: any) => {
        console.error('Error fetching current user:', err);
        // Handle error, e.g., redirect to login if token is invalid
      }
    });
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
      error: (err: any) => {
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

  // Resolver media URL via serviço
  resolveMediaUrl(url: string): string {
    return this.authService.resolveMediaUrl(url);
  }

  canEditPost(post: any): boolean {
    // Check if the post has an author and if the author's ID matches the current user's ID
    return this.currentUserId !== null && post.album && post.album.author && post.album.author.id === this.currentUserId;
  }

  deletePost(postId: number): void {
    if (confirm('Are you sure you want to delete this post?')) {
      this.authService.deletePost(postId).subscribe({
        next: () => {
          console.log('Post deleted successfully.');
          this.loadAllAlbums(); // Refresh the feed after deletion
        },
        error: (err: any) => {
          console.error('Error deleting post:', err);
          alert('Failed to delete post. Please try again.');
        }
      });
    }
  }

  // Comment methods
  get isAuthenticated(): boolean {
    return !!this.authService.getToken();
  }

  toggleComments(postId: number): void {
    this.showComments[postId] = !this.showComments[postId];
    if (this.showComments[postId] && !this.commentsByPostId[postId]) {
      this.loadComments(postId);
    }
  }

  loadComments(postId: number): void {
    this.authService.getCommentsByPostId(postId).subscribe({
      next: (comments) => {
        this.commentsByPostId[postId] = comments;
      },
      error: (err: any) => {
        console.error('Error loading comments:', err);
      }
    });
  }

  addComment(postId: number): void {
    const text = (this.newCommentText[postId] || '').trim();
    if (!text) {
      return;
    }
    
    this.authService.addComment(postId, text).subscribe({
      next: () => {
        this.newCommentText[postId] = '';
        this.loadComments(postId);
      },
      error: (err: any) => {
        console.error('Error creating comment:', err);
        alert('Failed to create comment. Please try again.');
      }
    });
  }

  canDeleteComment(comment: any): boolean {
    return this.isAuthenticated && this.currentUserId !== null && comment?.author?.id === this.currentUserId;
  }

  deleteComment(commentId: number, postId: number): void {
    if (confirm('Are you sure you want to delete this comment?')) {
      this.authService.deleteComment(commentId).subscribe({
        next: () => {
          this.loadComments(postId);
        },
        error: (err: any) => {
          console.error('Error deleting comment:', err);
          alert('Failed to delete comment. Please try again.');
        }
      });
    }
  }
}
