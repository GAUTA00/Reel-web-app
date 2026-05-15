import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
    const [user, setUser] = useState({ name: 'User', avatar: '/assets/profile.jpg' });
    const navigate = useNavigate();

    useEffect(() => {
        const userData = JSON.parse(localStorage.getItem('user')) || { name: 'User', avatar: '/assets/profile.jpg' };
        setUser(userData);
    }, []);

    // Example trending creators
    const trendingCreators = [
        { name: 'Zhiphyr', avatar: '/assets/profile.jpg', followers: 12000 },
        { name: 'Johnny', avatar: '/assets/profile2.jpg', followers: 9500 },
        { name: 'Ava', avatar: '/assets/profile3.jpg', followers: 8700 },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-purple-900 text-white">
            {/* Dashboard Header */}
            <header className="px-6 py-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl md:text-4xl font-extrabold mb-2">
                        👋 Welcome back, <span className="text-pink-400">{user.name}</span>!
                    </h1>
                </div>
                <div className="flex items-center gap-3">
                    <img
                        src={user.avatar || '/assets/profile.jpg'}
                        alt={user.name}
                        className="w-12 h-12 rounded-full border-2 border-pink-400 shadow"
                    />
                    <span className="font-bold text-lg">{user.name}</span>
                </div>
            </header>

            {/* Quick Stats */}
            <section className="flex flex-wrap gap-6 justify-center mb-10 px-4">
                <div className="bg-white/10 border border-white/20 rounded-xl px-8 py-6 shadow-lg backdrop-blur-md flex flex-col items-center min-w-[160px]">
                    <span className="text-pink-400 text-3xl mb-2">🔥</span>
                    <span className="text-2xl font-bold">Trending</span>
                    <span className="text-gray-300 text-sm">See what’s hot</span>
                </div>
                <div className="bg-white/10 border border-white/20 rounded-xl px-8 py-6 shadow-lg backdrop-blur-md flex flex-col items-center min-w-[160px]">
                    <span className="text-blue-400 text-3xl mb-2">🎥</span>
                    <span className="text-2xl font-bold">Your Reels</span>
                    <span className="text-gray-300 text-sm">Manage uploads</span>
                </div>
                <div className="bg-white/10 border border-white/20 rounded-xl px-8 py-6 shadow-lg backdrop-blur-md flex flex-col items-center min-w-[160px]">
                    <span className="text-green-400 text-3xl mb-2">👥</span>
                    <span className="text-2xl font-bold">Community</span>
                    <span className="text-gray-300 text-sm">Connect & follow</span>
                </div>
            </section>

            {/* Trending Creators */}
            <section className="max-w-4xl mx-auto mb-10 px-4">
                <h2 className="text-2xl font-bold mb-4 text-center text-yellow-300">Trending Creators</h2>
                <div className="flex flex-wrap gap-6 justify-center">
                    {trendingCreators.map((creator, idx) => (
                        <div
                            key={idx}
                            className="bg-white/10 border border-white/20 rounded-xl px-6 py-4 shadow-lg flex flex-col items-center min-w-[140px] hover:bg-pink-500/20 transition"
                        >
                            <img
                                src={creator.avatar}
                                alt={creator.name}
                                className="w-16 h-16 rounded-full border-2 border-pink-400 shadow mb-2"
                            />
                            <span className="font-bold text-lg">{creator.name}</span>
                            <span className="text-xs text-gray-300">{creator.followers} followers</span>
                            <button className="mt-2 px-4 py-1 rounded-full bg-pink-500 text-white text-xs font-semibold hover:bg-pink-600 transition">
                                Follow
                            </button>
                        </div>
                    ))}
                </div>
            </section>

            {/* Explore Reels */}
            <section className="max-w-4xl mx-auto mb-10 px-4">
                <h2 className="text-2xl font-bold mb-4 text-center text-pink-300">Explore Reels</h2>
                <div className="rounded-2xl overflow-hidden shadow-2xl border border-white/10">
                    <button
                        onClick={() => navigate('/feed')}
                        className="w-full py-4 bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 hover:from-pink-600 hover:to-yellow-600 text-white font-bold text-lg transition"
                    >
                        Explore More Reels
                    </button>
                </div>
            </section>

            {/* Call to Action */}
            <section className="text-center mb-10">
                <p className="text-lg text-gray-200">
                    <span className="font-semibold text-pink-400">Ready to go viral?</span> Start creating and sharing your moments now!
                </p>
            </section>
        </div>
    );
}