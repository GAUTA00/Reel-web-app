// src/screens/auth/GoogleCallback.tsx
import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { loginWithGoogle } from '../../services/authService';
import { useAuthStore } from '../../store/authStore';

export default function GoogleCallback() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);

  useEffect(() => {
    const code = params.get('code');

    if (code) {
      loginWithGoogle(code)
        .then(({ token, user }) => {
          login(user, token);
          navigate('/feed');
        })
        .catch((err: Error) => {
          console.error('Google login failed', err);
          alert('Google login failed. Try again.');
          navigate('/login');
        });
    } else {
      navigate('/login');
    }
  }, [params, navigate, login]);

  return (
    <div className="min-h-screen flex justify-center items-center text-white bg-black">
      Logging you in with Google...
    </div>
  );
}
