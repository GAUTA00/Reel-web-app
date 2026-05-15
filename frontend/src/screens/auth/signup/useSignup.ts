// src/screens/auth/signup/useSignup.ts
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { registerUser } from '../../../services/authService';
import { useAuthStore } from '../../../store/authStore';
import type { SignupFormData } from '../../../types/auth.types';

export const useSignup = () => {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);

  return useMutation({
    mutationFn: (data: SignupFormData) => registerUser(data),
    onSuccess: ({ token, user }) => {
      login(user, token);
      toast.success('Account created. Welcome!');
      setTimeout(() => navigate('/feed'), 1000);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Registration failed');
    },
  });
};
