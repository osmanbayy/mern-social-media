export default function NotificationCardSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-base-300/30 bg-base-100/50 p-4">
      <div className="flex gap-4">
        <div className="skeleton h-12 w-12 shrink-0 rounded-full" />
        <div className="skeleton h-12 w-12 shrink-0 rounded-full" />
        <div className="min-w-0 flex-1 space-y-2 pt-1">
          <div className="skeleton h-4 w-3/4 max-w-xs rounded-full" />
          <div className="skeleton h-3 w-24 rounded-full" />
        </div>
      </div>
    </div>
  );
}
