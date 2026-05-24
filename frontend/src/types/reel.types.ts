// src/types/reel.types.ts
import type { UserSummary } from './user.types';

export interface Comment {
  _id: string;
  text: string;
  user: UserSummary;
  parentId?: string | null;
  replies?: Comment[];
  createdAt?: string;
}

export interface Reel {
  _id: string;
  videoUrl: string;
  thumbnail?: string;          // Cloudinary eager JPG thumbnail
  title: string;
  music?: string;              // Optional sound name
  tags?: string[];             // Parsed hashtags
  uploadedBy: UserSummary;
  likes: string[];
  views: number;
  shares?: number;
  comments?: Comment[];
  createdAt: string;
}

export interface FetchReelsResponse {
  reels: Reel[];
  totalPages: number;
  currentPage: number;
  totalReels?: number;
  tag?: string;
}
