import { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, MessageCircle, Share2, X, Eye, Music2, Play, Pause, CornerDownRight } from 'lucide-react';
import { formatNumber } from '../utils/formatNumber';
import { fetchComments as apiFetchComments, addComment as apiAddComment, deleteComment as apiDeleteComment, likeReel as apiLikeReel, viewReel as apiViewReel, shareReel as apiShareReel } from '../api/reel';
import { getMyProfile, followUser as apiFollowUser, unfollowUser as apiUnfollowUser } from '../api/user';

export default function ReelCard({ reel, isActive }) {
    const videoRef = useRef(null);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [liked, setLiked] = useState(false);
    const [likesCount, setLikesCount] = useState(Array.isArray(reel.likes) ? reel.likes.length : 0);
    const [isFollowing, setIsFollowing] = useState(false);
    const [viewsCount, setViewsCount] = useState(reel.views || 0);
    const [sharesCount, setSharesCount] = useState(reel.shares || 0);
    const [isPlaying, setIsPlaying] = useState(isActive); // Track play state
    const [isMuted, setIsMuted] = useState(false); // Autoplay fallback

    const [isOwnProfile, setIsOwnProfile] = useState(false);
    const [animating, setAnimating] = useState(false); // For heart burst
    const [showPlayIcon, setShowPlayIcon] = useState(false); // For play/pause animation
    // Comment modal state
    const [showComments, setShowComments] = useState(false);
    const [comments, setComments] = useState([]);
    const [commentInput, setCommentInput] = useState("");
    const [loadingComments, setLoadingComments] = useState(false);
    const [addingComment, setAddingComment] = useState(false);
    const [commentError, setCommentError] = useState("");

    // Reply State
    const [replyingTo, setReplyingTo] = useState(null); // { id: 'commentId', name: 'User' }
    const inputRef = useRef(null);

    // Fetch comments when modal opens
    useEffect(() => {
        if (showComments) {
            fetchComments();
        }
    }, [showComments]);

    const fetchComments = async () => {
        setLoadingComments(true);
        try {
            const data = await apiFetchComments(reel._id);
            setComments(data);
        } catch (err) {
            console.error("❌ Failed to fetch comments", err);
        }
        setLoadingComments(false);
    };

    const handleAddComment = async (e) => {
        e.preventDefault();
        if (!commentInput.trim()) return;
        setAddingComment(true);
        setCommentError("");
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setCommentError("You must be logged in to comment.");
                setAddingComment(false);
                return;
            }
            const parentId = replyingTo ? replyingTo.id : null;
            const data = await apiAddComment(reel._id, commentInput, token, parentId);

            setCommentInput("");
            setComments(prev => [data.comment, ...prev]);
            setReplyingTo(null); // Clear reply state
        } catch (err) {
            console.error("❌ Failed to add comment", err);
            setCommentError(err.message || "Failed to post comment. Try again.");
        }
        setAddingComment(false);
    };

    const handleDeleteComment = async (commentId) => {
        try {
            const token = localStorage.getItem('token');
            await apiDeleteComment(commentId, token);
            setComments(prev => prev.filter(c => c._id !== commentId));
        } catch (err) {
            console.error("❌ Failed to delete comment", err);
        }
    };

    // Initiate reply
    const handleReply = (comment) => {
        setReplyingTo({ id: comment._id, name: comment.user?.name });
        setShowComments(true); // Ensure modal is open (should be, but safe check)
        // Focus input
        setTimeout(() => inputRef.current?.focus(), 100);
    };


    const token = localStorage.getItem('token');

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const update = () => {
            setCurrentTime(video.currentTime);
            setProgress((video.currentTime / video.duration) * 100);
        };
        const onLoaded = () => setDuration(video.duration);

        video.addEventListener('timeupdate', update);
        video.addEventListener('loadedmetadata', onLoaded);

        return () => {
            video.removeEventListener('timeupdate', update);
            video.removeEventListener('loadedmetadata', onLoaded);
        };
    }, []);

    // 🧠 Smart Playback & View Counting
    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        if (isActive) {
            setIsPlaying(true); // Default to playing when active
            // Video plays via the dependency on isPlaying below
        } else {
            setIsPlaying(false);
        }
    }, [isActive, reel._id]);


    // Apply Play/Pause based on state
    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        if (isPlaying) {
            const playPromise = video.play();
            if (playPromise !== undefined) {
                playPromise.catch(e => {
                    console.log('Autoplay prevented. Retrying muted.');
                    // Fallback: Mute and play
                    setIsMuted(true);
                    video.muted = true;
                    video.play().catch(err => {
                        console.error("Muted autoplay also failed", err);
                        setIsPlaying(false);
                    });
                });
            }
            if (isActive) {
                // Trigger view count only if actively playing
                if (!window.viewTimers) window.viewTimers = {};
                if (window.viewTimers[reel._id]) clearTimeout(window.viewTimers[reel._id]);

                window.viewTimers[reel._id] = setTimeout(() => {
                    apiViewReel(reel._id);
                    setViewsCount(prev => prev + 1);
                }, 1000);
            }
        } else {
            video.pause();
            if (window.viewTimers && window.viewTimers[reel._id]) {
                clearTimeout(window.viewTimers[reel._id]);
            }
        }
    }, [isPlaying, isActive, isMuted]); // Add isMuted dependency? No, changing Muted triggers re-render which refires this effect? 
    // Actually, setting state inside effect might cause loops if not careful.
    // But here we setMuted only on error.

    // Toggle Play/Pause on click
    const togglePlay = (e) => {
        e.stopPropagation();
        setIsPlaying(!isPlaying);
        setShowPlayIcon(true);
        setTimeout(() => setShowPlayIcon(false), 800);
    };

    useEffect(() => {
        if (!token) return;
        let currentUserId;
        try {
            currentUserId = JSON.parse(atob(token.split('.')[1]))?._id;
        } catch (e) {
            console.error("Invalid token format");
            return;
        }

        if (!reel?.uploadedBy?._id || !currentUserId) return;

        setIsOwnProfile(currentUserId === reel.uploadedBy._id);

        // Check follow status from backend
        const fetchProfile = async () => {
            try {
                const data = await getMyProfile(token);
                const following = data.following || [];
                setIsFollowing(following.some(u => u._id?.toString() === reel.uploadedBy?._id?.toString()));
            } catch (err) {
                if (err.message && err.message.includes('403')) {
                    // Token expired or invalid, just ignore follow state
                } else {
                    console.error('❌ Failed to fetch profile for follow state', err);
                }
            }
        };
        fetchProfile();
    }, [reel, token]);


    const handleFollowToggle = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                return console.warn("🔒 No token found. User might not be logged in.");
            }

            // 🛡️ Check if reel and uploader info exists
            if (!reel?.uploadedBy?._id) {
                console.error("🚫 Missing uploader ID on reel:", reel);
                return;
            }

            const uploaderId = reel.uploadedBy._id;
            const loggedInUserId = JSON.parse(atob(token.split('.')[1]))?._id;

            // 👤 Prevent self-follow
            if (uploaderId === loggedInUserId) {
                console.log("⛔ You can't follow yourself.");
                return;
            }

            if (isFollowing) {
                await apiUnfollowUser(uploaderId, token);
            } else {
                await apiFollowUser(uploaderId, token);
            }
            setIsFollowing(!isFollowing);
        } catch (err) {
            console.error('❌ Follow toggle failed:', err);
            // Gracefully handle desync
            if (err.response?.data?.message === 'Already following') {
                setIsFollowing(true);
            }
        }
    };


    const handleLike = async () => {
        try {
            const token = localStorage.getItem('token');
            const data = await apiLikeReel(reel._id, token);

            if (!liked && data.liked) {
                setAnimating(true);
                setTimeout(() => setAnimating(false), 500);
            }
            setLiked(data.liked);
            setLikesCount(data.likesCount);
        } catch (err) {
            console.error("❌ Failed to like reel", err);
        }
    };

    const handleShare = async () => {
        try {
            await apiShareReel(reel._id);
            setSharesCount(prev => prev + 1);

            // Native Share
            if (navigator.share) {
                navigator.share({
                    title: reel.title,
                    text: `Check out this reel by @${username}`,
                    url: window.location.href // Should ideally be unique link to reel
                });
            } else {
                navigator.clipboard.writeText(window.location.href);
                alert('Link copied!');
            }
        } catch (err) {
            console.error("❌ Failed to share", err);
        }
    };

    // Double tap to like
    const [lastTap, setLastTap] = useState(0);
    const handleVideoClick = (e) => {
        const now = Date.now();
        if ((now - lastTap) < 300) {
            // Double Tap -> Like
            if (!liked) handleLike();
            setAnimating(true);
            setTimeout(() => setAnimating(false), 1000);
        } else {
            // Single Tap -> Toggle Play (delayed slightly to wait for double tap?) 
            // For smoother feel, we toggle immediately, double tap will just like + (pause/play quickly toggled back? No, keep it simple)
            // Actually, standard behavior: Tap toggles play. Double tap likes (and might toggle play twice, effectively null? or we prevent default)
            togglePlay(e);
        }
        setLastTap(now);
    };


    const formatTime = (time) => {
        if (!time || isNaN(time)) return '0:00';
        const mins = Math.floor(time / 60);
        const secs = Math.floor(time % 60).toString().padStart(2, '0');
        return `${mins}:${secs}`;
    };

    const handleSeek = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        const video = videoRef.current;
        if (video && video.duration) video.currentTime = percent * video.duration;
    };

    const user = reel.uploadedBy;
    const username = user?.name?.split(' ')[0] || 'User';
    const profilePhoto = user?.image;

    // Navigation to profile
    const navigate = useNavigate();
    const handleProfileClick = (e) => {
        e.stopPropagation();
        if (user?._id) navigate(`/profile/${user._id}`);
    };

    // Hashtag extraction
    const title = reel.title || '';
    const hashtags = title.match(/#[a-z0-9_]+/gi);
    const cleanTitle = title.replace(/#[a-z0-9_]+/gi, '').trim();

    // Organized Comments (Parent -> Children)
    const rootComments = comments.filter(c => !c.parentId);
    const getReplies = (parentId) => comments.filter(c => c.parentId?.toString() === parentId?.toString());

    const CommentItem = ({ comment, isReply = false }) => (
        <div className="flex gap-3 mb-4">
            <img
                src={comment.user?.image || '/default-avatar.png'}
                className="w-8 h-8 rounded-full object-cover shrink-0"
            />
            <div className="flex-1">
                <p className="text-xs font-bold text-gray-400">
                    {comment.user?.name}
                    <span className="text-gray-600 font-normal ml-2">{new Date(comment.createdAt).toLocaleDateString()}</span>
                </p>
                <p className="text-sm text-white leading-tight mt-0.5">{comment.text}</p>

                {/* Reply interaction */}
                <button
                    onClick={() => handleReply(comment)}
                    className="text-[10px] font-semibold text-gray-500 mt-1 hover:text-white"
                >
                    Reply
                </button>

                {/* Recursively render replies (only 1 level deep for now for simplicity, or multi-level is fine if backend supports it) */}
                {!isReply && getReplies(comment._id).length > 0 && (
                    <div className="mt-2 pl-2 border-l-2 border-gray-800">
                        {getReplies(comment._id).map(reply => (
                            <CommentItem key={reply._id} comment={reply} isReply={true} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <div className="relative h-full w-full bg-black select-none">
            {/* Video Player */}
            <div className="absolute inset-0 z-0 cursor-pointer" onClick={handleVideoClick}>
                <video
                    ref={videoRef}
                    src={reel.videoUrl}
                    className="w-full h-full object-cover"
                    loop
                    muted={isMuted} // Ensure audio plays, unless fallback triggers
                    playsInline
                />
            </div>

            {/* Play/Pause Center Icon Animation */}
            {showPlayIcon && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20 animate-ping-short">
                    <div className="bg-black/40 p-4 rounded-full backdrop-blur-sm">
                        {isPlaying ? (
                            <Play className="w-12 h-12 text-white fill-white" />
                        ) : (
                            <Pause className="w-12 h-12 text-white fill-white" />
                        )}
                    </div>
                </div>
            )}

            {/* Heart Burst Animation Overlay */}
            {animating && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20 animate-bounce">
                    <Heart className="w-32 h-32 text-pink-500 fill-pink-500 opacity-80" />
                </div>
            )}

            {/* Dark Gradient Overlay (Bottom) for readability */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/90 pointer-events-none z-10" />

            {/* 🛑 RIGHT SIDEBAR (Actions) */}
            <div className="absolute right-2 bottom-20 z-30 flex flex-col items-center gap-6 pb-4">
                {/* Profile Avatar */}
                <div className="relative mb-2 cursor-pointer" onClick={handleProfileClick}>
                    {profilePhoto ? (
                        <img src={profilePhoto} alt={username} className="w-12 h-12 rounded-full border-2 border-white object-cover" />
                    ) : (
                        <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center font-bold text-white border-2 border-white">
                            {username[0]}
                        </div>
                    )}
                    {!isOwnProfile && !isFollowing && (
                        <button onClick={handleFollowToggle} className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-pink-500 rounded-full p-1 text-white scale-75 hover:scale-90 transition">
                            <div className="w-4 h-4 flex items-center justify-center font-bold text-xs">+</div>
                        </button>
                    )}
                </div>

                {/* Like */}
                <div className="flex flex-col items-center">
                    <button onClick={handleLike}>
                        <Heart className={`w-8 h-8 drop-shadow-lg transition ${liked ? 'text-pink-500 fill-pink-500' : 'text-white'}`} />
                    </button>
                    <span className="text-white text-xs font-semibold mt-1">{formatNumber(likesCount)}</span>
                </div>

                {/* Comment */}
                <div className="flex flex-col items-center">
                    <button onClick={() => setShowComments(true)}>
                        <MessageCircle className="w-8 h-8 text-white drop-shadow-lg" />
                    </button>
                    <span className="text-white text-xs font-semibold mt-1">{comments.length}</span>
                </div>

                {/* Share */}
                <div className="flex flex-col items-center">
                    <button onClick={handleShare}>
                        <Share2 className="w-8 h-8 text-white drop-shadow-lg" />
                    </button>
                    <span className="text-white text-xs font-semibold mt-1">{formatNumber(sharesCount)}</span>
                </div>

                {/* View Count (Small) */}
                <div className="flex flex-col items-center opacity-80">
                    <Eye className="w-6 h-6 text-white" />
                    <span className="text-[10px] text-white mt-1">{formatNumber(viewsCount)}</span>
                </div>

                {/* 🎵 Spinning Disc (Animation) */}
                <div className="mt-4 animate-spin-slow">
                    <div className="w-10 h-10 bg-gray-800 rounded-full border-4 border-gray-900 flex items-center justify-center overflow-hidden">
                        <img src={profilePhoto || "/default-avatar.png"} className="w-full h-full object-cover opacity-80" />
                    </div>
                </div>
            </div>

            {/* 📝 BOTTOM LEFT INFO */}
            <div className="absolute left-4 bottom-8 right-16 z-20 flex flex-col items-start gap-2">
                {/* User Name & Follow Button */}
                <div className="flex items-center gap-3">
                    <h3 className="text-white font-bold text-lg drop-shadow-md cursor-pointer hover:underline" onClick={handleProfileClick}>@{username}</h3>
                    {!isOwnProfile && (
                        <button
                            onClick={handleFollowToggle}
                            className={`px-3 py-1 rounded-full text-xs font-bold transition backdrop-blur-sm ${isFollowing
                                ? "bg-white/10 text-gray-300 border border-white/20 hover:text-red-400"
                                : "bg-transparent border border-white/60 text-white hover:bg-white/20"
                                }`}
                        >
                            {isFollowing ? "Following" : "Follow"}
                        </button>
                    )}
                </div>

                {/* Caption & Hashtags */}
                <div className="text-white text-sm opacity-90 leading-tight">
                    <span className="mr-2">{cleanTitle}</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                        {hashtags && hashtags.map((tag, i) => (
                            <span key={i} className="font-bold text-white mr-1">#{tag.replace('#', '')}</span>
                        ))}
                    </div>
                </div>

                {/* Audio Track Marquee (Static for now) */}
                <div className="flex items-center gap-2 mt-2 opacity-80">
                    <Music2 className="w-4 h-4 text-white" />
                    <div className="text-xs text-white overflow-hidden w-40 whitespace-nowrap">
                        <span>Original Sound - @{username} • Original Sound - @{username}</span>
                    </div>
                </div>
            </div>

            {/* ⏱ Tiny Progress Bar at very bottom - Smoother */}
            <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-white/20 z-30 cursor-pointer group" onClick={handleSeek}>
                <div
                    className="h-full bg-white opacity-80 group-hover:h-3 group-hover:bg-pink-500 transition-all duration-200"
                    style={{ width: `${progress}%` }}
                />
            </div>


            {/* Comment Drawer (Glassmorphism) */}
            {showComments && (
                <div className="fixed inset-0 z-[100] flex items-end bg-black/60 backdrop-blur-sm" onClick={() => setShowComments(false)}>
                    <div className="bg-gray-900/95 rounded-t-2xl w-full max-w-md mx-auto h-[70vh] flex flex-col shadow-2xl animate-slideUp border-t border-white/10 backdrop-blur-md" onClick={e => e.stopPropagation()}>
                        {/* Drawer Handle */}
                        <div className="w-full flex justify-center pt-3 pb-2 cursor-pointer" onClick={() => setShowComments(false)}>
                            <div className="w-12 h-1 bg-gray-600 rounded-full" />
                        </div>

                        <h2 className="text-sm font-bold mb-2 text-center text-white border-b border-gray-700 pb-2">
                            {comments.length} comments
                        </h2>

                        {/* Comments List */}
                        <div className="flex-1 overflow-y-auto space-y-2 p-4 custom-scrollbar">
                            {loadingComments ? (
                                <div className="text-center text-gray-500 py-10">Loading...</div>
                            ) : comments.length === 0 ? (
                                <div className="text-center text-gray-500 py-10">Be the first to comment!</div>
                            ) : (
                                rootComments.map(comment => (
                                    <CommentItem key={comment._id} comment={comment} />
                                ))
                            )}
                        </div>

                        {/* Input Area */}
                        <div className="p-3 border-t border-gray-700 bg-black/20">
                            {replyingTo && (
                                <div className="flex justify-between items-center text-xs text-gray-400 mb-2 px-2">
                                    <span>Replying to <b>{replyingTo.name}</b></span>
                                    <button onClick={() => setReplyingTo(null)} className="hover:text-white"><X className="w-3 h-3" /></button>
                                </div>
                            )}
                            {commentError && (
                                <p className="text-red-400 text-xs mb-2 px-2">{commentError}</p>
                            )}
                            <form onSubmit={handleAddComment} className="flex gap-2 items-center">
                                <input
                                    ref={inputRef}
                                    value={commentInput}
                                    onChange={e => { setCommentInput(e.target.value); setCommentError(""); }}
                                    placeholder={replyingTo ? `Reply to ${replyingTo.name}...` : "Add a comment..."}
                                    className="flex-1 bg-gray-800 text-white rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-pink-500"
                                />
                                <button type="submit" className="text-pink-500 font-bold text-sm px-2 disabled:opacity-50" disabled={!commentInput.trim() || addingComment}>
                                    {addingComment ? '...' : 'Post'}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
