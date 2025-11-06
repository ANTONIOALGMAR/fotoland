export enum AlbumType {
  GENERAL = 'GENERAL',
  PROFILE = 'PROFILE',
  LOCATION = 'LOCATION',
  EVENT = 'EVENT'
}

export enum PostType {
  PHOTO = 'PHOTO',
  VIDEO = 'VIDEO'
}

export interface User {
  id: number;
  username: string;
  role?: 'USER' | 'ADMIN';
  fullName?: string;
  email?: string;
  phoneNumber?: string;
  address?: string;
  profilePictureUrl?: string;
  state?: string;
  country?: string;
  cep?: string;
}

export interface Post {
  id: number;
  caption: string;
  mediaUrl: string;
  type: PostType;
  createdAt: string; // or Date
}

export interface Album {
  id: number;
  title: string;
  description: string;
  type: AlbumType;
  location?: string;
  eventName?: string;
  author: User;
  posts: Post[];
}

export interface Comment {
  id: number;
  text: string;
  author: User;
  createdAt: string; // or Date
}

export interface Notification {
  id: number;
  type: 'POST_COMMENT' | 'POST_LIKE' | 'COMMENT_LIKE' | 'CHAT_INVITE' | 'CHAT_MESSAGE';
  payload: string; // JSON string
  createdAt: string; // ISO 8601
  readAt?: string; // ISO 8601
}

export interface Page<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
}