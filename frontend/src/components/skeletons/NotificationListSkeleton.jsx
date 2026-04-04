import NotificationCardSkeleton from "./NotificationCardSkeleton";

export default function NotificationListSkeleton({ count = 4 }) {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: count }, (_, i) => (
        <NotificationCardSkeleton key={i} />
      ))}
    </div>
  );
}
