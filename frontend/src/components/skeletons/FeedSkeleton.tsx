// src/components/skeletons/FeedSkeleton.tsx
export default function FeedSkeleton() {
  return (
    <div className="snap-start w-full h-[100dvh] relative bg-gray-950 flex items-end pb-20 overflow-hidden">
      {/* Shimmer video background */}
      <div className="absolute inset-0 skeleton-wave bg-gray-900" />

      {/* Bottom left — user info */}
      <div className="absolute left-4 bottom-24 flex flex-col gap-3 z-10">
        <div className="skeleton-wave h-4 w-32 rounded-full" />
        <div className="skeleton-wave h-3 w-48 rounded-full" />
        <div className="skeleton-wave h-3 w-36 rounded-full" />
        <div className="flex items-center gap-2 mt-2">
          <div className="skeleton-wave h-3 w-4 rounded-full" />
          <div className="skeleton-wave h-3 w-28 rounded-full" />
        </div>
      </div>

      {/* Right sidebar */}
      <div className="absolute right-3 bottom-28 flex flex-col gap-6 items-center z-10">
        <div className="skeleton-wave w-12 h-12 rounded-full" />
        <div className="skeleton-wave w-8 h-8 rounded-full" />
        <div className="skeleton-wave w-8 h-8 rounded-full" />
        <div className="skeleton-wave w-8 h-8 rounded-full" />
        <div className="skeleton-wave w-8 h-8 rounded-full" />
      </div>
    </div>
  );
}
