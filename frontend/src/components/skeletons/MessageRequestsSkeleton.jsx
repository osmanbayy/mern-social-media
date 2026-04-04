import MessageRequestCardSkeleton from "./MessageRequestCardSkeleton";

export default function MessageRequestsSkeleton({ count = 2 }) {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: count }, (_, i) => (
        <MessageRequestCardSkeleton key={i} />
      ))}
    </div>
  );
}
