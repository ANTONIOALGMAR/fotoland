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
  // Add other user properties as needed
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