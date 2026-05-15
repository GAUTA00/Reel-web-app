// src/types/reel.types.ts
import type { UserSummary } from './user.types';

export interface Comment {
  _id: string;
  comment: string;
  user: UserSummary;
  parentId?: string | null;
  replies?: Comment[];
  createdAt?: string;
}

export interface Reel {
  _id: string;
  videoUrl: string;
  title: string;
  user: UserSummary;
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
