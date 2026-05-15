// src/services/notificationService.ts
import axiosInstance from './axiosInstance';
import type { Notification } from '../types/notification.types';

export const getNotifications = async (): Promise<Notification[]> => {
  const res = await axiosInstance.get<Notification[]>('/notifications');
  return res.data;
};

export const markAsRead = async (id: string): Promise<Notification> => {
  const res = await axiosInstance.put<Notification>(`/notifications/${id}/read`);
  return res.data;
};

export const markAllAsRead = async (): Promise<{ message: string }> => {
  const res = await axiosInstance.put<{ message: string }>('/notifications/read-all');
  return res.data;
};
