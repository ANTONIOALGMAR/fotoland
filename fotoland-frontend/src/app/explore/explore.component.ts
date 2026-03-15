import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../auth/services/auth.service';
import { Post, User } from '../../../../api.models';
import { TranslateModule } from '@ngx-translate/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-explore',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './explore.component.html',
  styleUrls: ['./explore.component.css']
})
export class ExploreComponent implements OnInit {
  loading = false;
  error: string | null = null;
  results: Post[] = [];
  
  // Abas e Busca de Usuários
  activeTab: 'posts' | 'users' | 'catalog' = 'posts';
  userResults: User[] = [];
  userQuery: string = '';
  followingMap: { [username: string]: boolean } = {};

  search = {
    q: '',
    type: '',
    author: ''
  };

  constructor(public authService: AuthService, private route: ActivatedRoute) {}

  ngOnInit(): void {
    // Verificar se deve abrir o catálogo por padrão via parâmetro de URL
    this.route.queryParams.subscribe(params => {
      if (params['tab'] === 'catalog') {
        this.onLoadCatalog();
      }
    });
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
    this.loading = true;
    this.error = null;
    this.authService.searchUsers(this.userQuery).subscribe({
      next: (data) => {
        this.userResults = data;
        this.loading = false;
        this.checkFollowingStatus();
      },
      error: (err) => {
        console.error(err);
        this.error = 'Erro ao buscar usuários.';
        this.loading = false;
      }
    });
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

  toggleFollow(username: string): void {
    if (this.followingMap[username]) {
      this.authService.unfollow(username).subscribe({
        next: () => this.followingMap[username] = false,
        error: () => alert('Erro ao deixar de seguir.')
      });
    } else {
      this.authService.follow(username).subscribe({
        next: () => this.followingMap[username] = true,
        error: () => alert('Erro ao seguir.')
      });
    }
  }
}
