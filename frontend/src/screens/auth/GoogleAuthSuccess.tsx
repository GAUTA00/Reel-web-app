// src/screens/auth/GoogleAuthSuccess.tsx
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import type { User } from '../../types/user.types';

export default function GoogleAuthSuccess() {
  const navigate = useNavigate();
  const location = useLocation();
  const login = useAuthStore((s) => s.login);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    const userParam = params.get('user');

    if (token) {
      let user: User | null = null;

      // Try to parse user from URL param if backend sends it
      if (userParam) {
        try {
          user = JSON.parse(decodeURIComponent(userParam)) as User;
        } catch {
          // ignore parse error, will decode from token below
        }
      }

      // If no user in URL, decode from JWT payload (public claims only)
      if (!user) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          user = { _id: payload._id, email: payload.email, name: payload.name || payload.email } as User;
        } catch {
          user = { _id: '', email: '', name: 'User' } as User;
        }
      }

      // Save to Zustand (persisted as 'auth-storage' — the key axios reads)
      login(user, token);
      navigate('/feed');
    } else {
      alert('Google login failed');
      navigate('/login');
    }
  }, [location, navigate, login]);

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <p>Signing you in with Google...</p>
    </div>
  );
}
