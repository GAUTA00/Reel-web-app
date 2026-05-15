// src/components/reel/VideoPlayer.tsx
import { useRef, useEffect, forwardRef } from 'react';
import { Play, Pause } from 'lucide-react';

interface VideoPlayerProps {
  src: string;
  isPlaying: boolean;
  isMuted: boolean;
  progress: number;
  showPlayIcon: boolean;
  animating: boolean;            // heart burst from double-tap
  onVideoClick: (e: React.MouseEvent) => void;
  onSeek: (e: React.MouseEvent<HTMLDivElement>) => void;
  onTimeUpdate: (currentTime: number, duration: number) => void;
  onAutoplayFailed: () => void;
  onDurationLoaded: (duration: number) => void;
}

// Expose the video element ref to parent so it can control play/pause
const VideoPlayer = forwardRef<HTMLVideoElement, VideoPlayerProps>(
  (
    {
      src,
      isPlaying,
      isMuted,
      progress,
      showPlayIcon,
      animating,
      onVideoClick,
      onSeek,
      onTimeUpdate,
      onAutoplayFailed,
      onDurationLoaded,
    },
    ref
  ) => {
    // Register timeupdate + loadedmetadata listeners
    const innerRef = useRef<HTMLVideoElement>(null);
    const videoRef = (ref as React.RefObject<HTMLVideoElement>) ?? innerRef;

    useEffect(() => {
      const video = videoRef.current;
      if (!video) return;

      const handleTime = () => onTimeUpdate(video.currentTime, video.duration);
      const handleLoaded = () => onDurationLoaded(video.duration);

      video.addEventListener('timeupdate', handleTime);
      video.addEventListener('loadedmetadata', handleLoaded);
      return () => {
        video.removeEventListener('timeupdate', handleTime);
        video.removeEventListener('loadedmetadata', handleLoaded);
      };
    }, [videoRef, onTimeUpdate, onDurationLoaded]);

    // Play / pause
    useEffect(() => {
      const video = videoRef.current;
      if (!video) return;

      if (isPlaying) {
        video.play().catch(() => {
          video.muted = true;
          video
            .play()
            .then(onAutoplayFailed)
            .catch((e) => console.error('Muted autoplay failed', e));
        });
      } else {
        video.pause();
      }
    }, [isPlaying, videoRef, onAutoplayFailed]);

    return (
      <>
        {/* Video */}
        <div className="absolute inset-0 z-0 cursor-pointer" onClick={onVideoClick}>
          <video
            ref={videoRef}
            src={src}
            className="w-full h-full object-cover"
            loop
            muted={isMuted}
            playsInline
          />
        </div>

        {/* Play/Pause flash */}
        {showPlayIcon && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
            <div className="bg-black/40 p-4 rounded-full backdrop-blur-sm">
              {isPlaying ? (
                <Play className="w-12 h-12 text-white fill-white" />
              ) : (
                <Pause className="w-12 h-12 text-white fill-white" />
              )}
            </div>
          </div>
        )}

        {/* Heart burst on double-tap */}
        {animating && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20 animate-bounce">
            {/* Heart imported by parent to avoid re-import */}
            <svg viewBox="0 0 24 24" className="w-32 h-32 text-pink-500 fill-pink-500 opacity-80">
              <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
            </svg>
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/90 pointer-events-none z-10" />

        {/* Progress bar */}
        <div
          className="absolute bottom-0 left-0 right-0 h-1.5 bg-white/20 z-30 cursor-pointer group"
          onClick={onSeek}
        >
          <div
            className="h-full bg-white opacity-80 group-hover:h-3 group-hover:bg-pink-500 transition-all duration-200"
            style={{ width: `${progress}%` }}
          />
        </div>
      </>
    );
  }
);

VideoPlayer.displayName = 'VideoPlayer';
export default VideoPlayer;
