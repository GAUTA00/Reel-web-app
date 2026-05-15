import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { ArrowLeft, Settings, Grid, Heart, Video, Trash2 } from 'lucide-react';
import { followUser, unfollowUser } from '../api/user';
import { deleteReel, fetchLikedReels } from '../api/reel';
import { toast, ToastContainer } from 'react-toastify';

export default function Profile() {
    const navigate = useNavigate();
    const { id } = useParams(); // Get user ID from URL if present
    const token = localStorage.getItem('token');
    const [profile, setProfile] = useState(null);
    const [reels, setReels] = useState([]);
    const [likedReels, setLikedReels] = useState([]);
    const [activeTab, setActiveTab] = useState('grid');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentUser, setCurrentUser] = useState(null); // To check if it's own profile

    const [editing, setEditing] = useState(false);
    const [nameInput, setNameInput] = useState('');
    const [imageInput, setImageInput] = useState('');
    const [selectedFile, setSelectedFile] = useState(null); // Local file for upload
    const [previewImage, setPreviewImage] = useState(null); // Preview blob
    const fileInputRef = useRef(null);
    const [isFollowing, setIsFollowing] = useState(false);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setPreviewImage(URL.createObjectURL(file));
        }
    };

    const isOwnProfile = !id || (currentUser && profile && currentUser._id === profile._id);

    // 🚫 Redirect if not logged in
    useEffect(() => {
        if (!token) {
            navigate('/login');
        }
    }, [token]);

    // 📥 Fetch profile + user's reels
    useEffect(() => {
        if (!token) return;

        const fetchData = async () => {
            setLoading(true);
            try {
                // 1. Get Logged In User (for comparison / own profile)
                let myProfileRes = await axios.get('http://localhost:8080/users/me', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const myProfile = myProfileRes.data;
                setCurrentUser(myProfile);

                let targetProfile;
                let targetReels;

                if (id && id !== myProfile._id) {
                    // VIEWING SOMEONE ELSE
                    const [userRes, reelsRes] = await Promise.all([
                        axios.get(`http://localhost:8080/users/${id}`, {
                            headers: { Authorization: `Bearer ${token}` }
                        }),
                        axios.get(`http://localhost:8080/reels/user/${id}`, {
                            headers: { Authorization: `Bearer ${token}` }
                        })
                    ]);
                    targetProfile = userRes.data;
                    targetReels = reelsRes.data;

                    // Check if following
                    setIsFollowing(myProfile.following.some(u => u._id === targetProfile._id));
                } else {
                    // VIEWING SELF
                    targetProfile = myProfile;
                    const reelsRes = await axios.get('http://localhost:8080/reels/my', {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    targetReels = reelsRes.data;
                }

                setProfile(targetProfile);
                setReels(targetReels);
                setNameInput(targetProfile.name);
                setImageInput(targetProfile.image);
            } catch (err) {
                console.error('Profile fetch error:', err);
                setError('Failed to load profile');
            } finally {
                setLoading(false);
            }
        };

        fetchData();

        fetchData();
    }, [id, token]);

    // Fetch Liked Reels when tab changes
    useEffect(() => {
        if (activeTab === 'liked' && isOwnProfile && likedReels.length === 0) {
            const loadLiked = async () => {
                try {
                    const data = await fetchLikedReels(token);
                    setLikedReels(data);
                } catch (err) {
                    console.error("Failed to load liked reels", err);
                }
            };
            loadLiked();
        }
    }, [activeTab, isOwnProfile, token, likedReels.length]);


    // 📝 Save updated profile info (Only for self)
    const handleSave = async () => {
        try {
            const formData = new FormData();
            formData.append('name', nameInput);
            if (selectedFile) {
                formData.append('image', selectedFile);
            } else if (imageInput) {
                formData.append('image', imageInput); // Fallback to URL if no file selected but URL entered (legacy)
            }

            const res = await axios.put(
                'http://localhost:8080/users/update-profile',
                formData,
                { headers: { Authorization: `Bearer ${token}` } } // Axios handles multipart/form-data automatically
            );

            setProfile(res.data.user);
            setEditing(false);
            setPreviewImage(null); // Clear preview after save
            setSelectedFile(null);
            toast.success("Profile updated");
        } catch (err) {
            console.error('Update failed', err);
            toast.error("Update failed");
        }
    };

    const handleFollowToggle = async () => {
        try {
            if (isFollowing) {
                await unfollowUser(profile._id, token);
                setProfile(prev => ({
                    ...prev,
                    followers: prev.followers.filter(f => f._id !== currentUser._id) // Optimistic update
                }));
            } else {
                await followUser(profile._id, token);
                // Optimistic: Add minimal user object
                setProfile(prev => ({
                    ...prev,
                    followers: [...prev.followers, { _id: currentUser._id, name: currentUser.name }]
                }));
            }
            setIsFollowing(!isFollowing);
        } catch (err) {
            console.error(err);
        }
    };

    const handleDeleteReel = async (e, reelId) => {
        e.stopPropagation(); // Prevent navigation
        if (window.confirm("Are you sure you want to delete this reel?")) {
            try {
                await deleteReel(reelId, token);
                setReels(prev => prev.filter(r => r._id !== reelId));
                toast.success("Reel deleted");
            } catch (err) {
                console.error("Delete failed", err);
                toast.error("Failed to delete reel");
            }
        }
    };

    if (loading) return <div className="min-h-screen bg-black text-white flex items-center justify-center">Loading...</div>;
    if (error) return <div className="min-h-screen bg-black text-red-500 flex items-center justify-center">{error}</div>;

    // 🧮 Calculate Total Likes
    const totalLikes = reels.reduce((acc, reel) => acc + (reel.likes?.length || 0), 0);


    return (
        <div className="min-h-screen bg-black text-white pb-20 font-sans">
            <ToastContainer theme="dark" position="bottom-center" />
            {/* 🔝 Navbar */}
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

            {/* 👤 Profile Header */}
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
                        onClick={() => isOwnProfile && editing && fileInputRef.current.click()}
                    />
                    {isOwnProfile && editing && (
                        <div
                            className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center cursor-pointer pointer-events-none"
                        >
                            <span className="text-xs">Tap to Change</span>
                        </div>
                    )}
                </div>

                {/* Name & Handle */}
                {editing ? (
                    <div className="flex flex-col gap-2 w-full max-w-xs text-center">
                        <input
                            className="bg-gray-800 text-white p-2 rounded text-center"
                            value={nameInput}
                            onChange={e => setNameInput(e.target.value)}
                            placeholder="Name"
                        />
                        <input
                            className="bg-gray-800 text-white p-2 text-xs rounded text-center"
                            value={imageInput}
                            onChange={e => setImageInput(e.target.value)}
                            placeholder="Image URL"
                        />
                        <div className="flex gap-2 justify-center mt-2">
                            <button onClick={handleSave} className="bg-pink-500 px-4 py-1 rounded text-sm font-bold">Save</button>
                            <button onClick={() => setEditing(false)} className="bg-gray-700 px-4 py-1 rounded text-sm">Cancel</button>
                        </div>
                    </div>
                ) : (
                    <>
                        <h2 className="text-xl font-bold">@{profile.name.replace(/\s+/g, '').toLowerCase()}</h2>
                        <p className="text-sm text-gray-400 mt-1 mb-4 text-center max-w-sm">
                            {/* Placeholder bio */}
                            Creating awesome content. 🚀
                        </p>
                    </>
                )}


                {/* 📊 Stats Grid */}
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

                {/* Actions: Edit vs Follow */}
                <div className="w-full max-w-xs flex gap-2 justify-center">
                    {isOwnProfile ? (
                        !editing && (
                            <button
                                onClick={() => setEditing(true)}
                                className="border border-gray-600 px-8 py-2 rounded-md font-semibold text-sm hover:bg-white/5 transition w-full"
                            >
                                Edit profile
                            </button>
                        )
                    ) : (
                        <button
                            onClick={handleFollowToggle}
                            className={`px-8 py-2 rounded-md font-semibold text-sm transition w-full ${isFollowing
                                ? 'bg-gray-800 text-white border border-gray-700'
                                : 'bg-pink-500 text-white'
                                }`}
                        >
                            {isFollowing ? 'Following' : 'Follow'}
                        </button>
                    )}
                </div>
            </div>

            {/* 📑 Tabs (Reels | Liked) */}
            <div className="flex border-t border-white/10">
                <button
                    onClick={() => setActiveTab('grid')}
                    className={`flex-1 flex justify-center py-3 border-b-2 text-white transition ${activeTab === 'grid' ? 'border-white' : 'border-transparent text-gray-500'}`}
                >
                    <Grid className="w-5 h-5" />
                </button>
                {isOwnProfile && (
                    <button
                        onClick={() => setActiveTab('liked')}
                        className={`flex-1 flex justify-center py-3 border-b-2 text-white transition ${activeTab === 'liked' ? 'border-white' : 'border-transparent text-gray-500'}`}
                    >
                        <Heart className="w-5 h-5" />
                    </button>
                )}
            </div>

            {/* 🎥 Video Grid */}
            <div className="grid grid-cols-3 gap-0.5">
                {(activeTab === 'grid' ? reels : likedReels).map(reel => {
                    const videoSrc = reel.videoUrl.startsWith('http')
                        ? reel.videoUrl
                        : `http://localhost:8080${reel.videoUrl}`;
                    return (
                        <div key={reel._id} className="aspect-[3/4] bg-gray-900 relative group overflow-hidden cursor-pointer" onClick={() => navigate(`/feed?start=${reel._id}`)}>
                            <video
                                src={videoSrc}
                                className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition"
                            />
                            <div className="absolute bottom-1 left-2 flex items-center gap-1 text-white text-xs drop-shadow-md">
                                <Video className="w-3 h-3" />
                                {reel.views || 0}
                            </div>
                            {isOwnProfile && (
                                <button
                                    onClick={(e) => handleDeleteReel(e, reel._id)}
                                    className="absolute top-2 right-2 bg-black/50 p-1.5 rounded-full hover:bg-red-500/80 transition"
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
