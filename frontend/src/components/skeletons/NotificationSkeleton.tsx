// src/components/skeletons/NotificationSkeleton.tsx
export default function NotificationSkeleton() {
  return (
    <div className="space-y-4 p-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-start gap-4 p-4 rounded-xl bg-gray-900/40">
          <div className="skeleton-wave w-10 h-10 rounded-full shrink-0" />
          <div className="flex-1 flex flex-col gap-2">
            <div className="skeleton-wave h-3 w-3/4 rounded-full" />
            <div className="skeleton-wave h-3 w-1/2 rounded-full" />
          </div>
          <div className="skeleton-wave w-12 h-16 rounded-lg shrink-0" />
        </div>
      ))}
    </div>
  );
}
