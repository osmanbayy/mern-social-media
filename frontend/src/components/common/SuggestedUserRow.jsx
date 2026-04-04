import { Link } from "react-router-dom";
import defaultProfilePicture from "../../assets/avatar-placeholder.png";
import LoadingSpinner from "./LoadingSpinner";
import VerifiedBadge from "./VerifiedBadge";

/**
 * Avatar + isim + kullanıcı adı + takip butonu (yatay satır).
 * @param {"panel" | "page"} variant — panel: sağ panel; page: öneriler tam sayfa
 */
const SuggestedUserRow = ({
  user,
  profileHref,
  onFollowClick,
  isFollowLoading = false,
  isFollowing = false,
  followLabel = "Takip et",
  followingLabel = "Takiptesin",
  pendingLabel = "Takip ediliyor…",
  variant = "panel",
}) => {
  const isPage = variant === "page";
  const showFollowing = isFollowing && !isFollowLoading;

  return (
    <Link
      to={profileHref}
      className={
        isPage
          ? "group flex items-center justify-between gap-4 px-4 py-4 transition-colors duration-200 hover:bg-base-200/45 sm:px-5"
          : "group flex items-center justify-between gap-3 rounded-2xl px-3 py-2.5 transition-colors hover:bg-base-200/50"
      }
    >
      <div className={`flex min-w-0 flex-1 items-center ${isPage ? "gap-3" : "gap-3"}`}>
        <div className="avatar shrink-0">
          <div
            className={
              isPage
                ? "h-[52px] w-[52px] rounded-full ring-2 ring-base-300/60 shadow-sm transition-all duration-300 group-hover:ring-accent/50 group-hover:shadow-md"
                : "h-11 w-11 rounded-full ring-2 ring-base-300/70 transition-[box-shadow] duration-300 group-hover:ring-accent/35"
            }
          >
            <img
              src={user.profileImage || defaultProfilePicture}
              className="h-full w-full rounded-full object-cover"
              alt={user.fullname || ""}
            />
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-center gap-1">
            <p
              className={
                isPage
                  ? "truncate text-base font-semibold tracking-tight text-base-content transition-colors group-hover:text-accent"
                  : "truncate text-sm font-semibold tracking-tight text-base-content group-hover:text-accent"
              }
            >
              {user.fullname}
            </p>
            <VerifiedBadge user={user} size="sm" />
          </div>
          <p className={`truncate text-sm text-base-content/60 ${isPage ? "" : "text-xs text-base-content/50"}`}>
            @{user.username}
          </p>
          {isPage && user.bio ? (
            <span className="mt-1.5 line-clamp-2 text-[13px] leading-snug text-base-content/55">{user.bio}</span>
          ) : null}
        </div>
      </div>
      <div className="shrink-0">
        <button
          type="button"
          className={
            showFollowing
              ? isPage
                ? "btn btn-sm cursor-default rounded-full border border-base-300/70 bg-base-200/80 px-4 font-semibold text-base-content/75"
                : "btn btn-ghost btn-xs cursor-default rounded-full border border-base-300/60 px-3 font-semibold text-base-content/70"
              : isPage
                ? "btn btn-sm rounded-full border-0 bg-accent px-5 font-semibold text-accent-content shadow-sm transition-all duration-200 hover:brightness-110 hover:shadow-md active:scale-[0.98] disabled:opacity-90"
                : "btn btn-outline btn-accent btn-xs rounded-full px-4 font-semibold shadow-sm"
          }
          onClick={showFollowing ? undefined : onFollowClick}
          disabled={isFollowLoading || showFollowing}
        >
          {isFollowLoading ? (
            <span
              className={`inline-flex max-w-full items-center ${isPage ? "gap-2" : "gap-1.5 text-xs"}`}
            >
              <LoadingSpinner size="sm" />
              <span className={`truncate font-medium ${isPage ? "text-sm" : ""}`}>{pendingLabel}</span>
            </span>
          ) : showFollowing ? (
            followingLabel
          ) : (
            followLabel
          )}
        </button>
      </div>
    </Link>
  );
};

export default SuggestedUserRow;
