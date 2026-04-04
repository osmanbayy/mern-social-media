import { FaArrowLeft } from "react-icons/fa6";
import { LuUsersRound } from "react-icons/lu";

export default function FollowListPageHeader({ displayName, subtitle, onBack }) {
  return (
    <header className="sticky top-0 z-30 border-b border-base-300/45 bg-base-100/90 shadow-sm backdrop-blur-xl">
      <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-3.5 sm:px-5">
        <button
          type="button"
          onClick={onBack}
          className="btn btn-circle btn-ghost btn-sm shrink-0"
          aria-label="Geri"
        >
          <FaArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-accent/12 text-accent ring-1 ring-accent/15">
            <LuUsersRound className="h-5 w-5" strokeWidth={2.25} />
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-lg font-bold tracking-tight text-base-content">{displayName}</h1>
            <p className="truncate text-xs text-base-content/55 sm:text-sm">{subtitle}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
