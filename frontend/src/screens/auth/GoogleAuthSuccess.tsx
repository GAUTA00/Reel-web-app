// src/screens/auth/GoogleAuthSuccess.tsx
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function GoogleAuthSuccess() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');

    if (token) {
      localStorage.setItem('token', token);
      navigate('/feed');
    } else {
      alert('Google login failed');
      navigate('/login');
    }
  }, [location, navigate]);

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <p>Signing you in with Google...</p>
    </div>
  );
}
