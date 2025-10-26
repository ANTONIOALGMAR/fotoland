import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../auth/services/auth.service';
import { ActivatedRoute, Router } from '@angular/router'; // Import ActivatedRoute

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
  albums: any[] = [];
  selectedAlbumId: number | null = null;
  PostType = PostType;
  postTypes = Object.values(PostType);

  selectedFile: File | null = null;
  selectedFileName: string = '';
  mediaPreview: string | ArrayBuffer | null = null;

  postId: number | null = null; // To store post ID if in edit mode
  isEditMode: boolean = false; // Flag to indicate edit mode

  constructor(private authService: AuthService, private router: Router, private route: ActivatedRoute) { } // Inject ActivatedRoute

  ngOnInit(): void {
    // Ler albumId via query params (ao vir do detalhe do álbum)
    this.route.queryParamMap.subscribe(params => {
      const albumIdParam = params.get('albumId');
      if (albumIdParam) {
        this.selectedAlbumId = Number(albumIdParam);
      }
    });

    // Detectar modo de edição apenas quando a rota contém o ID do post
    this.postId = this.route.snapshot.paramMap.get('id') ? Number(this.route.snapshot.paramMap.get('id')) : null;
    if (this.postId) {
      this.isEditMode = true;
      this.loadPostForEdit(this.postId);
    }

    // Carregar álbuns após inicializar parâmetros
    this.loadMyAlbums();
  }

  loadMyAlbums(): void {
    this.authService.getMyAlbums().subscribe({
      next: (response) => {
        this.albums = response;
        if (this.albums.length > 0) {
          // Não sobrescrever se já veio um albumId pela rota
          if (!this.selectedAlbumId) {
            this.selectedAlbumId = this.albums[0].id;
          }
        }
      },
      error: (error) => {
        console.error('Error fetching user albums:', error);
        alert('Failed to load albums for post creation.');
      }
    });
  }

  loadPostForEdit(id: number): void {
    this.authService.getPostById(id).subscribe({
      next: (response) => {
        this.post = response;
        this.selectedAlbumId = this.post.album.id;
        if (this.post.mediaUrl) {
          this.mediaPreview = this.post.mediaUrl;
          this.selectedFileName = this.post.mediaUrl.substring(this.post.mediaUrl.lastIndexOf('/') + 1);
        }
      },
      error: (error) => {
        console.error('Error fetching post for edit:', error);
        alert('Failed to load post for editing.');
        this.router.navigate(['/feed']); // Redirect if post not found or error
      }
    });
  }

  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      this.selectedFileName = file.name;

      const reader = new FileReader();
      reader.onload = () => {
        this.mediaPreview = reader.result;
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit(): void {
    if (this.selectedAlbumId === null) {
      alert('Please select an album.');
      return;
    }

    if (this.selectedFile) {
      this.authService.uploadProfilePicture(this.selectedFile).subscribe({
        next: (response) => {
          console.log('Media uploaded successfully:', response);
          this.post.mediaUrl = response.fileUrl;
          if (this.isEditMode) {
            this.updatePost();
          } else {
            this.createPost();
          }
        },
        error: (error) => {
          console.error('Media upload failed:', error);
          alert('Could not upload media. Please try again.');
        }
      });
    } else if (this.isEditMode) {
      // If in edit mode and no new file selected, proceed with update using existing mediaUrl
      this.updatePost();
    } else {
      alert('Please select a media file to upload.');
    }
  }

  createPost(): void {
    this.authService.createPost(this.post, this.selectedAlbumId!).subscribe({
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

  updatePost(): void {
    if (this.postId === null) {
      alert('Error: Post ID is missing for update.');
      return;
    }
    this.authService.updatePost(this.postId, this.post).subscribe({
      next: (response) => {
        console.log('Post updated successfully:', response);
        alert('Post updated successfully!');
        this.router.navigate(['/feed']);
      },
      error: (error) => {
        console.error('Post update failed:', error);
        alert('Post update failed: ' + (error.error.message || error.message));
      }
    });
  }
}
