import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../auth/services/auth.service';
import { Post, User } from '../../../../api.models';
import { NavHeaderComponent } from '../shared/nav-header/nav-header.component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-explore',
  standalone: true,
  imports: [CommonModule, FormsModule, NavHeaderComponent, TranslateModule],
  templateUrl: './explore.component.html',
  styleUrls: ['./explore.component.css']
})
export class ExploreComponent {
  loading = false;
  error: string | null = null;
  results: Post[] = [];
  
  // Abas e Busca de Usuários
  activeTab: 'posts' | 'users' = 'posts';
  userResults: User[] = [];
  userQuery: string = '';
  followingMap: { [username: string]: boolean } = {};

  search = {
    q: '',
    type: '',
    author: ''
  };

  constructor(public authService: AuthService) {}

  onSearch(): void {
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
    this.loading = true;
    this.error = null;
    this.authService.searchUsers(this.userQuery).subscribe({
      next: (data) => {
        this.userResults = data;
        this.loading = false;
        
        // Verificar quem o usuário logado já segue nos resultados
        this.userResults.forEach(u => {
          this.authService.isFollowing(u.username).subscribe({
            next: (res) => this.followingMap[u.username] = res.isFollowing,
            error: () => {}
          });
        });
      },
      error: (err) => {
        console.error(err);
        this.error = 'Erro ao buscar usuários.';
        this.loading = false;
      }
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
