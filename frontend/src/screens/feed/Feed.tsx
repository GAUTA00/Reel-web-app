// src/screens/feed/Feed.tsx
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Menu, Home, Plus, Bell, User, LogOut, Search, RefreshCw } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import ReelCard from '../../components/ReelCard';
import FeedSkeleton from '../../components/skeletons/FeedSkeleton';
import { useFeed } from './useFeed';
import type { Reel } from '../../types/reel.types';

type FeedTab = 'foryou' | 'following';

// ─── Error Boundary ──────────────────────────────────────────────────────────
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<React.PropsWithChildren, ErrorBoundaryState> {
  constructor(props: React.PropsWithChildren) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[ErrorBoundary] Caught error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col justify-center items-center h-screen text-red-500 bg-black">
          <h2 className="text-2xl font-bold mb-2">Something went wrong in Feed.</h2>
          <button onClick={() => window.location.reload()} className="bg-white text-black px-4 py-2 rounded mt-4">
            Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// ─── Feed Component ────────────────────────────────────────────────────────────
function Feed() {
  const [activeTab, setActiveTab] = useState<FeedTab>('foryou');
  const [activeReelId, setActiveReelId] = useState<string | null>(null);
  const [showMenu, setShowMenu] = useState(false);

  // Pull-to-refresh state
  const [pullY, setPullY] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const touchStartY = useRef(0);
  const feedScrollRef = useRef<HTMLDivElement>(null);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const startReelId = searchParams.get('start');

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useFeed(activeTab);

  // Flatten pages into a single reels array
  const reels: Reel[] = data?.pages.flatMap((page) => page.reels) ?? [];

  // Infinite scroll observer
  const observer = useRef<IntersectionObserver | null>(null);
  const lastReelElementRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (isFetchingNextPage) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasNextPage) {
          fetchNextPage();
        }
      });
      if (node) observer.current.observe(node);
    },
    [isFetchingNextPage, hasNextPage, fetchNextPage]
  );

  // Smart playback observer
  const viewObserver = useRef<IntersectionObserver | null>(null);
  useEffect(() => {
    const options = { threshold: 0.6 };
    viewObserver.current = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveReelId(entry.target.getAttribute('data-id'));
        }
      });
    }, options);

    const reelElements = document.querySelectorAll('.reel-container');
    reelElements.forEach((el) => viewObserver.current?.observe(el));

    return () => {
      viewObserver.current?.disconnect();
    };
  }, [reels]);

  // Deep link: scroll to ?start=reelId after reels load
  useEffect(() => {
    if (!startReelId || reels.length === 0) return;
    const el = document.querySelector(`[data-id="${startReelId}"]`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [startReelId, reels.length]);

  // Pull-to-refresh handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    const scrollTop = feedScrollRef.current?.scrollTop ?? 0;
    if (scrollTop === 0) touchStartY.current = e.touches[0].clientY;
    else touchStartY.current = 0;
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStartY.current) return;
    const delta = e.touches[0].clientY - touchStartY.current;
    if (delta > 0) setPullY(Math.min(delta, 90));
  };
  const handleTouchEnd = async () => {
    if (pullY > 60) {
      setIsRefreshing(true);
      await queryClient.invalidateQueries({ queryKey: ['feed', activeTab] });
      setIsRefreshing(false);
    }
    setPullY(0);
    touchStartY.current = 0;
  };

  const handleLogout = () => {
    localStorage.removeItem('auth-storage');
    window.location.href = '/login';
  };

  return (
    <ErrorBoundary>
      <div className="relative h-[100dvh] bg-black overflow-hidden flex flex-col">

        {/* Pull-to-refresh indicator */}
        {(pullY > 0 || isRefreshing) && (
          <div
            className="absolute top-0 left-0 right-0 z-50 flex items-center justify-center transition-all duration-200"
            style={{ height: `${Math.max(pullY, isRefreshing ? 48 : 0)}px`, opacity: pullY > 20 || isRefreshing ? 1 : 0 }}
          >
            <div className={`flex items-center gap-2 text-white text-xs font-semibold bg-black/70 px-4 py-2 rounded-full backdrop-blur-sm ${isRefreshing ? 'opacity-100' : ''}`}>
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-pull-spin' : ''}`} style={{ transform: !isRefreshing ? `rotate(${pullY * 3}deg)` : undefined }} />
              {isRefreshing ? 'Refreshing...' : pullY > 60 ? 'Release to refresh' : 'Pull to refresh'}
            </div>
          </div>
        )}

        {/* TOP BAR */}
        <header className="absolute top-0 w-full z-40 flex items-center justify-between px-4 py-4 bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
          <div className="w-8 pointer-events-auto" />

          {/* Tabs */}
          <div className="flex gap-4 font-bold text-lg drop-shadow-md pointer-events-auto select-none">
            <button
              onClick={() => setActiveTab('following')}
              className={`transition-colors ${activeTab === 'following' ? 'text-white border-b-2 border-white pb-0.5' : 'text-gray-400 hover:text-white'}`}
            >
              Following
            </button>
            <span className="text-gray-600">|</span>
            <button
              onClick={() => setActiveTab('foryou')}
              className={`transition-colors ${activeTab === 'foryou' ? 'text-white border-b-2 border-white pb-0.5' : 'text-gray-400 hover:text-white'}`}
            >
              For You
            </button>
          </div>

          {/* Hamburger */}
          <div className="relative pointer-events-auto">
            <button onClick={() => setShowMenu(!showMenu)}>
              <Menu className="w-7 h-7 text-white" />
            </button>
            {showMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-gray-900 rounded-lg shadow-xl border border-gray-800 overflow-hidden">
                <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-3 text-red-400 hover:bg-white/10 w-full text-left">
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              </div>
            )}
          </div>
        </header>

        {/* REELS FEED */}
        <div
          ref={feedScrollRef}
          className="flex-1 overflow-y-scroll snap-y snap-mandatory scrollbar-hide h-full"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{ paddingTop: pullY > 0 ? `${pullY}px` : undefined, transition: pullY === 0 ? 'padding 0.3s ease' : 'none' }}
        >

          {isError && (
            <div className="flex flex-col justify-center items-center h-full text-red-500">
              <p>Failed to load reels.</p>
              <button onClick={() => queryClient.invalidateQueries({ queryKey: ['feed', activeTab] })} className="mt-3 text-pink-400 text-sm underline">Retry</button>
            </div>
          )}

          {reels.length === 0 && !isLoading && (
            <div className="flex flex-col justify-center items-center h-full text-gray-500">
              <p>No reels found.</p>
              {activeTab === 'following' && (
                <p className="text-xs mt-2">Follow more people to see content here!</p>
              )}
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
                ref={reels.length === index + 1 ? lastReelElementRef : null}
                key={reel._id}
                data-id={reel._id}
                className="reel-container snap-start w-full h-[100dvh] relative bg-black flex items-center justify-center"
              >
                <ReelCard reel={fixedReel} isActive={activeReelId === reel._id} />
              </div>
            );
          })}

          {(isLoading || isFetchingNextPage) && (
            <FeedSkeleton />
          )}
        </div>

        {/* BOTTOM NAV */}
        <nav className="fixed bottom-0 w-full z-50 bg-black border-t border-white/10 px-6 py-3 flex justify-between items-center text-white">
          <Link to="/feed" className="flex flex-col items-center opacity-100 transition hover:scale-105">
            <Home className="w-6 h-6 fill-white" />
            <span className="text-[10px] mt-0.5 font-bold">Home</span>
          </Link>

          <Link to="/search" className="flex flex-col items-center opacity-60 hover:opacity-100 transition">
            <Search className="w-6 h-6" />
            <span className="text-[10px] mt-0.5">Search</span>
          </Link>

          <Link to="/upload" className="relative -top-1">
            <div className="w-12 h-8 bg-gradient-to-r from-cyan-400 to-pink-500 rounded-lg flex items-center justify-center p-[2px] hover:scale-110 transition">
              <div className="w-full h-full bg-black rounded-[6px] flex items-center justify-center">
                <div className="bg-white text-black w-full h-full rounded-[4px] flex items-center justify-center">
                  <Plus className="w-5 h-5 font-bold" />
                </div>
              </div>
            </div>
          </Link>

          <Link to="/notifications" className="flex flex-col items-center opacity-60 hover:opacity-100 transition">
            <Bell className="w-6 h-6" />
            <span className="text-[10px] mt-0.5">Inbox</span>
          </Link>

          <Link to="/profile" className="flex flex-col items-center opacity-60 hover:opacity-100 transition">
            <div className="w-6 h-6 bg-gray-700 rounded-full border border-white/50 overflow-hidden">
              <User className="w-full h-full p-1 text-gray-400" />
            </div>
            <span className="text-[10px] mt-0.5">Profile</span>
          </Link>
        </nav>
      </div>
    </ErrorBoundary>
  );
}

export default Feed;
