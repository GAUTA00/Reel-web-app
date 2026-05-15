import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, Home, Plus, Bell, User, LogOut, Users, Search } from 'lucide-react'; // Added Search icon
import ReelCard from '../components/ReelCard';
import { fetchReels, fetchFollowingReels } from '../api/reel';

// ErrorBoundary for catching render errors
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }
    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }
    componentDidCatch(error, errorInfo) {
        this.setState({ error, errorInfo });
        console.error('[ErrorBoundary] Caught error:', error, errorInfo);
    }
    render() {
        if (this.state.hasError) {
            return (
                <div className="flex flex-col justify-center items-center h-screen text-red-500 bg-black">
                    <h2 className="text-2xl font-bold mb-2">Something went wrong in Feed.</h2>
                    <button onClick={() => window.location.reload()} className="bg-white text-black px-4 py-2 rounded mt-4">Reload</button>
                </div>
            );
        }
        return this.props.children;
    }
}

function Feed() {
    const [reels, setReels] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [activeReelId, setActiveReelId] = useState(null);
    const [showMenu, setShowMenu] = useState(false); // For top right hamburger
    const [activeTab, setActiveTab] = useState('foryou'); // 'foryou' | 'following'
    const navigate = useNavigate();

    // Reset list when tab changes
    useEffect(() => {
        setReels([]);
        setPage(1);
        setHasMore(true);
        setLoading(false); // Reset loading state too
        // Fetch immediately
        loadReels(1, activeTab);
    }, [activeTab]);

    // Independent load function
    const loadReels = async (pageNum, tab) => {
        setLoading(true);
        try {
            let data;
            const token = localStorage.getItem('token');
            if (tab === 'following') {
                data = await fetchFollowingReels(pageNum, 5, token);
            } else {
                data = await fetchReels(pageNum, 5);
            }

            setReels(prev => {
                // If page 1, replace. Else append.
                if (pageNum === 1) return data.reels;
                const newReels = data.reels.filter(n => !prev.some(p => p._id === n._id));
                return [...prev, ...newReels];
            });
            setHasMore(pageNum < data.totalPages);
        } catch (err) {
            setError('Failed to load reels');
            console.error(err);
        }
        setLoading(false);
    };

    // Observer for "load more"
    const observer = useRef();
    const lastReelElementRef = useCallback(node => {
        if (loading) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                const nextPage = page + 1;
                setPage(nextPage);
                loadReels(nextPage, activeTab);
            }
        });
        if (node) observer.current.observe(node);
    }, [loading, hasMore, page, activeTab]);

    // Observer for "active video" (Smart Playback)
    const viewObserver = useRef();
    useEffect(() => {
        const options = { threshold: 0.6 }; // 60% visible to be valid
        viewObserver.current = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    setActiveReelId(entry.target.getAttribute('data-id'));
                }
            });
        }, options);

        const reelElements = document.querySelectorAll('.reel-container');
        reelElements.forEach(el => viewObserver.current.observe(el));

        return () => {
            if (viewObserver.current) viewObserver.current.disconnect();
        };
    }, [reels]);


    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
    };

    return (
        <ErrorBoundary>
            <div className="relative h-[100dvh] bg-black overflow-hidden flex flex-col">
                {/* 🔝 TOP BAR (Overlay) */}
                <header className="absolute top-0 w-full z-40 flex items-center justify-between px-4 py-4 bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
                    {/* Left Spacer (for balance) */}
                    <div className="w-8 pointer-events-auto">
                        {/* Maybe Live button here later */}
                    </div>

                    {/* Center Tabs */}
                    <div className="flex gap-4 font-bold text-lg drop-shadow-md pointer-events-auto select-none">
                        <button
                            onClick={() => setActiveTab('following')}
                            className={`transition-colors ${activeTab === 'following' ? 'text-white border-b-2 border-white pb-0.5' : 'text-gray-400 hover:text-white'}`}
                        >
                            Following
                        </button>
                        <span className="text-gray-600">|</span>
                        <button
                            onClick={() => setActiveTab('foryou')}
                            className={`transition-colors ${activeTab === 'foryou' ? 'text-white border-b-2 border-white pb-0.5' : 'text-gray-400 hover:text-white'}`}
                        >
                            For You
                        </button>
                    </div>

                    {/* Right Hamburger */}
                    <div className="relative pointer-events-auto">
                        <button onClick={() => setShowMenu(!showMenu)}>
                            <Menu className="w-7 h-7 text-white" />
                        </button>
                        {showMenu && (
                            <div className="absolute right-0 mt-2 w-48 bg-gray-900 rounded-lg shadow-xl border border-gray-800 overflow-hidden">
                                <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-3 text-red-400 hover:bg-white/10 w-full text-left">
                                    <LogOut className="w-4 h-4" /> Logout
                                </button>
                            </div>
                        )}
                    </div>
                </header>

                {/* 🔄 Reels Feed */}
                <div className="flex-1 overflow-y-scroll snap-y snap-mandatory scrollbar-hide h-full">
                    {/* Error state */}
                    {error && (
                        <div className="flex flex-col justify-center items-center h-full text-red-500">
                            <p>{error}</p>
                        </div>
                    )}

                    {reels.length === 0 && !loading && (
                        <div className="flex flex-col justify-center items-center h-full text-gray-500">
                            <p>No reels found.</p>
                            {activeTab === 'following' && <p className="text-xs mt-2">Follow more people to see content here!</p>}
                        </div>
                    )}

                    {reels.map((reel, index) => {
                        let fixedReel = { ...reel };
                        if (fixedReel.videoUrl && !fixedReel.videoUrl.startsWith('http')) {
                            fixedReel.videoUrl = `http://localhost:8080${fixedReel.videoUrl}`;
                        }

                        return (
                            <div
                                ref={reels.length === index + 1 ? lastReelElementRef : null}
                                key={reel._id}
                                data-id={reel._id}
                                className="reel-container snap-start w-full h-[100dvh] relative bg-black flex items-center justify-center"
                            >
                                <ReelCard reel={fixedReel} isActive={activeReelId === reel._id} />
                            </div>
                        );
                    })}

                    {loading && (
                        <div className="snap-start h-[100dvh] w-full flex justify-center items-center bg-black text-gray-500">
                            Loading more...
                        </div>
                    )}
                </div>

                {/* 🔽 BOTTOM NAV BAR (Fixed) */}
                <nav className="fixed bottom-0 w-full z-50 bg-black border-t border-white/10 px-6 py-3 flex justify-between items-center text-white">
                    <Link to="/feed" className="flex flex-col items-center opacity-100 transition hover:scale-105">
                        <Home className="w-6 h-6 fill-white" />
                        <span className="text-[10px] mt-0.5 font-bold">Home</span>
                    </Link>

                    <Link to="/search" className="flex flex-col items-center opacity-60 hover:opacity-100 transition">
                        <Search className="w-6 h-6" />
                        <span className="text-[10px] mt-0.5">Search</span>
                    </Link>

                    <Link to="/upload" className="relative -top-1">
                        <div className="w-12 h-8 bg-gradient-to-r from-cyan-400 to-pink-500 rounded-lg flex items-center justify-center p-[2px] hover:scale-110 transition">
                            <div className="w-full h-full bg-black rounded-[6px] flex items-center justify-center">
                                <div className="bg-white text-black w-full h-full rounded-[4px] flex items-center justify-center">
                                    <Plus className="w-5 h-5 font-bold" />
                                </div>
                            </div>
                        </div>
                    </Link>

                    <Link to="/notifications" className="flex flex-col items-center opacity-60 hover:opacity-100 transition">
                        <Bell className="w-6 h-6" />
                        <span className="text-[10px] mt-0.5">Inbox</span>
                    </Link>

                    <Link to="/profile" className="flex flex-col items-center opacity-60 hover:opacity-100 transition">
                        <div className="w-6 h-6 bg-gray-700 rounded-full border border-white/50 overflow-hidden">
                            {/* Ideally, load user avatar here */}
                            <User className="w-full h-full p-1 text-gray-400" />
                        </div>
                        <span className="text-[10px] mt-0.5">Profile</span>
                    </Link>
                </nav>
            </div>
        </ErrorBoundary>
    );
}

export default Feed;
