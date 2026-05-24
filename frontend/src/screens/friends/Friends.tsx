// src/screens/friends/Friends.tsx
import { useNavigate } from 'react-router-dom';
import { Loader2, UserMinus, User, ArrowLeft } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useFriends } from './useFriends';
import type { UserSummary } from '../../types/user.types';

export default function Friends() {
  const navigate = useNavigate();
  const { friendsQuery, unfollowMutation } = useFriends();

  const friends = friendsQuery.data ?? [];
  const isLoading = friendsQuery.isLoading;

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
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
          </div>
        ) : friends.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <User className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <h2 className="text-xl font-bold text-gray-300 mb-2">No friends yet</h2>
            <p className="text-sm">Follow people to see them here and in your &quot;Following&quot; feed!</p>
            <button onClick={() => navigate('/feed')} className="mt-6 bg-pink-500 text-white px-6 py-2 rounded-full font-bold hover:bg-pink-600 transition">
              Explore Feed
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {friends.map((friend: UserSummary) => (
              <div key={friend._id} className="flex items-center justify-between bg-gray-900/50 p-4 rounded-xl border border-gray-800">
                <div className="flex items-center gap-3">
                  <img
                    src={friend.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(friend.name)}&background=374151&color=fff`}
                    className="w-12 h-12 rounded-full object-cover border border-gray-700"
                    alt={friend.name}
                  />
                  <div>
                    <h3 className="font-bold text-sm text-white">{friend.name}</h3>
                  </div>
                </div>
                <button
                  onClick={() => unfollowMutation.mutate(friend._id)}
                  disabled={unfollowMutation.isPending}
                  className="bg-gray-800 text-gray-300 px-4 py-1.5 rounded-full text-xs font-semibold hover:bg-red-500/20 hover:text-red-500 transition flex items-center gap-2 disabled:opacity-50"
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
