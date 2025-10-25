import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'https://fotoland-backend.onrender.com/api/auth';
  private userApiUrl = 'http://localhost:8080/api/user';
  private albumApiUrl = 'http://localhost:8080/api/albums'; // New API URL for albums
  private uploadApiUrl = 'http://localhost:8080/api'; // New API URL for uploads

  constructor(private http: HttpClient) { }

  uploadProfilePicture(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);

    const token = this.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    // Angular and the browser will handle the Content-Type header automatically for FormData
    return this.http.post(`${this.uploadApiUrl}/upload`, formData, { headers });
  }

  register(user: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, user);
  }

  login(credentials: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials);
  }

  getToken(): string | null {
    return localStorage.getItem('jwt_token');
  }

  getMe(): Observable<any> {
    const token = this.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.get(`${this.userApiUrl}/me`, { headers });
  }

  createAlbum(album: any): Observable<any> {
    const token = this.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.post(this.albumApiUrl, album, { headers });
  }

  getMyAlbums(): Observable<any> {
    const token = this.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.get(`${this.albumApiUrl}/my`, { headers });
  }

  getAllAlbums(): Observable<any> {
    const token = this.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.get(this.albumApiUrl, { headers });
  }

  createPost(post: any, albumId: number): Observable<any> {
    const token = this.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.post(`http://localhost:8080/api/posts/album/${albumId}`, post, { headers });
  }

  updatePost(postId: number, post: any): Observable<any> {
    const token = this.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.put(`http://localhost:8080/api/posts/${postId}`, post, { headers });
  }

  deletePost(postId: number): Observable<any> {
    const token = this.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.delete(`http://localhost:8080/api/posts/${postId}`, { headers });
  }

  getPostById(postId: number): Observable<any> {
    const token = this.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.get(`http://localhost:8080/api/posts/${postId}`, { headers });
  }
}
