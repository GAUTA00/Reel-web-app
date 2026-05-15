// src/components/reel/ReelSidebar.tsx
import { Heart, MessageCircle, Share2, Eye } from 'lucide-react';
import { formatNumber } from '../../utils/formatNumber';

interface ReelSidebarProps {
  profilePhoto?: string;
  username: string;
  isOwnProfile: boolean;
  isFollowing: boolean;
  liked: boolean;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  viewsCount: number;
  onProfileClick: (e: React.MouseEvent) => void;
  onFollowToggle: () => void;
  onLike: () => void;
  onOpenComments: () => void;
  onShare: () => void;
}

export default function ReelSidebar({
  profilePhoto,
  username,
  isOwnProfile,
  isFollowing,
  liked,
  likesCount,
  commentsCount,
  sharesCount,
  viewsCount,
  onProfileClick,
  onFollowToggle,
  onLike,
  onOpenComments,
  onShare,
}: ReelSidebarProps) {
  return (
    <div className="absolute right-2 bottom-20 z-30 flex flex-col items-center gap-6 pb-4">
      {/* Avatar + follow pill */}
      <div className="relative mb-2 cursor-pointer" onClick={onProfileClick}>
        {profilePhoto ? (
          <img
            src={profilePhoto}
            alt={username}
            className="w-12 h-12 rounded-full border-2 border-white object-cover"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center font-bold text-white border-2 border-white">
            {username[0]}
          </div>
        )}
        {!isOwnProfile && !isFollowing && (
          <button
            onClick={(e) => { e.stopPropagation(); onFollowToggle(); }}
            className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-pink-500 rounded-full p-1 text-white scale-75 hover:scale-90 transition"
          >
            <div className="w-4 h-4 flex items-center justify-center font-bold text-xs">+</div>
          </button>
        )}
      </div>

      {/* Like */}
      <div className="flex flex-col items-center">
        <button onClick={onLike}>
          <Heart
            className={`w-8 h-8 drop-shadow-lg transition ${
              liked ? 'text-pink-500 fill-pink-500' : 'text-white'
            }`}
          />
        </button>
        <span className="text-white text-xs font-semibold mt-1">{formatNumber(likesCount)}</span>
      </div>

      {/* Comment */}
      <div className="flex flex-col items-center">
        <button onClick={onOpenComments}>
          <MessageCircle className="w-8 h-8 text-white drop-shadow-lg" />
        </button>
        <span className="text-white text-xs font-semibold mt-1">{commentsCount}</span>
      </div>

      {/* Share */}
      <div className="flex flex-col items-center">
        <button onClick={onShare}>
          <Share2 className="w-8 h-8 text-white drop-shadow-lg" />
        </button>
        <span className="text-white text-xs font-semibold mt-1">{formatNumber(sharesCount)}</span>
      </div>

      {/* Views */}
      <div className="flex flex-col items-center opacity-80">
        <Eye className="w-6 h-6 text-white" />
        <span className="text-[10px] text-white mt-1">{formatNumber(viewsCount)}</span>
      </div>

      {/* Spinning disc */}
      <div className="mt-4 animate-spin-slow">
        <div className="w-10 h-10 bg-gray-800 rounded-full border-4 border-gray-900 flex items-center justify-center overflow-hidden">
          <img
            src={profilePhoto || '/default-avatar.png'}
            className="w-full h-full object-cover opacity-80"
            alt="disc"
          />
        </div>
      </div>
    </div>
  );
}
