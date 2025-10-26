import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  // 🔧 Ajuste automático de ambiente
  private readonly BASE_URL = (
    /^(localhost|127\.0\.0\.1|0\.0\.0\.0)$/.test(window.location.hostname)
      ? 'http://localhost:8080'
      : 'https://fotoland-backend.onrender.com'
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

    const token = this.getToken();
    const headers = new HttpHeaders({
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    });

    return this.http.post<{ fileUrl: string }>(
      `${this.uploadApiUrl}/upload`,
      formData,
      { headers }
    );
  }

  // 👤 Registro e login
  register(user: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, user);
  }

  login(credentials: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials);
  }

  // 🔑 Token e autenticação
  getToken(): string | null {
    return localStorage.getItem('jwt_token');
  }

  logout(): void {
    localStorage.removeItem('jwt_token');
    this.router.navigate(['/login']);
  }

  getMe(): Observable<any> {
    return this.http.get(`${this.userApiUrl}/me`, this.getAuthHeaders());
  }

  // 🖼️ Álbuns
  createAlbum(album: any): Observable<any> {
    return this.http.post(this.albumApiUrl, album, this.getAuthHeaders());
  }

  getMyAlbums(): Observable<any> {
    return this.http.get(`${this.albumApiUrl}/my`, this.getAuthHeaders());
  }

  getAllAlbums(): Observable<any> {
    return this.http.get(this.albumApiUrl, this.getAuthHeaders());
  }

  getAlbumById(id: number): Observable<any> {
    return this.http.get(`${this.albumApiUrl}/${id}`, this.getAuthHeaders());
  }

  updateAlbum(id: number, album: any): Observable<any> {
    return this.http.put(`${this.albumApiUrl}/${id}`, album, this.getAuthHeaders());
  }

  deleteAlbum(id: number): Observable<void> {
    return this.http.delete<void>(`${this.albumApiUrl}/${id}`, this.getAuthHeaders());
  }

  // 📬 Posts
  createPost(post: any, albumId: number): Observable<any> {
    return this.http.post(`${this.postApiUrl}/album/${albumId}`, post, this.getAuthHeaders());
  }

  getAllPosts(): Observable<any> {
    return this.http.get(this.postApiUrl, this.getAuthHeaders());
  }

  getPostsByAlbumId(albumId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.postApiUrl}/album/${albumId}`, this.getAuthHeaders());
  }

  updatePost(postId: number, post: any): Observable<any> {
    return this.http.put(`${this.postApiUrl}/${postId}`, post, this.getAuthHeaders());
  }

  deletePost(postId: number): Observable<any> {
    return this.http.delete(`${this.postApiUrl}/${postId}`, this.getAuthHeaders());
  }

  getPostById(postId: number): Observable<any> {
    return this.http.get(`${this.postApiUrl}/${postId}`, this.getAuthHeaders());
  }

  // 💬 Comments
  getCommentsByPostId(postId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.commentsUrl}/post/${postId}`, this.getAuthHeaders());
  }

  addComment(postId: number, text: string): Observable<any> {
    return this.http.post<any>(`${this.commentsUrl}/post/${postId}`, { text }, this.getAuthHeaders());
  }

  updateComment(id: number, text: string): Observable<any> {
    return this.http.put<any>(`${this.commentsUrl}/${id}`, { text }, this.getAuthHeaders());
  }

  deleteComment(id: number): Observable<void> {
    return this.http.delete<void>(`${this.commentsUrl}/${id}`, this.getAuthHeaders());
  }

  // 🧱 Cabeçalhos padrão com token
  private getAuthHeaders() {
    const token = this.getToken();
    const headers = new HttpHeaders({
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    });
    return { headers };
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

  // 🔄 Alias para compatibilidade com código existente
  createComment(postId: number, text: string): Observable<any> {
    return this.addComment(postId, text);
  }
}
