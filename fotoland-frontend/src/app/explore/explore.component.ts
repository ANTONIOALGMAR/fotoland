import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../auth/services/auth.service';
import { Post } from '../../../../api.models';
import { NavHeaderComponent } from '../shared/nav-header/nav-header.component';

@Component({
  selector: 'app-explore',
  standalone: true,
  imports: [CommonModule, FormsModule, NavHeaderComponent],
  templateUrl: './explore.component.html',
  styleUrls: ['./explore.component.css']
})
export class ExploreComponent {
  loading = false;
  error: string | null = null;
  results: Post[] = [];
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
      size: 20
    }).subscribe({
      next: (posts) => {
        this.results = posts;
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.error = 'Falha ao buscar.';
        this.loading = false;
      }
    });
  }

  resolve(url: string): string {
    return this.authService.resolveMediaUrl(url);
  }
}