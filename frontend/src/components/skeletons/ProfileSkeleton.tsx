// src/components/skeletons/ProfileSkeleton.tsx
export default function ProfileSkeleton() {
  return (
    <div className="min-h-screen bg-black pb-20">
      {/* Header */}
      <div className="sticky top-0 bg-black/95 flex justify-between items-center p-4 border-b border-white/10">
        <div className="skeleton-wave w-8 h-8 rounded-full" />
        <div className="skeleton-wave w-28 h-4 rounded-full" />
        <div className="skeleton-wave w-8 h-8 rounded-full" />
      </div>

      {/* Avatar + name */}
      <div className="flex flex-col items-center pt-8 pb-6 px-4 gap-4">
        <div className="skeleton-wave w-24 h-24 rounded-full" />
        <div className="skeleton-wave w-32 h-4 rounded-full" />
        <div className="skeleton-wave w-48 h-3 rounded-full" />

        {/* Stats */}
        <div className="flex gap-12 mt-2">
          {[1,2,3].map(i => (
            <div key={i} className="flex flex-col items-center gap-1">
              <div className="skeleton-wave w-8 h-5 rounded" />
              <div className="skeleton-wave w-16 h-3 rounded-full" />
            </div>
          ))}
        </div>

        <div className="skeleton-wave w-48 h-9 rounded-md mt-2" />
      </div>

      {/* Tabs */}
      <div className="flex border-t border-white/10">
        <div className="flex-1 flex justify-center py-3">
          <div className="skeleton-wave w-6 h-6 rounded" />
        </div>
        <div className="flex-1 flex justify-center py-3">
          <div className="skeleton-wave w-6 h-6 rounded" />
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-3 gap-0.5">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="aspect-[3/4] skeleton-wave" />
        ))}
      </div>
    </div>
  );
}
