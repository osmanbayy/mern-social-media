import { useNavigate } from "react-router-dom";
import defaultProfilePicture from "../../assets/avatar-placeholder.png";
import VerifiedBadge from "../common/VerifiedBadge";
import LoadingSpinner from "../common/LoadingSpinner";
import { useAuth } from "../../contexts/AuthContext";
import useFollow from "../../hooks/useFollow";
import { isAuthUserFollowing } from "../../utils/followingUtils";

export default function SearchUserResultRow({ user }) {
  const navigate = useNavigate();
  const { follow, unfollow, isPending } = useFollow(user._id);
  const { authUser } = useAuth();
  const following = isAuthUserFollowing(authUser, user._id);

  const openProfile = () => {
    navigate(`/profile/${user.username}`);
  };

  return (
    <div
      role="link"
      tabIndex={0}
      onClick={openProfile}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openProfile();
        }
      }}
      className="group flex cursor-pointer items-center gap-3 rounded-2xl border border-base-300/40 bg-base-100/60 p-3 transition-all hover:border-base-300/70 hover:bg-base-200/40 dark:bg-base-200/25"
    >
      <div className="avatar shrink-0">
        <div className="h-12 w-12 rounded-full ring-2 ring-base-300 transition-all group-hover:ring-primary/50">
          <img
            src={user.profileImage || defaultProfilePicture}
            className="h-full w-full rounded-full object-cover"
            alt=""
          />
        </div>
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 items-center gap-1">
          <p className="truncate text-sm font-semibold transition-colors group-hover:text-primary">
            {user.fullname}
          </p>
          <VerifiedBadge user={user} size="sm" />
        </div>
        <p className="truncate text-xs text-base-content/60">@{user.username}</p>
        {user.bio ? (
          <p className="mt-1 line-clamp-2 text-xs text-base-content/70">{user.bio}</p>
        ) : null}
      </div>
      {authUser?._id !== user._id && (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (following) unfollow();
            else follow();
          }}
          disabled={isPending}
          className={`btn btn-sm shrink-0 rounded-full px-4 ${
            following ? "btn-outline border-base-300" : "btn-primary text-primary-content"
          }`}
        >
          {isPending ? <LoadingSpinner size="xs" /> : following ? "Takibi Bırak" : "Takip Et"}
        </button>
      )}
    </div>
  );
}
