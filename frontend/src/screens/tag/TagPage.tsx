// src/screens/tag/TagPage.tsx
import { useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Hash } from 'lucide-react';
import ReelCard from '../../components/ReelCard';
import { useTagFeed } from './useTagFeed';
import type { Reel } from '../../types/reel.types';

export default function TagPage() {
  const { tag } = useParams<{ tag: string }>();
  const navigate = useNavigate();

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError } = useTagFeed(tag!);

  const reels: Reel[] = data?.pages.flatMap((page) => page.reels) ?? [];
  const totalReels = data?.pages[0]?.totalReels ?? 0;

  // Infinite scroll
  const observer = useRef<IntersectionObserver | null>(null);
  const lastReelRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (isFetchingNextPage) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasNextPage) fetchNextPage();
      });
      if (node) observer.current.observe(node);
    },
    [isFetchingNextPage, hasNextPage, fetchNextPage]
  );

  return (
    <div className="relative h-[100dvh] bg-black overflow-hidden flex flex-col">
      {/* Header */}
      <header className="absolute top-0 w-full z-40 flex items-center gap-3 px-4 py-4 bg-gradient-to-b from-black/90 to-transparent pointer-events-none">
        <button
          onClick={() => navigate(-1)}
          className="pointer-events-auto p-2 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 transition"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <div className="pointer-events-auto flex flex-col">
          <div className="flex items-center gap-1.5">
            <Hash className="w-5 h-5 text-pink-400" />
            <span className="text-white font-extrabold text-xl tracking-tight">{tag}</span>
          </div>
          {totalReels > 0 && (
            <span className="text-gray-400 text-xs ml-6">{totalReels.toLocaleString()} reels</span>
          )}
        </div>
      </header>

      {/* Feed */}
      <div className="flex-1 overflow-y-scroll snap-y snap-mandatory scrollbar-hide h-full">
        {isError && (
          <div className="flex flex-col justify-center items-center h-full text-red-400">
            <p>Failed to load reels for #{tag}</p>
          </div>
        )}

        {!isLoading && reels.length === 0 && (
          <div className="flex flex-col justify-center items-center h-full text-gray-500 gap-3">
            <Hash className="w-12 h-12 opacity-20" />
            <p className="text-lg font-semibold">No reels for #{tag} yet</p>
            <p className="text-sm">Be the first to post with this tag!</p>
          </div>
        )}

        {reels.map((reel, index) => {
          const fixedReel: Reel = {
            ...reel,
            videoUrl: reel.videoUrl?.startsWith('http')
              ? reel.videoUrl
              : `http://localhost:8080${reel.videoUrl}`,
          };
          return (
            <div
              ref={reels.length === index + 1 ? lastReelRef : null}
              key={reel._id}
              data-id={reel._id}
              className="reel-container snap-start w-full h-[100dvh] relative bg-black flex items-center justify-center"
            >
              <ReelCard reel={fixedReel} isActive={index === 0} />
            </div>
          );
        })}

        {(isLoading || isFetchingNextPage) && (
          <div className="snap-start h-[100dvh] w-full flex flex-col justify-center items-center bg-black gap-3">
            <div className="w-8 h-8 border-2 border-pink-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-gray-500 text-sm">Loading #{tag} reels...</span>
          </div>
        )}
      </div>
    </div>
  );
}
