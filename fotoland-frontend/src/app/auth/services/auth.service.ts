import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  // 🔧 Ajuste automático de ambiente
  private readonly BASE_URL =
    window.location.hostname === 'localhost'
      ? 'http://localhost:8080'
      : 'https://fotoland-backend.onrender.com';

  private readonly apiUrl = `${this.BASE_URL}/api/auth`;
  private readonly userApiUrl = `${this.BASE_URL}/api/user`;
  private readonly albumApiUrl = `${this.BASE_URL}/api/albums`;
  private readonly uploadApiUrl = `${this.BASE_URL}/api`;
  private readonly postApiUrl = `${this.BASE_URL}/api/posts`;

  constructor(private http: HttpClient) {}

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

  // 📬 Posts
  createPost(post: any, albumId: number): Observable<any> {
    return this.http.post(`${this.postApiUrl}/album/${albumId}`, post, this.getAuthHeaders());
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

  // 🧱 Cabeçalhos padrão com token
  private getAuthHeaders() {
    const token = this.getToken();
    const headers = new HttpHeaders({
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    });
    return { headers };
  }
}
