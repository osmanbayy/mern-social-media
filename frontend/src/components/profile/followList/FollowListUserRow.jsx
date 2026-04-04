import { useNavigate } from "react-router-dom";
import defaultProfilePicture from "../../../assets/avatar-placeholder.png";
import VerifiedBadge from "../../common/VerifiedBadge";
import useFollow from "../../../hooks/useFollow";
import { isMutualFollow, isNotFollowingBack } from "../../../utils/followListRelations";

export default function FollowListUserRow({
  item,
  authUser,
  showMutualLabel = false,
  showNotFollowingBackLabel = false,
}) {
  const navigate = useNavigate();
  const { follow, isPending } = useFollow(item._id);

  const iFollowThem = authUser?.following?.includes(item._id);
  const mutual = isMutualFollow(authUser, item);
  const notFollowingBack = isNotFollowingBack(authUser, item);

  const goProfile = () => {
    navigate(`/profile/${item.username}`);
  };

  const onFollowClick = (e) => {
    e.stopPropagation();
    follow();
  };

  const showFollowBtn = authUser?._id !== item._id;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={goProfile}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          goProfile();
        }
      }}
      className="group flex w-full cursor-pointer items-center justify-between gap-3 rounded-2xl border border-base-300/45 bg-base-100/85 px-4 py-3.5 shadow-sm ring-1 ring-black/5 transition-all hover:border-accent/20 hover:bg-base-100 hover:shadow-md dark:bg-base-200/40 dark:ring-white/5 dark:hover:bg-base-200/55"
    >
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <div className="avatar shrink-0">
          <div className="h-11 w-11 overflow-hidden rounded-full ring-2 ring-base-300/70 ring-offset-2 ring-offset-base-100 transition group-hover:ring-accent/30 dark:ring-base-300/50">
            <img
              src={item.profileImage || defaultProfilePicture}
              alt=""
              className="h-full w-full object-cover"
            />
          </div>
        </div>
        <div className="min-w-0 flex-1 text-left">
          <span className="inline-flex items-center gap-1 text-sm font-semibold text-base-content">
            <span className="truncate">{item.fullname}</span>
            <VerifiedBadge user={item} size="sm" />
          </span>
          <p className="truncate text-xs text-base-content/55">@{item.username}</p>
          {showMutualLabel && mutual && (
            <p className="mt-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
              Birbirinizi takip ediyorsunuz
            </p>
          )}
          {showNotFollowingBackLabel && notFollowingBack && (
            <p className="mt-1 text-[11px] font-medium text-rose-500 dark:text-rose-400">
              Seni takip etmiyor
            </p>
          )}
        </div>
      </div>

      {showFollowBtn && (
        <button
          type="button"
          className={`btn btn-xs shrink-0 rounded-full px-4 font-semibold ${
            iFollowThem ? "btn-outline border-base-300" : "btn-primary text-primary-content"
          }`}
          onClick={onFollowClick}
          disabled={isPending}
        >
          {isPending ? (
            <span className="loading loading-spinner loading-xs" />
          ) : iFollowThem ? (
            "Takibi Bırak"
          ) : (
            "Sen de takip et"
          )}
        </button>
      )}
    </div>
  );
}
