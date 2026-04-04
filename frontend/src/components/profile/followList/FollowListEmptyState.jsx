import { LuUsers } from "react-icons/lu";

export default function FollowListEmptyState({ message }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center sm:py-20">
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-accent/20 via-accent/10 to-transparent ring-1 ring-accent/25">
        <LuUsers className="h-8 w-8 text-accent" strokeWidth={1.75} />
      </div>
      <p className="text-sm font-medium text-base-content/75">{message}</p>
      <p className="mt-1 max-w-xs text-xs text-base-content/45">
        Listeler güncellendikçe burada görünür.
      </p>
    </div>
  );
}
