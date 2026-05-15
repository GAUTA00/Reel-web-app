// src/services/userService.ts
import axiosInstance from './axiosInstance';
import type { User } from '../types/user.types';

export const getMyProfile = async (): Promise<User> => {
  const res = await axiosInstance.get<User>('/users/me');
  return res.data;
};

export const getUserProfile = async (userId: string): Promise<User> => {
  const res = await axiosInstance.get<User>(`/users/${userId}`);
  return res.data;
};

export const updateProfile = async (formData: FormData): Promise<{ user: User }> => {
  const res = await axiosInstance.put<{ user: User }>('/users/update-profile', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
};

export const followUser = async (userId: string): Promise<{ message: string }> => {
  const res = await axiosInstance.post<{ message: string }>(`/users/follow/${userId}`);
  return res.data;
};

export const unfollowUser = async (userId: string): Promise<{ message: string }> => {
  const res = await axiosInstance.post<{ message: string }>(`/users/unfollow/${userId}`);
  return res.data;
};

export const searchUsers = async (query: string): Promise<User[]> => {
  const res = await axiosInstance.get<User[]>(`/users/search?query=${encodeURIComponent(query)}`);
  return res.data;
};
