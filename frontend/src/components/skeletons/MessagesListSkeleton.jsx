function ConversationRowSkeleton() {
  return (
    <div className="flex animate-pulse items-center gap-3 rounded-2xl border border-base-300/30 bg-base-100/50 p-3.5">
      <div className="skeleton h-14 w-14 shrink-0 rounded-full" />
      <div className="min-w-0 flex-1 space-y-2">
        <div className="skeleton h-4 w-2/5 rounded-full" />
        <div className="skeleton h-3 w-4/5 rounded-full" />
      </div>
      <div className="skeleton h-3 w-10 shrink-0 rounded-full" />
    </div>
  );
}

export default function MessagesListSkeleton({ count = 4 }) {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: count }, (_, i) => (
        <ConversationRowSkeleton key={i} />
      ))}
    </div>
  );
}
