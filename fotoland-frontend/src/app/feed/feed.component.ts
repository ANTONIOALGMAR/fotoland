import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth/services/auth.service';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Location } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { SkeletonLoaderComponent } from '../shared/components/skeleton-loader/skeleton-loader.component';

@Component({
  selector: 'app-feed',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, TranslateModule, SkeletonLoaderComponent],
  templateUrl: './feed.component.html',
  styleUrls: ['./feed.component.css']
})
export class FeedComponent implements OnInit {
  /** Lista de álbuns/posts exibidos no feed global */
  albums: any[] = [];
  /** Lista de stories ativos */
  stories: any[] = [];
  /** Story atualmente em exibição no player */
  activeStory: any = null;
  /** Flag para indicar upload de story em andamento */
  isUploadingStory: boolean = false;
  /** Flag de controle de carregamento da interface */
  loading: boolean = true;
  /** Armazena mensagens de erro para exibição ao usuário */
  error: string | null = null;
  /** ID do usuário autenticado para controle de permissões de edição */
  currentUserId: number | null = null;
  /** Nome de usuário autenticado para lógica de follow e sugestões */
  currentUserUsername: string | null = null;
  
  /** Lista de usuários sugeridos para exibição na sidebar */
  suggestedUsers: any[] = [];
  
  /** Mapeamento de status de seguimento (username -> booleano) para otimização de renderização */
  followingMap: { [username: string]: boolean } = {};

  /** Armazenamento de comentários por ID de post para lazy loading */
  commentsByPostId: { [postId: number]: any[] } = {};
  /** Texto temporário do novo comentário por post */
  newCommentText: { [postId: number]: string } = {};
  /** Controle de visibilidade da seção de comentários por post */
  showComments: { [postId: number]: boolean } = {};
  /** Indica se o usuário possui papel de administrador */
  isAdmin: boolean = false;

  constructor(public authService: AuthService, private router: Router, private sanitizer: DomSanitizer, private location: Location) { }

  ngOnInit(): void {
    // Busca informações do usuário logado antes de carregar o feed
    this.authService.getMe().subscribe({
      next: (user) => {
        this.currentUserId = user.id;
        this.currentUserUsername = user.username;
        this.isAdmin = (user as any)?.role === 'ADMIN';
        this.loadAllAlbums(); 
        this.loadSuggestions();
        this.loadStories();
      },
      error: (err: any) => {
        console.error('Error fetching current user:', err);
        this.loadAllAlbums();
        this.loadSuggestions();
        this.loadStories();
      }
    });
  }

  /**
   * Obtém todos os álbuns disponíveis e verifica se o usuário já segue os autores.
   */
  loadAllAlbums(): void {
    this.loading = true;
    this.error = null;
    this.authService.getAllAlbums().subscribe({
      next: (response) => {
        this.albums = response;
        this.loading = false;
        
        // Check follow status for each unique author in the feed
        const authors = [...new Set(this.albums.map(a => a.author.username))];
        authors.forEach(username => {
          if (username !== this.currentUserUsername) {
            this.authService.isFollowing(username).subscribe({
              next: (res) => this.followingMap[username] = res.isFollowing,
              error: () => {}
            });
          }
        });
      },
      error: (err: any) => {
        console.error('Error fetching all albums:', err);
        this.error = 'Failed to load albums. Please try again later.';
        this.loading = false;
      }
    });
  }

  loadSuggestions(): void {
    this.authService.getAllUsers().subscribe({
      next: (users) => {
        // Filtrar a si mesmo e quem já segue (embora simplificado aqui para pegar alguns aleatórios)
        this.suggestedUsers = users
          .filter(u => u.username !== this.currentUserUsername)
          .sort(() => Math.random() - 0.5)
          .slice(0, 5);
      },
      error: (err) => console.error('Error loading suggestions:', err)
    });
  }

  /**
   * Carrega os stories ativos do backend.
   */
  loadStories(): void {
    this.authService.getActiveStories().subscribe({
      next: (res) => this.stories = res,
      error: (err) => console.error('Error loading stories:', err)
    });
  }

  /**
   * Gerencia a seleção de arquivo para story.
   * Faz o upload da imagem e depois registra o story no backend.
   */
  onStoryFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (!file) return;

    this.isUploadingStory = true;
    this.authService.uploadProfilePicture(file).subscribe({
      next: (res: any) => {
        const newStory = {
          mediaUrl: res.fileUrl,
          caption: ''
        };
        this.authService.postStory(newStory).subscribe({
          next: () => {
            this.isUploadingStory = false;
            this.loadStories();
          },
          error: (err: any) => {
            this.isUploadingStory = false;
            console.error('Error posting story:', err);
          }
        });
      },
      error: (err: any) => {
        this.isUploadingStory = false;
        console.error('Error uploading story file:', err);
      }
    });
  }

  /**
   * Abre o player de story em tela cheia.
   */
  openStory(story: any): void {
    this.activeStory = story;
    // Fecha automaticamente após 5 segundos (simulando player)
    setTimeout(() => {
      if (this.activeStory === story) this.closeStory();
    }, 5000);
  }

  /**
   * Fecha o player de story.
   */
  closeStory(): void {
    this.activeStory = null;
  }

  toggleFollow(username: string): void {
    if (!this.isAuthenticated) {
      this.router.navigate(['/login']);
      return;
    }

    const currentlyFollowing = this.isFollowingUser(username);
    const request = currentlyFollowing
      ? this.authService.unfollow(username)
      : this.authService.follow(username);

    request.subscribe({
      next: () => {
        this.followingMap[username] = !currentlyFollowing;
      },
      error: (err) => {
        console.error(`Error ${currentlyFollowing ? 'unfollowing' : 'following'}:`, err);
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
  isFollowingUser(username: string): boolean {
    return !!this.followingMap[username];
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

  adminDeletePost(postId: number): void {
    if (!this.isAdmin) return;
    if (confirm('ADMIN: confirmar exclusão deste post?')) {
      this.authService.adminDeletePost(postId).subscribe({
        next: () => {
          console.log('Post excluído por ADMIN.');
          this.loadAllAlbums();
        },
        error: (err: any) => {
          console.error('Erro ao excluir post (admin):', err);
          alert('Falha ao excluir post (admin).');
        }
      });
    }
  }

  // Comment methods
  get isAuthenticated(): boolean {
    return this.authService.isAuthenticatedNow();
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

  // ❤️ Like methods
  onDoubleTap(post: any): void {
    if (!this.isAuthenticated) {
      alert('Please login to like posts.');
      this.router.navigate(['/login']);
      return;
    }

    // Se ainda não curtiu, curte agora
    if (!post.likedByCurrentUser) {
      this.toggleLike(post);
    }

    // Mostrar animação do coração
    post.showHeart = true;
    setTimeout(() => {
      post.showHeart = false;
    }, 800); // Mesmo tempo da animação CSS
  }

  toggleLike(post: any): void {
    if (!this.isAuthenticated) {
      alert('Please login to like posts.');
      this.router.navigate(['/login']);
      return;
    }

    if (post.likedByCurrentUser) {
      this.authService.unlikePost(post.id).subscribe({
        next: (res) => {
          post.likeCount = res.likeCount;
          post.likedByCurrentUser = false;
        },
        error: (err: any) => console.error('Error unliking post:', err)
      });
    } else {
      this.authService.likePost(post.id).subscribe({
        next: (res) => {
          post.likeCount = res.likeCount;
          post.likedByCurrentUser = true;
        },
        error: (err: any) => console.error('Error liking post:', err)
      });
    }
  }

  search = {
    q: '',
    type: '',
    author: '',
  };

  onSearch(): void {
    if (!this.search.q && !this.search.type && !this.search.author) {
      this.loadAllAlbums();
      return;
    }

    this.loading = true;
    this.error = null;
    this.authService.searchPosts({
      q: this.search.q || undefined,
      type: (this.search.type as 'PHOTO' | 'VIDEO') || undefined,
      author: this.search.author || undefined,
      page: 0,
      size: 50
    }).subscribe({
      next: (posts) => {
        this.loading = false;
        // Transformar posts em um formato que o feed entenda (agrupados por um álbum fake ou direto)
        if (posts.length > 0) {
          this.albums = [{
            id: 0,
            title: 'Resultados da Busca',
            description: `Encontrados ${posts.length} posts`,
            author: { fullName: 'Sistema', username: 'search' },
            posts: posts,
            type: 'GENERAL'
          }];
        } else {
          this.albums = [];
        }
      },
      error: (err: any) => {
        this.loading = false;
        this.error = 'Falha ao buscar posts.';
        console.error(err);
      }
    });
  }
  irParaPrivado(): void { this.router.navigate(['/private-chat']); }
  irParaColetivo(): void { this.router.navigate(['/chat']); }
  cancelar(): void { /* limpar campos se necessário */ }
  voltar(): void { this.location.back(); }
}
