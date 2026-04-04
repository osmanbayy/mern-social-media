import { UserRowSkeleton } from "../../skeletons";

export default function FollowListSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="rounded-2xl border border-base-300/40 bg-base-100/50 px-4 py-3 dark:bg-base-200/25"
        >
          <UserRowSkeleton />
        </div>
      ))}
    </div>
  );
}
