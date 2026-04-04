import { Link } from "react-router-dom";
import defaultProfilePicture from "../../assets/avatar-placeholder.png";
import VerifiedBadge from "../common/VerifiedBadge";

export default function DesktopSidebarProfileCard({ authUser, isDark }) {
  if (!authUser) return null;

  return (
    <Link
      to={`/profile/${authUser.username}`}
      className="mb-6 flex gap-3 rounded-2xl border border-base-300/50 bg-base-100/70 p-3 shadow-sm ring-1 ring-black/[0.03] transition hover:border-accent/30 hover:shadow-md dark:bg-base-200/20 dark:ring-white/5"
    >
      <div className="avatar shrink-0">
        <div
          className={`h-12 w-12 rounded-full ring-2 ring-offset-2 ring-offset-base-100 ${
            isDark ? "ring-white/20" : "ring-base-300/80"
          }`}
        >
          <img
            src={authUser.profileImage || defaultProfilePicture}
            alt=""
            className="h-full w-full rounded-full object-cover"
          />
        </div>
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 items-center gap-1">
          <p className="truncate text-sm font-bold leading-tight text-base-content">{authUser.fullname}</p>
          <VerifiedBadge user={authUser} size="sm" />
        </div>
        <p className="truncate text-xs text-base-content/50">@{authUser.username}</p>
        {authUser.bio ? (
          <p className="mt-1 line-clamp-2 text-[11px] leading-snug text-base-content/45">{authUser.bio}</p>
        ) : null}
        <div className="mt-2 flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] text-base-content/55">
          <span>
            <strong className="font-semibold text-base-content">{authUser.following?.length ?? 0}</strong> takip
          </span>
          <span>
            <strong className="font-semibold text-base-content">{authUser.followers?.length ?? 0}</strong> takipçi
          </span>
        </div>
      </div>
    </Link>
  );
}
