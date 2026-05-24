// src/types/reel.types.ts
import type { UserSummary } from './user.types';

export interface Comment {
  _id: string;
  text: string;           // ✅ matches backend Comment model field name
  user: UserSummary;
  parentId?: string | null;
  replies?: Comment[];
  createdAt?: string;
}

export interface Reel {
  _id: string;
  videoUrl: string;
  title: string;
  uploadedBy: UserSummary; // ✅ matches backend populate('uploadedBy', 'name image')
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
}
