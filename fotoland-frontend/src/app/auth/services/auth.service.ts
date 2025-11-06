import { Injectable, isDevMode } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { Album, Post, User, Comment, Notification } from '../../../../../api.models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly BASE_URL_OVERRIDE = (typeof window !== 'undefined' ? localStorage.getItem('backend_base_url') : null);

  private readonly BASE_URL = (
    this.BASE_URL_OVERRIDE
      ? this.BASE_URL_OVERRIDE
      : (/^(localhost|127\.0\.0\.1|0\.0\.0\.0)$/.test(window.location.hostname)
          ? 'http://localhost:8080'
          : 'https://fotoland-backend.onrender.com')
  ).replace(/:+$/, '');

  private readonly apiUrl = `${this.BASE_URL}/api/auth`;
  private readonly userApiUrl = `${this.BASE_URL}/api/user`;
  private readonly albumApiUrl = `${this.BASE_URL}/api/albums`;
  private readonly uploadApiUrl = `${this.BASE_URL}/api`;
  private readonly postApiUrl = `${this.BASE_URL}/api/posts`;
  private readonly commentsUrl = `${this.BASE_URL}/api/comments`;

  constructor(private http: HttpClient, private router: Router) {}

  // 📸 Upload de imagem de perfil
  uploadProfilePicture(file: File): Observable<{ fileUrl: string }> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<{ fileUrl: string }>(
      `${this.uploadApiUrl}/upload`,
      formData
    ).pipe(
      catchError((error) => {
        // Evitar logs detalhados em produção
        if (isDevMode()) {
          console.error('Erro ao enviar upload:', error);
        }
        return throwError(() => error);
      })
    );
  }

  // 👤 Registro e login
  register(user: Partial<User>): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/register`, user);
  }

  login(credentials: any): Observable<{ jwt: string }> {
    return this.http.post<{ jwt: string }>(`${this.apiUrl}/login`, credentials);
  }

  // 🔑 Token e autenticação
  getToken(): string | null {
      const raw = localStorage.getItem('jwt_token');
      if (!raw) return null;
      const token = raw.trim();
      if (token === '' || token === 'undefined' || token === 'null') return null;
      return token;
  }

  logout(): void {
    localStorage.removeItem('jwt_token');
    this.router.navigate(['/login']);
  }

  getMe(): Observable<User> {
    return this.http.get<User>(`${this.userApiUrl}/me`);
  }

  // Keep a single helper to check admin role
  isAdmin(): Observable<boolean> {
      return this.getMe().pipe(map((u) => (u as any)?.role === 'ADMIN'));
  }

  // 🖼️ Álbuns
  createAlbum(album: Partial<Album>): Observable<Album> {
    return this.http.post<Album>(this.albumApiUrl, album);
  }

  getMyAlbums(): Observable<Album[]> {
    return this.http.get<any>(`${this.albumApiUrl}/my`).pipe(
      map((res) => Array.isArray(res) ? res : (res?.content ?? [])),
      catchError((error) => {
        console.error('Erro ao buscar meus álbuns:', error);
        return throwError(() => error);
      })
    );
  }

  getAllAlbums(): Observable<Album[]> {
    return this.http.get<any>(this.albumApiUrl).pipe(
      map((res) => Array.isArray(res) ? res : (res?.content ?? [])),
      catchError((error) => {
        console.error('Erro ao buscar álbuns públicos:', error);
        return throwError(() => error);
      })
    );
  }

  getAlbumById(id: number): Observable<Album> {
    return this.http.get<Album>(`${this.albumApiUrl}/${id}`);
  }

  updateAlbum(id: number, album: Partial<Album>): Observable<Album> {
    return this.http.put<Album>(`${this.albumApiUrl}/${id}`, album);
  }

  deleteAlbum(id: number): Observable<void> {
    return this.http.delete<void>(`${this.albumApiUrl}/${id}`);
  }

  // 📬 Posts
  createPost(post: Partial<Post>, albumId: number): Observable<Post> {
    return this.http.post<Post>(`${this.postApiUrl}/album/${albumId}`, post);
  }

  getAllPosts(): Observable<Post[]> {
    return this.http.get<Post[]>(this.postApiUrl);
  }

  getPostsByAlbumId(albumId: number): Observable<Post[]> {
    return this.http.get<Post[]>(`${this.postApiUrl}/album/${albumId}`);
  }

  updatePost(postId: number, post: Partial<Post>): Observable<Post> {
    return this.http.put<Post>(`${this.postApiUrl}/${postId}`, post);
  }

  deletePost(postId: number): Observable<void> {
    return this.http.delete<void>(`${this.postApiUrl}/${postId}`);
  }

  getPostById(postId: number): Observable<Post> {
    return this.http.get<Post>(`${this.postApiUrl}/${postId}`);
  }

  // 💬 Comments
  getCommentsByPostId(postId: number): Observable<Comment[]> {
    return this.http.get<Comment[]>(`${this.commentsUrl}/post/${postId}`);
  }

  addComment(postId: number, text: string): Observable<Comment> {
    return this.http.post<Comment>(`${this.commentsUrl}/post/${postId}`, { text });
  }

  updateComment(id: number, text: string): Observable<Comment> {
    return this.http.put<Comment>(`${this.commentsUrl}/${id}`, { text });
  }

  deleteComment(id: number): Observable<void> {
    return this.http.delete<void>(`${this.commentsUrl}/${id}`);
  }

  // 🔗 Resolver URL de mídia (img/video) para backend correto
  // Se vier "/uploads/..." ou relativo, prefixa com BASE_URL. Se já for absoluta, retorna como está.
  resolveMediaUrl(url: string | null | undefined): string {
    if (!url) return '';
    const trimmed = url.trim();
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      return trimmed;
    }
    if (trimmed.startsWith('/')) {
      return `${this.BASE_URL}${trimmed}`;
    }
    // Qualquer outro formato relativo
    return `${this.BASE_URL}/${trimmed.replace(/^\/*/, '')}`;
  }

  // Keep a single searchPosts implementation
  searchPosts(filters: {
    q?: string;
    type?: 'PHOTO' | 'VIDEO';
    albumId?: number;
    author?: string;
    createdFrom?: string;
    createdTo?: string;
    page?: number;
    size?: number;
  }): Observable<Post[]> {
    const params = new URLSearchParams();
    if (filters.q) params.set('q', filters.q);
    if (filters.type) params.set('type', filters.type);
    if (filters.albumId !== undefined) params.set('albumId', String(filters.albumId));
    if (filters.author) params.set('author', filters.author);
    if (filters.createdFrom) params.set('createdFrom', filters.createdFrom);
    if (filters.createdTo) params.set('createdTo', filters.createdTo);
    if (filters.page !== undefined) params.set('page', String(filters.page));
    if (filters.size !== undefined) params.set('size', String(filters.size));

    return this.http.get<any>(`${this.BASE_URL}/api/search/posts?${params.toString()}`).pipe(
      map((res) => Array.isArray(res) ? res : (res?.content ?? [])),
      catchError((error) => {
        return throwError(() => error);
      })
    );
  }

  // Endpoints de moderação de posts (ADMIN)
  adminUpdatePost(postId: number, post: Partial<Post>): Observable<Post> {
    return this.http.put<Post>(`${this.BASE_URL}/api/admin/posts/${postId}`, post);
  }

  adminDeletePost(postId: number): Observable<void> {
    return this.http.delete<void>(`${this.BASE_URL}/api/admin/posts/${postId}`);
  }

  warmup(): Observable<void> {
    return this.http.get(`${this.BASE_URL}/api/search/posts?page=0&size=1`)
      .pipe(map(() => void 0), catchError(() => of(void 0)));
  }

  createRoom(name: string): Observable<{ id: number; name: string }> {
    return this.http.post<{ id: number; name: string }>(`${this.BASE_URL}/api/chat/rooms`, { name });
  }

  getMyRooms(): Observable<Array<{ id: number; room: { id: number; name: string }, user: any }>> {
    return this.http.get<Array<{ id: number; room: { id: number; name: string }, user: any }>>(`${this.BASE_URL}/api/chat/rooms/mine`);
  }

  inviteToRoom(roomId: number, username: string): Observable<any> {
    return this.http.post<any>(`${this.BASE_URL}/api/chat/rooms/${roomId}/invite`, { username });
  }

  acceptInvite(inviteId: number): Observable<void> {
    return this.http.post<void>(`${this.BASE_URL}/api/chat/invites/${inviteId}/accept`, {});
  }

  // Atualizar perfil do usuário logado
  updateMe(profile: Partial<User>): Observable<User> {
    return this.http.put<User>(`${this.userApiUrl}/me`, profile).pipe(
      catchError((error) => throwError(() => error))
    );
  }

  // Alterar senha do usuário logado
  changePassword(payload: { currentPassword: string; newPassword: string }): Observable<void> {
    return this.http.post<void>(`${this.userApiUrl}/me/change-password`, payload).pipe(
      catchError((error) => throwError(() => error))
    );
  }

  getMyNotifications(): Observable<Notification[]> {
    return this.http.get<any>(`${this.BASE_URL}/api/notifications/mine`).pipe(
      map((res) => Array.isArray(res) ? res : (res?.content ?? [])),
      catchError((error) => throwError(() => error))
    );
  }

  markNotificationAsRead(id: number): Observable<void> {
    return this.http.put<void>(`${this.BASE_URL}/api/notifications/${id}/read`, {}).pipe(
      catchError((error) => throwError(() => error))
    );
  }
}
