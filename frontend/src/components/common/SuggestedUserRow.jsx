import { Link } from "react-router-dom";
import defaultProfilePicture from "../../assets/avatar-placeholder.png";
import LoadingSpinner from "./LoadingSpinner";

/**
 * Avatar + isim + kullanıcı adı + takip butonu (yatay satır).
 * @param {"panel" | "page"} variant — panel: sağ panel; page: öneriler tam sayfa
 */
const SuggestedUserRow = ({
  user,
  profileHref,
  onFollowClick,
  isFollowLoading = false,
  followLabel = "Takip et",
  variant = "panel",
}) => {
  const isPage = variant === "page";

  return (
    <Link
      to={profileHref}
      className={
        isPage
          ? "group flex items-center justify-between gap-4 rounded-xl border border-base-300/50 p-4 transition-all duration-300 hover:bg-base-200/50"
          : "group flex items-center justify-between gap-3 rounded-2xl px-3 py-2.5 transition-colors hover:bg-base-200/50"
      }
    >
      <div className={`flex min-w-0 flex-1 items-center ${isPage ? "gap-3" : "gap-3"}`}>
        <div className="avatar shrink-0">
          <div
            className={
              isPage
                ? "h-12 w-12 rounded-full ring-2 ring-base-300 transition-all duration-300 group-hover:ring-primary"
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
          <p
            className={
              isPage
                ? "truncate text-base font-semibold tracking-tight transition-colors group-hover:text-primary"
                : "truncate text-sm font-semibold tracking-tight text-base-content group-hover:text-accent"
            }
          >
            {user.fullname}
          </p>
          <p className={`truncate text-sm text-base-content/60 ${isPage ? "" : "text-xs text-base-content/50"}`}>
            @{user.username}
          </p>
          {isPage && user.bio ? (
            <span className="mt-1 line-clamp-2 text-sm text-base-content/50">{user.bio}</span>
          ) : null}
        </div>
      </div>
      <div className="shrink-0">
        <button
          type="button"
          className={
            isPage
              ? "btn btn-primary btn-sm rounded-full text-white shadow-md transition-transform duration-200 hover:scale-105 hover:shadow-lg"
              : "btn btn-outline btn-accent btn-xs rounded-full px-4 font-semibold shadow-sm"
          }
          onClick={onFollowClick}
          disabled={isFollowLoading}
        >
          {isFollowLoading ? <LoadingSpinner size="sm" /> : followLabel}
        </button>
      </div>
    </Link>
  );
};

export default SuggestedUserRow;
