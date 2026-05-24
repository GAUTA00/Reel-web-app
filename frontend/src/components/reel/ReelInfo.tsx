// src/components/reel/ReelInfo.tsx
import { Link } from 'react-router-dom';
import { Music2 } from 'lucide-react';

interface ReelInfoProps {
  username: string;
  title: string;
  music?: string;          // Actual sound name from the reel
  isOwnProfile: boolean;
  isFollowing: boolean;
  onProfileClick: (e: React.MouseEvent) => void;
  onFollowToggle: () => void;
}

export default function ReelInfo({
  username,
  title,
  music,
  isOwnProfile,
  isFollowing,
  onProfileClick,
  onFollowToggle,
}: ReelInfoProps) {
  const hashtags = title.match(/#[a-z0-9_]+/gi) ?? [];
  const cleanTitle = title.replace(/#[a-z0-9_]+/gi, '').trim();
  const soundLabel = music || `Original Sound - @${username}`;
  // Duplicate the label for seamless marquee loop
  const marqueeText = `${soundLabel}   •   ${soundLabel}   •   `;

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

      {/* Caption text */}
      {cleanTitle && (
        <p className="text-white text-sm opacity-90 leading-tight drop-shadow-md max-w-[240px]">
          {cleanTitle}
        </p>
      )}

      {/* Clickable hashtags */}
      {hashtags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {hashtags.map((tag, i) => (
            <Link
              key={i}
              to={`/tag/${tag.slice(1).toLowerCase()}`}
              onClick={(e) => e.stopPropagation()}
              className="text-white font-bold text-sm hover:text-pink-400 transition drop-shadow-md"
            >
              {tag}
            </Link>
          ))}
        </div>
      )}

      {/* Music marquee */}
      <div className="flex items-center gap-2 mt-1 opacity-90 max-w-[220px] overflow-hidden">
        <Music2 className="w-4 h-4 text-white shrink-0 animate-spin-slow" />
        <div className="overflow-hidden w-full">
          <div className="whitespace-nowrap animate-marquee text-xs text-white drop-shadow-md">
            {marqueeText}{marqueeText}
          </div>
        </div>
      </div>
    </div>
  );
}
