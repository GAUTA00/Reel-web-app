// src/components/ReelCard.tsx
// Thin orchestrator — all state lives here, rendering delegated to sub-components
import { useRef, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import VideoPlayer from './reel/VideoPlayer';
import ReelSidebar from './reel/ReelSidebar';
import ReelInfo from './reel/ReelInfo';
import CommentDrawer from './reel/CommentDrawer';
import {
  fetchComments as apiFetchComments,
  addComment as apiAddComment,
  likeReel as apiLikeReel,
  viewReel as apiViewReel,
  shareReel as apiShareReel,
} from '../services/reelService';
import { getMyProfile, followUser as apiFollowUser, unfollowUser as apiUnfollowUser } from '../services/userService';
import type { Reel, Comment } from '../types/reel.types';

interface ReelCardProps {
  reel: Reel;
  isActive: boolean | null;
}

interface ReplyTarget {
  id: string;
  name: string;
}

declare global {
  interface Window {
    viewTimers?: Record<string, ReturnType<typeof setTimeout>>;
  }
}

export default function ReelCard({ reel, isActive }: ReelCardProps) {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const commentInputRef = useRef<HTMLInputElement>(null);

  // ── Playback state ──────────────────────────────────────────────────────
  const [isPlaying, setIsPlaying] = useState(!!isActive);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showPlayIcon, setShowPlayIcon] = useState(false);
  const [lastTap, setLastTap] = useState(0);
  const [animating, setAnimating] = useState(false); // heart burst

  // ── Reel action state ───────────────────────────────────────────────────
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(Array.isArray(reel.likes) ? reel.likes.length : 0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [viewsCount, setViewsCount] = useState(reel.views || 0);
  const [sharesCount, setSharesCount] = useState(reel.shares || 0);

  // ── Comment state ───────────────────────────────────────────────────────
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentInput, setCommentInput] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);
  const [addingComment, setAddingComment] = useState(false);
  const [commentError, setCommentError] = useState('');
  const [replyingTo, setReplyingTo] = useState<ReplyTarget | null>(null);

  // ── Smart playback — sync isPlaying with active prop ───────────────────
  useEffect(() => {
    setIsPlaying(!!isActive);
  }, [isActive, reel._id]);

  // ── View counting ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!isPlaying || !isActive) return;
    if (!window.viewTimers) window.viewTimers = {};
    if (window.viewTimers[reel._id]) clearTimeout(window.viewTimers[reel._id]);
    window.viewTimers[reel._id] = setTimeout(() => {
      apiViewReel(reel._id);
      setViewsCount((p) => p + 1);
    }, 1000);
    return () => {
      if (window.viewTimers?.[reel._id]) clearTimeout(window.viewTimers[reel._id]);
    };
  }, [isPlaying, isActive, reel._id]);

  // ── Follow state init ───────────────────────────────────────────────────
  useEffect(() => {
    const token = localStorage.getItem('auth-storage');
    if (!token) return;
    let currentUserId: string | undefined;
    try {
      const parsed = JSON.parse(token) as { state?: { token?: string } };
      const jwt = parsed?.state?.token;
      if (jwt) currentUserId = JSON.parse(atob(jwt.split('.')[1]))?._id;
    } catch { return; }

    const uploaderId = reel.uploadedBy?._id; // ✅ fixed: was reel.user
    if (!uploaderId || !currentUserId) return;
    setIsOwnProfile(currentUserId === uploaderId);

    getMyProfile().then((data) => {
      setIsFollowing(data.following.some((u) => u._id === uploaderId));
    }).catch(() => {});
  }, [reel.uploadedBy?._id]); // ✅ fixed dependency

  // ── Fetch comments when drawer opens ───────────────────────────────────
  useEffect(() => {
    if (!showComments) return;
    setLoadingComments(true);
    apiFetchComments(reel._id)
      .then(setComments)
      .catch((e) => console.error('Failed to fetch comments', e))
      .finally(() => setLoadingComments(false));
  }, [showComments, reel._id]);

  // ── Handlers ────────────────────────────────────────────────────────────
  const handleVideoClick = useCallback((e: React.MouseEvent) => {
    const now = Date.now();
    if (now - lastTap < 300) {
      if (!liked) handleLike();
      setAnimating(true);
      setTimeout(() => setAnimating(false), 1000);
    } else {
      setIsPlaying((p) => !p);
      setShowPlayIcon(true);
      setTimeout(() => setShowPlayIcon(false), 800);
    }
    setLastTap(now);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastTap, liked]);

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    const video = videoRef.current;
    if (video?.duration) video.currentTime = pct * video.duration;
  };

  const handleLike = async () => {
    try {
      const data = await apiLikeReel(reel._id);
      if (!liked && data.liked) {
        setAnimating(true);
        setTimeout(() => setAnimating(false), 500);
      }
      setLiked(data.liked);
      setLikesCount(data.likesCount);
    } catch (e) { console.error('Failed to like', e); }
  };

  const handleShare = async () => {
    try {
      await apiShareReel(reel._id);
      setSharesCount((p) => p + 1);
      if (navigator.share) {
        navigator.share({ title: reel.title, url: window.location.href });
      } else {
        navigator.clipboard.writeText(window.location.href);
        alert('Link copied!');
      }
    } catch (e) { console.error('Failed to share', e); }
  };

  const handleFollowToggle = async () => {
    const uploaderId = reel.uploadedBy?._id; // ✅ fixed: was reel.user
    if (!uploaderId || isOwnProfile) return;
    try {
      isFollowing ? await apiUnfollowUser(uploaderId) : await apiFollowUser(uploaderId);
      setIsFollowing((p) => !p);
    } catch (e) { console.error('Follow toggle failed', e); }
  };

  const handleProfileClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (reel.uploadedBy?._id) navigate(`/profile/${reel.uploadedBy._id}`); // ✅ fixed: was reel.user
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim()) return;
    setAddingComment(true);
    setCommentError('');
    try {
      const parentId = replyingTo ? replyingTo.id : null;
      const data = await apiAddComment(reel._id, commentInput, parentId);
      setComments((prev) => [data, ...prev]);
      setCommentInput('');
      setReplyingTo(null);
    } catch (err) {
      setCommentError(err instanceof Error ? err.message : 'Failed to post comment.');
    } finally {
      setAddingComment(false);
    }
  };

  const handleReply = (comment: Comment) => {
    setReplyingTo({ id: comment._id, name: comment.user?.name });
    setTimeout(() => commentInputRef.current?.focus(), 100);
  };

  const reelUser = reel.uploadedBy; // ✅ fixed: was reel.user
  const username = reelUser?.name?.split(' ')[0] || 'User';

  return (
    <div className="relative h-full w-full bg-black select-none">
      <VideoPlayer
        ref={videoRef}
        src={reel.videoUrl}
        isPlaying={isPlaying}
        isMuted={isMuted}
        progress={progress}
        showPlayIcon={showPlayIcon}
        animating={animating}
        onVideoClick={handleVideoClick}
        onSeek={handleSeek}
        onTimeUpdate={(_ct, dur) => {
          const video = videoRef.current;
          if (video) setProgress((video.currentTime / dur) * 100);
        }}
        onDurationLoaded={() => {}}
        onAutoplayFailed={() => setIsMuted(true)}
      />

      <ReelSidebar
        profilePhoto={reelUser?.image}
        username={username}
        isOwnProfile={isOwnProfile}
        isFollowing={isFollowing}
        liked={liked}
        likesCount={likesCount}
        commentsCount={comments.length}
        sharesCount={sharesCount}
        viewsCount={viewsCount}
        onProfileClick={handleProfileClick}
        onFollowToggle={handleFollowToggle}
        onLike={handleLike}
        onOpenComments={() => setShowComments(true)}
        onShare={handleShare}
      />

      <ReelInfo
        username={username}
        title={reel.title}
        music={reel.music}
        isOwnProfile={isOwnProfile}
        isFollowing={isFollowing}
        onProfileClick={handleProfileClick}
        onFollowToggle={handleFollowToggle}
      />

      {showComments && (
        <CommentDrawer
          comments={comments}
          loading={loadingComments}
          commentInput={commentInput}
          adding={addingComment}
          error={commentError}
          replyingTo={replyingTo}
          inputRef={commentInputRef}
          onClose={() => setShowComments(false)}
          onSubmit={handleAddComment}
          onInputChange={(v) => { setCommentInput(v); setCommentError(''); }}
          onReply={handleReply}
          onCancelReply={() => setReplyingTo(null)}
        />
      )}
    </div>
  );
}
