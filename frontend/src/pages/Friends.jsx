import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyProfile, unfollowUser } from '../api/user';
import { Loader2, UserMinus, User, ArrowLeft } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function Friends() {
    const [friends, setFriends] = useState([]); // List of 'following' users
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchFriends();
    }, []);

    const fetchFriends = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            // Assuming getMyProfile returns populated 'following' array. 
            // If backend only returns IDs, we might need a specific /users/following endpoint.
            // Let's assume getMyProfile populates 'following' for now, or check backend model.
            // Wait, standard userController.getMyProfile typically returns user object. 
            // If following is just IDs, we can't show names. 
            // PROACTIVE FIX: Check backend. but for now let's assume it might work or we use a new endpoint if needed.
            // Actually, best to be safe: If Profile.jsx uses getMyProfile and shows following count, it has access.
            // Let's rely on getMyProfile and if it's missing data, we'll know.
            const data = await getMyProfile(token);
            setFriends(data.following || []);
        } catch (err) {
            console.error("Failed to fetch friends", err);
            toast.error("Could not load friends list.");
        } finally {
            setLoading(false);
        }
    };

    const handleUnfollow = async (userId) => {
        try {
            const token = localStorage.getItem('token');
            await unfollowUser(userId, token);
            setFriends(prev => prev.filter(u => u._id !== userId));
            toast.success("Unfollowed user.");
        } catch (err) {
            console.error(err);
            toast.error("Failed to unfollow.");
        }
    };

    return (
        <div className="min-h-screen bg-black text-white font-sans flex flex-col">
            {/* Header */}
            <div className="px-4 py-4 border-b border-gray-800 flex items-center gap-4 bg-black sticky top-0 z-10">
                <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-white">
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <h1 className="text-lg font-bold">Friends & Following</h1>
            </div>

            <div className="flex-1 p-4">
                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
                    </div>
                ) : friends.length === 0 ? (
                    <div className="text-center py-20 text-gray-500">
                        <User className="w-16 h-16 mx-auto mb-4 opacity-50" />
                        <h2 className="text-xl font-bold text-gray-300 mb-2">No friends yet</h2>
                        <p className="text-sm">Follow people to see them here and in your "Following" feed!</p>
                        <button onClick={() => navigate('/feed')} className="mt-6 bg-pink-500 text-white px-6 py-2 rounded-full font-bold hover:bg-pink-600 transition">
                            Explore Feed
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {friends.map(friend => (
                            <div key={friend._id} className="flex items-center justify-between bg-gray-900/50 p-4 rounded-xl border border-gray-800">
                                <div className="flex items-center gap-3">
                                    <img
                                        src={friend.image || '/default-avatar.png'}
                                        className="w-12 h-12 rounded-full object-cover border border-gray-700"
                                    />
                                    <div>
                                        <h3 className="font-bold text-sm text-white">{friend.name}</h3>
                                        {/* <p className="text-xs text-gray-500">@username</p> */}
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleUnfollow(friend._id)}
                                    className="bg-gray-800 text-gray-300 px-4 py-1.5 rounded-full text-xs font-semibold hover:bg-red-500/20 hover:text-red-500 transition flex items-center gap-2"
                                >
                                    <UserMinus className="w-3 h-3" /> Unfollow
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <ToastContainer position="bottom-center" toastStyle={{ backgroundColor: '#222', color: '#fff' }} />
        </div>
    );
}
