import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function Signup() {
    const navigate = useNavigate();
    const [form, setForm] = useState({ name: '', email: '', password: '' });
    const [loading, setLoading] = useState(false);

    const handleChange = e => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async e => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await axios.post('http://localhost:8080/auth/register', form);
            const { token, user } = res.data;
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            toast.success('Account created.');
            setTimeout(() => navigate('/feed'), 1500);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 font-sans">

            {/* Header */}
            <div className="mb-12 text-center animate-fade-in">
                <h2 className="font-serif text-4xl mb-4 tracking-tight">Join Reelify</h2>
                <p className="text-gray-500 text-sm tracking-wide">START YOUR JOURNEY</p>
            </div>

            <form onSubmit={handleSubmit} className="w-full max-w-sm flex flex-col gap-8 animate-slideUp">

                {/* Minimal Inputs */}
                <div className="group">
                    <input
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        type="text"
                        placeholder="FULL NAME"
                        className="w-full bg-transparent border-b border-gray-800 py-3 text-white placeholder-gray-600 focus:border-white focus:outline-none transition-colors text-sm tracking-wide"
                        required
                    />
                </div>
                <div className="group">
                    <input
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        type="email"
                        placeholder="EMAIL ADDRESS"
                        className="w-full bg-transparent border-b border-gray-800 py-3 text-white placeholder-gray-600 focus:border-white focus:outline-none transition-colors text-sm tracking-wide"
                        required
                    />
                </div>
                <div className="group">
                    <input
                        name="password"
                        value={form.password}
                        onChange={handleChange}
                        type="password"
                        placeholder="PASSWORD"
                        className="w-full bg-transparent border-b border-gray-800 py-3 text-white placeholder-gray-600 focus:border-white focus:outline-none transition-colors text-sm tracking-wide"
                        required
                    />
                </div>

                {/* Primary Action */}
                <button
                    type="submit"
                    disabled={loading}
                    className="mt-4 w-full bg-white text-black font-bold text-xs py-4 tracking-widest hover:bg-gray-200 transition-colors disabled:opacity-50"
                >
                    {loading ? 'CREATING...' : 'SIGN UP'}
                </button>

                <div className="mt-8 text-center">
                    <button
                        type="button"
                        onClick={() => navigate('/login')}
                        className="text-gray-500 text-xs tracking-wide hover:text-white transition-colors border-b border-transparent hover:border-gray-500 pb-0.5"
                    >
                        ALREADY HAVE AN ACCOUNT?
                    </button>
                </div>
            </form>
            <ToastContainer position="bottom-center" toastStyle={{ backgroundColor: '#111', color: '#fff' }} />
        </div>
    );
}
