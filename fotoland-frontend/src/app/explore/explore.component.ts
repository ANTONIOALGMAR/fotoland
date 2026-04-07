import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../auth/services/auth.service';
import { Post, User } from '../../../../api.models';
import { TranslateModule } from '@ngx-translate/core';
import { SkeletonLoaderComponent } from '../shared/components/skeleton-loader/skeleton-loader.component';
import { ActivatedRoute } from '@angular/router';
import { Subject, Subscription, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, catchError, tap } from 'rxjs/operators';

@Component({
  selector: 'app-explore',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, SkeletonLoaderComponent],
  templateUrl: './explore.component.html',
  styleUrls: ['./explore.component.css']
})
export class ExploreComponent implements OnInit, OnDestroy {
  loading = false;
  error: string | null = null;
  results: Post[] = [];
  
  // Abas e Busca de Usuários
  activeTab: 'posts' | 'users' | 'catalog' = 'posts';
  userResults: User[] = [];
  userQuery: string = '';
  followingMap: { [username: string]: boolean } = {};
  isAdmin: boolean = false;
  userLoading = false;
  private userSearchSubject = new Subject<string>();
  private userSearchSubscription?: Subscription;

  search = {
    q: '',
    type: '',
    author: ''
  };

  constructor(public authService: AuthService, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.authService.isAdmin().subscribe(admin => this.isAdmin = admin);
    // Verificar se deve abrir o catálogo por padrão via parâmetro de URL
    this.route.queryParams.subscribe(params => {
      if (params['tab'] === 'catalog') {
        this.onLoadCatalog();
      }
    });

    this.userSearchSubscription = this.userSearchSubject.pipe(
      tap(query => {
        this.activeTab = 'users';
        this.userLoading = true;
        this.error = null;
      }),
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(query => query ? this.authService.searchUsers(query) : of([])),
      catchError((err) => {
        console.error(err);
        this.error = 'Erro ao buscar usuários.';
        this.userLoading = false;
        return of([]);
      })
    ).subscribe((data) => {
      this.userResults = data;
      this.userLoading = false;
      this.checkFollowingStatus();
    });
  }

  adminDeletePost(postId: number): void {
    if (confirm('ADMIN: Confirmar exclusão deste post?')) {
      this.authService.adminDeletePost(postId).subscribe({
        next: () => {
          this.results = this.results.filter(p => p.id !== postId);
          alert('Post removido.');
        },
        error: (err) => alert('Erro ao remover post.')
      });
    }
  }

  adminDeleteUser(userId: number): void {
    if (confirm('ADMIN: Confirmar exclusão deste usuário e todos os seus dados?')) {
      this.authService.adminDeleteUser(userId).subscribe({
        next: () => {
          this.userResults = this.userResults.filter(u => u.id !== userId);
          alert('Usuário removido.');
        },
        error: (err) => alert('Erro ao remover usuário.')
      });
    }
  }

  onSearch(): void {
    this.activeTab = 'posts';
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
        this.results = posts;
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.error = 'Falha ao buscar posts.';
        this.loading = false;
      }
    });
  }

  onSearchUsers(): void {
    if (!this.userQuery.trim()) return;
    this.activeTab = 'users';
    this.userSearchSubject.next(this.userQuery.trim());
  }

  onLoadCatalog(): void {
    this.activeTab = 'catalog';
    this.loading = true;
    this.error = null;
    this.authService.getAllUsers().subscribe({
      next: (data) => {
        this.userResults = data;
        this.loading = false;
        this.checkFollowingStatus();
      },
      error: (err) => {
        console.error(err);
        this.error = 'Erro ao carregar catálogo.';
        this.loading = false;
      }
    });
  }

  private checkFollowingStatus(): void {
    // Verificar quem o usuário logado já segue nos resultados
    this.userResults.forEach(u => {
      this.authService.isFollowing(u.username).subscribe({
        next: (res) => this.followingMap[u.username] = res.isFollowing,
        error: () => {}
      });
    });
  }

  onUserQueryChange(value: string): void {
    this.userQuery = value;
    this.activeTab = 'users';
    const trimmed = value.trim();
    if (!trimmed) {
      this.userResults = [];
      this.userLoading = false;
      return;
    }
    this.userSearchSubject.next(trimmed);
  }

  ngOnDestroy(): void {
    this.userSearchSubscription?.unsubscribe();
  }

  toggleFollow(username: string): void {
    if (this.followingMap[username]) {
      this.authService.unfollow(username).subscribe({
        next: () => {
          this.followingMap = { ...this.followingMap, [username]: false };
        },
        error: (err) => console.error('Erro ao deixar de seguir:', err)
      });
    } else {
      this.authService.follow(username).subscribe({
        next: () => {
          this.followingMap = { ...this.followingMap, [username]: true };
        },
        error: (err) => {
          if (err.status === 400) {
            this.followingMap = { ...this.followingMap, [username]: true };
          }
          console.error('Erro ao seguir:', err);
        }
      });
    }

    }
  }
}
