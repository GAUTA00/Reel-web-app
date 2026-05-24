// src/components/skeletons/SearchSkeleton.tsx
export default function SearchSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-3 rounded-xl bg-gray-900/40">
          <div className="skeleton-wave w-12 h-12 rounded-full shrink-0" />
          <div className="flex flex-col gap-2 flex-1">
            <div className="skeleton-wave h-3 w-32 rounded-full" />
            <div className="skeleton-wave h-3 w-20 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}
