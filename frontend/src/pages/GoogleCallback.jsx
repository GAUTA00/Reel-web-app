// src/pages/GoogleCallback.jsx
import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { loginWithGoogle } from '../api/auth';

export default function GoogleCallback() {
    const [params] = useSearchParams();
    const navigate = useNavigate();

    useEffect(() => {
        const code = params.get('code');

        if (code) {
            loginWithGoogle(code)
                .then(({ token, user }) => {
                    localStorage.setItem('token', token);
                    localStorage.setItem('user', JSON.stringify(user));
                    navigate('/feed');
                })
                .catch(err => {
                    console.error('Google login failed', err);
                    alert('Google login failed. Try again.');
                    navigate('/login');
                });
        } else {
            navigate('/login');
        }
    }, [params, navigate]);

    return (
        <div className="min-h-screen flex justify-center items-center text-white bg-black">
            Logging you in with Google...
        </div>
    );
}
