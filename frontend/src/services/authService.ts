// src/services/authService.ts
import axiosInstance from './axiosInstance';
import type { AuthResponse, LoginFormData, SignupFormData } from '../types/auth.types';

export const loginUser = async (data: LoginFormData): Promise<AuthResponse> => {
  const res = await axiosInstance.post<AuthResponse>('/auth/login', data);
  return res.data;
};

export const registerUser = async (data: SignupFormData): Promise<AuthResponse> => {
  const res = await axiosInstance.post<AuthResponse>('/auth/register', data);
  return res.data;
};

export const loginWithGoogle = async (code: string): Promise<AuthResponse> => {
  const res = await axiosInstance.get<AuthResponse>(`/auth/google?code=${code}`);
  return res.data;
};
