// src/screens/profile/Profile.tsx
import { useNavigate, useParams } from 'react-router-dom';
import { useState, useRef } from 'react';
import { ArrowLeft, Settings, Grid, Heart, Video, Trash2, Play } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import { useProfile } from './useProfile';
import { useAuthStore } from '../../store/authStore';
import ProfileSkeleton from '../../components/skeletons/ProfileSkeleton';
import type { Reel } from '../../types/reel.types';

export default function Profile() {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const { user: currentUser } = useAuthStore();

  const [editing, setEditing] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [imageInput, setImageInput] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'grid' | 'liked'>('grid');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    profileQuery,
    reelsQuery,
    likedReelsQuery,
    followMutation,
    unfollowMutation,
    updateProfileMutation,
    deleteReelMutation,
  } = useProfile(id);

  const profile = profileQuery.data;
  const reels = reelsQuery.data ?? [];
  const likedReels = likedReelsQuery.data ?? [];

  const isOwnProfile = !id || (currentUser && profile && currentUser._id === profile._id);
  const isFollowing = profile?.followers?.some((f) => f._id === currentUser?._id) ?? false;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleSave = () => {
    const formData = new FormData();
    formData.append('name', nameInput);
    if (selectedFile) {
      formData.append('image', selectedFile);
    } else if (imageInput) {
      formData.append('image', imageInput);
    }
    updateProfileMutation.mutate(formData, {
      onSuccess: () => {
        setEditing(false);
        setPreviewImage(null);
        setSelectedFile(null);
      },
    });
  };

  const handleFollowToggle = () => {
    if (isFollowing) {
      unfollowMutation.mutate();
    } else {
      followMutation.mutate();
    }
  };

  const handleDeleteReel = (e: React.MouseEvent, reelId: string) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this reel?')) {
      deleteReelMutation.mutate(reelId);
    }
  };

  if (profileQuery.isLoading || reelsQuery.isLoading) {
    return <ProfileSkeleton />;
  }
  if (profileQuery.isError) {
    return <div className="min-h-screen bg-black text-red-500 flex items-center justify-center">Failed to load profile</div>;
  }
  if (!profile) return null;

  const totalLikes = reels.reduce((acc: number, reel: Reel) => acc + (reel.likes?.length || 0), 0);

  return (
    <div className="min-h-screen bg-black text-white pb-20 font-sans">
      <ToastContainer theme="dark" position="bottom-center" />

      {/* Navbar */}
      <header className="sticky top-0 bg-black/95 backdrop-blur z-50 flex justify-between items-center p-4 border-b border-white/10">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/10 rounded-full">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="font-bold text-lg">{profile.name}</h1>
        {isOwnProfile ? (
          <button className="p-2 hover:bg-white/10 rounded-full">
            <Settings className="w-6 h-6" />
          </button>
        ) : <div className="w-10" />}
      </header>

      {/* Profile Header */}
      <div className="flex flex-col items-center pt-8 pb-6 px-4">
        {/* Avatar */}
        <div className="relative mb-4">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageChange}
            className="hidden"
            accept="image/*"
          />
          <img
            src={previewImage || profile.image || 'https://via.placeholder.com/150'}
            alt="Profile"
            className={`w-24 h-24 rounded-full object-cover border-2 border-gray-800 ${isOwnProfile && editing ? 'cursor-pointer opacity-80 hover:opacity-100' : ''}`}
            onClick={() => isOwnProfile && editing && fileInputRef.current?.click()}
          />
          {isOwnProfile && editing && (
            <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center cursor-pointer pointer-events-none">
              <span className="text-xs">Tap to Change</span>
            </div>
          )}
        </div>

        {/* Name & Edit */}
        {editing ? (
          <div className="flex flex-col gap-2 w-full max-w-xs text-center">
            <input
              className="bg-gray-800 text-white p-2 rounded text-center"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder="Name"
            />
            <input
              className="bg-gray-800 text-white p-2 text-xs rounded text-center"
              value={imageInput}
              onChange={(e) => setImageInput(e.target.value)}
              placeholder="Image URL"
            />
            <div className="flex gap-2 justify-center mt-2">
              <button onClick={handleSave} disabled={updateProfileMutation.isPending} className="bg-pink-500 px-4 py-1 rounded text-sm font-bold disabled:opacity-50">
                {updateProfileMutation.isPending ? 'Saving...' : 'Save'}
              </button>
              <button onClick={() => setEditing(false)} className="bg-gray-700 px-4 py-1 rounded text-sm">Cancel</button>
            </div>
          </div>
        ) : (
          <>
            <h2 className="text-xl font-bold">@{profile.name.replace(/\s+/g, '').toLowerCase()}</h2>
            <p className="text-sm text-gray-400 mt-1 mb-4 text-center max-w-sm">Creating awesome content. 🚀</p>
          </>
        )}

        {/* Stats */}
        <div className="flex justify-center gap-8 w-full border-y border-white/10 py-4 my-4">
          <div className="flex flex-col items-center">
            <span className="font-bold text-lg">{profile.following?.length || 0}</span>
            <span className="text-xs text-gray-400">Following</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="font-bold text-lg">{profile.followers?.length || 0}</span>
            <span className="text-xs text-gray-400">Followers</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="font-bold text-lg">{totalLikes}</span>
            <span className="text-xs text-gray-400">Likes</span>
          </div>
        </div>

        {/* Actions */}
        <div className="w-full max-w-xs flex gap-2 justify-center">
          {isOwnProfile ? (
            !editing && (
              <button onClick={() => { setEditing(true); setNameInput(profile.name); setImageInput(profile.image ?? ''); }} className="border border-gray-600 px-8 py-2 rounded-md font-semibold text-sm hover:bg-white/5 transition w-full">
                Edit profile
              </button>
            )
          ) : (
            <button
              onClick={handleFollowToggle}
              disabled={followMutation.isPending || unfollowMutation.isPending}
              className={`px-8 py-2 rounded-md font-semibold text-sm transition w-full ${isFollowing ? 'bg-gray-800 text-white border border-gray-700' : 'bg-pink-500 text-white'}`}
            >
              {isFollowing ? 'Following' : 'Follow'}
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-t border-white/10">
        <button onClick={() => setActiveTab('grid')} className={`flex-1 flex justify-center py-3 border-b-2 text-white transition ${activeTab === 'grid' ? 'border-white' : 'border-transparent text-gray-500'}`}>
          <Grid className="w-5 h-5" />
        </button>
        {isOwnProfile && (
          <button onClick={() => setActiveTab('liked')} className={`flex-1 flex justify-center py-3 border-b-2 text-white transition ${activeTab === 'liked' ? 'border-white' : 'border-transparent text-gray-500'}`}>
            <Heart className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Video Grid */}
      <div className="grid grid-cols-3 gap-0.5">
        {(activeTab === 'grid' ? reels : likedReels).map((reel: Reel) => {
          const videoSrc = reel.videoUrl.startsWith('http')
            ? reel.videoUrl
            : `http://localhost:8080${reel.videoUrl}`;
          const thumbSrc = reel.thumbnail || videoSrc;
          return (
            <div
              key={reel._id}
              className="aspect-[3/4] bg-gray-900 relative group overflow-hidden cursor-pointer"
              onClick={() => navigate(`/feed?start=${reel._id}`)}
            >
              {/* Use thumbnail image for fast load */}
              {reel.thumbnail ? (
                <img src={thumbSrc} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition" alt={reel.title} />
              ) : (
                <video src={videoSrc} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition" />
              )}
              {/* Play overlay on hover */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition flex items-center justify-center opacity-0 group-hover:opacity-100">
                <Play className="w-8 h-8 text-white fill-white drop-shadow-lg" />
              </div>
              <div className="absolute bottom-1 left-2 flex items-center gap-1 text-white text-xs drop-shadow-md">
                <Video className="w-3 h-3" />
                {reel.views || 0}
              </div>
              {isOwnProfile && (
                <button
                  onClick={(e) => handleDeleteReel(e, reel._id)}
                  className="absolute top-2 right-2 bg-black/50 p-1.5 rounded-full hover:bg-red-500/80 transition opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="w-4 h-4 text-white" />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {reels.length === 0 && (
        <div className="py-20 text-center text-gray-500 text-sm">
          <div className="w-16 h-16 bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <Video className="w-8 h-8 opacity-50" />
          </div>
          No reels yet
        </div>
      )}
    </div>
  );
}
