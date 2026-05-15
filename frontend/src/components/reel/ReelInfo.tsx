// src/components/reel/ReelInfo.tsx
import { Music2 } from 'lucide-react';

interface ReelInfoProps {
  username: string;
  title: string;
  isOwnProfile: boolean;
  isFollowing: boolean;
  onProfileClick: (e: React.MouseEvent) => void;
  onFollowToggle: () => void;
}

export default function ReelInfo({
  username,
  title,
  isOwnProfile,
  isFollowing,
  onProfileClick,
  onFollowToggle,
}: ReelInfoProps) {
  const hashtags = title.match(/#[a-z0-9_]+/gi);
  const cleanTitle = title.replace(/#[a-z0-9_]+/gi, '').trim();

  return (
    <div className="absolute left-4 bottom-8 right-16 z-20 flex flex-col items-start gap-2">
      {/* Username + follow button */}
      <div className="flex items-center gap-3">
        <h3
          className="text-white font-bold text-lg drop-shadow-md cursor-pointer hover:underline"
          onClick={onProfileClick}
        >
          @{username}
        </h3>
        {!isOwnProfile && (
          <button
            onClick={onFollowToggle}
            className={`px-3 py-1 rounded-full text-xs font-bold transition backdrop-blur-sm ${
              isFollowing
                ? 'bg-white/10 text-gray-300 border border-white/20 hover:text-red-400'
                : 'bg-transparent border border-white/60 text-white hover:bg-white/20'
            }`}
          >
            {isFollowing ? 'Following' : 'Follow'}
          </button>
        )}
      </div>

      {/* Caption + hashtags */}
      <div className="text-white text-sm opacity-90 leading-tight">
        <span className="mr-2">{cleanTitle}</span>
        {hashtags && (
          <div className="flex flex-wrap gap-1 mt-1">
            {hashtags.map((tag, i) => (
              <span key={i} className="font-bold text-white mr-1">
                #{tag.replace('#', '')}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Audio marquee */}
      <div className="flex items-center gap-2 mt-2 opacity-80">
        <Music2 className="w-4 h-4 text-white" />
        <div className="text-xs text-white overflow-hidden w-40 whitespace-nowrap">
          <span>Original Sound - @{username} • Original Sound - @{username}</span>
        </div>
      </div>
    </div>
  );
}
