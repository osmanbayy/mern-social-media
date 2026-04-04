export default function MessageRequestCardSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-base-300/30 bg-base-100/50 p-4">
      <div className="flex gap-3">
        <div className="skeleton h-14 w-14 shrink-0 rounded-full" />
        <div className="flex-1 space-y-2">
          <div className="skeleton h-4 w-32 rounded-full" />
          <div className="skeleton h-3 w-full rounded-full" />
          <div className="skeleton h-3 w-4/5 rounded-full" />
        </div>
      </div>
      <div className="mt-4 flex justify-end gap-2">
        <div className="skeleton h-9 w-20 rounded-full" />
        <div className="skeleton h-9 w-24 rounded-full" />
      </div>
    </div>
  );
}
