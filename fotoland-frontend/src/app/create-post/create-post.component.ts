import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../auth/services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';

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

import { NavHeaderComponent } from '../shared/nav-header/nav-header.component';

@Component({
  selector: 'app-create-post',
  standalone: true,
  imports: [FormsModule, CommonModule, NavHeaderComponent],
  templateUrl: './create-post.component.html',
  styleUrl: './create-post.component.css'
})
export class CreatePostComponent implements OnInit {
  post: any = {
    mediaUrl: '',
    caption: '',
    type: PostType.PHOTO, // Default to PHOTO
    medias: []
  };
  albums: any[] = [];
  selectedAlbumId: number | null = null;
  PostType = PostType;
  postTypes = Object.values(PostType);

  selectedFiles: File[] = [];
  mediaPreviews: string[] = [];

  postId: number | null = null; // To store post ID if in edit mode
  isEditMode: boolean = false; // Flag to indicate edit mode
  isAdmin: boolean = false;
  isSubmitting: boolean = false;

  constructor(private authService: AuthService, private router: Router, private route: ActivatedRoute, private location: Location) { }

  ngOnInit(): void {
    // ... (rest of ngOnInit remains same)
    this.route.paramMap.subscribe(params => {
      const albumIdParam = params.get('albumId');
      if (albumIdParam) {
        this.selectedAlbumId = Number(albumIdParam);
      }
    });

    this.postId = this.route.snapshot.paramMap.get('id') ? Number(this.route.snapshot.paramMap.get('id')) : null;
    if (this.postId) {
      this.isEditMode = true;
      this.loadPostForEdit(this.postId);
    }

    this.loadMyAlbums();

    this.authService.getMe().subscribe({
      next: (u) => this.isAdmin = (u as any)?.role === 'ADMIN',
      error: () => this.isAdmin = false
    });
  }

  loadMyAlbums(): void {
    this.authService.getMyAlbums().subscribe({
      next: (response) => {
        this.albums = response;
        if (this.albums.length > 0 && !this.selectedAlbumId) {
          this.selectedAlbumId = this.albums[0].id;
        }
      },
      error: (error) => console.error('Error fetching user albums:', error)
    });
  }

  loadPostForEdit(id: number): void {
    this.authService.getPostById(id).subscribe({
      next: (response) => {
        this.post = response;
        this.selectedAlbumId = this.post.album.id;
        if (this.post.medias && this.post.medias.length > 0) {
          this.mediaPreviews = this.post.medias.map((m: any) => this.authService.resolveMediaUrl(m.mediaUrl));
        } else if (this.post.mediaUrl) {
          this.mediaPreviews = [this.authService.resolveMediaUrl(this.post.mediaUrl)];
        }
      },
      error: (error) => {
        console.error('Error fetching post for edit:', error);
        this.router.navigate(['/feed']);
      }
    });
  }

  onFilesSelected(event: any): void {
    const files: FileList = event.target.files;
    if (files.length > 0) {
      this.selectedFiles = Array.from(files);
      this.mediaPreviews = [];
      
      this.selectedFiles.forEach(file => {
        const reader = new FileReader();
        reader.onload = () => {
          this.mediaPreviews.push(reader.result as string);
        };
        reader.readAsDataURL(file);
      });
    }
  }

  async onSubmit(): Promise<void> {
    if (this.selectedAlbumId === null) {
      alert('Please select an album.');
      return;
    }

    if (this.isSubmitting) return;
    this.isSubmitting = true;

    try {
      if (this.selectedFiles.length > 0) {
        const uploadPromises = this.selectedFiles.map(file => 
          this.authService.uploadProfilePicture(file).toPromise()
        );
        
        const results = await Promise.all(uploadPromises);
        this.post.medias = results.map(res => ({
          mediaUrl: res!.fileUrl,
          type: this.post.type
        }));
        
        // Mantém mediaUrl original apontando para a primeira foto para compatibilidade
        this.post.mediaUrl = this.post.medias[0].mediaUrl;
      }

      if (this.isEditMode) {
        this.updatePost();
      } else {
        if (this.post.medias.length === 0) {
          alert('Please select at least one media file.');
          this.isSubmitting = false;
          return;
        }
        this.createPost();
      }
    } catch (error) {
      console.error('Operation failed:', error);
      alert('Something went wrong. Please try again.');
      this.isSubmitting = false;
    }
  }

  createPost(): void {
    this.authService.createPost(this.post, this.selectedAlbumId!).subscribe({
      next: () => {
        alert('Post created successfully!');
        this.router.navigate(['/feed']);
      },
      error: (error) => {
        console.error('Post creation failed:', error);
        this.isSubmitting = false;
      }
    });
  }

  updatePost(): void {
    const update$ = this.isAdmin
      ? this.authService.adminUpdatePost(this.postId!, this.post)
      : this.authService.updatePost(this.postId!, this.post);

    update$.subscribe({
      next: () => {
        alert('Post updated successfully!');
        this.router.navigate(['/feed']);
      },
      error: (error) => {
        console.error('Post update failed:', error);
        this.isSubmitting = false;
      }
    });
  }
  irParaPrivado(): void { this.router.navigate(['/private-chat']); }
  irParaColetivo(): void { this.router.navigate(['/chat']); }
  cancelar(): void {
    this.post = { mediaUrl: '', caption: '', type: PostType.PHOTO, medias: [] };
    this.selectedAlbumId = null;
    this.selectedFiles = [];
    this.mediaPreviews = [];
    this.isEditMode = false;
    this.postId = null;
    this.isSubmitting = false;
  }
  voltar(): void { this.location.back(); }
}
