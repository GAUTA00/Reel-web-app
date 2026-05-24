// src/services/reelService.ts
import axiosInstance from './axiosInstance';
import type { Comment, FetchReelsResponse, Reel } from '../types/reel.types';

export const fetchReels = async (page = 1, limit = 5): Promise<FetchReelsResponse> => {
  const res = await axiosInstance.get<FetchReelsResponse>(`/reels/all?page=${page}&limit=${limit}`);
  return res.data;
};

export const fetchFollowingReels = async (page = 1, limit = 5): Promise<FetchReelsResponse> => {
  const res = await axiosInstance.get<FetchReelsResponse>(`/reels/following?page=${page}&limit=${limit}`);
  return res.data;
};

export const fetchMyReels = async (): Promise<Reel[]> => {
  const res = await axiosInstance.get<Reel[]>('/reels/my');
  return res.data;
};

export const fetchUserReels = async (userId: string): Promise<Reel[]> => {
  const res = await axiosInstance.get<Reel[]>(`/reels/user/${userId}`);
  return res.data;
};

export const fetchLikedReels = async (): Promise<Reel[]> => {
  const res = await axiosInstance.get<Reel[]>('/reels/liked');
  return res.data;
};

export const fetchComments = async (reelId: string): Promise<Comment[]> => {
  const res = await axiosInstance.get<Comment[]>(`/reels/${reelId}/comments`);
  return res.data;
};

export const addComment = async (
  reelId: string,
  comment: string,
  parentId: string | null = null
): Promise<Comment> => {
  const res = await axiosInstance.post<Comment>(`/reels/${reelId}/comment`, { comment, parentId });
  return res.data;
};

export const deleteComment = async (commentId: string): Promise<{ message: string }> => {
  const res = await axiosInstance.delete<{ message: string }>(`/reels/comment/${commentId}`);
  return res.data;
};

export interface LikeReelResponse {
  liked: boolean;
  likesCount: number;
}

export const likeReel = async (reelId: string): Promise<LikeReelResponse> => {
  const res = await axiosInstance.post<LikeReelResponse>(`/reels/${reelId}/like`);
  return res.data;
};

export const viewReel = async (reelId: string): Promise<void> => {
  try {
    await axiosInstance.post(`/reels/${reelId}/view`);
  } catch (e) {
    console.error('Failed to count view', e);
  }
};

export const shareReel = async (reelId: string): Promise<{ shares: number }> => {
  const res = await axiosInstance.post<{ shares: number }>(`/reels/${reelId}/share`);
  return res.data;
};

export const deleteReel = async (reelId: string): Promise<{ message: string }> => {
  const res = await axiosInstance.delete<{ message: string }>(`/reels/${reelId}`);
  return res.data;
};

export const uploadReel = async (formData: FormData): Promise<Reel> => {
  const res = await axiosInstance.post<Reel>('/reels/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
};

export const fetchReelsByTag = async (tag: string, page = 1, limit = 5): Promise<FetchReelsResponse> => {
  const res = await axiosInstance.get<FetchReelsResponse>(`/reels/tag/${encodeURIComponent(tag)}?page=${page}&limit=${limit}`);
  return res.data;
};
