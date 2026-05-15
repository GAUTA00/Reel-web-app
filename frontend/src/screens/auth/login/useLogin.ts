// src/screens/auth/login/useLogin.ts
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { loginUser } from '../../../services/authService';
import { useAuthStore } from '../../../store/authStore';
import type { LoginFormData } from '../../../types/auth.types';

export const useLogin = () => {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);

  return useMutation({
    mutationFn: (data: LoginFormData) => loginUser(data),
    onSuccess: ({ token, user }) => {
      login(user, token);
      toast.success('Welcome back.');
      setTimeout(() => navigate('/feed'), 1000);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Login failed');
    },
  });
};
