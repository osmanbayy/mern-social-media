import { Link, useNavigate } from "react-router-dom";
import defaultProfilePicture from "../../assets/avatar-placeholder.png";
import LoadingSpinner from "./LoadingSpinner";
import { LuSparkles, LuChevronRight } from "react-icons/lu";
import { SUGGESTED_USERS_QUERY_KEYS } from "../../constants/suggestedUsersQueries";
import { extractSuggestedUsers } from "../../utils/suggestedUsers";
import { useSuggestedUsersQuery } from "../../hooks/useSuggestedUsersQuery";
import { useFollowSuggestedUserMutation } from "../../hooks/useFollowSuggestedUserMutation";

const MOBILE_SUGGESTIONS_LIMIT = 20;

const MobileSuggestedUsers = () => {
  const navigate = useNavigate();

  const { data: suggestedUsersData, isLoading } = useSuggestedUsersQuery({
    queryKey: SUGGESTED_USERS_QUERY_KEYS.mobile,
    page: 1,
    limit: MOBILE_SUGGESTIONS_LIMIT,
  });

  const suggestedUsers = extractSuggestedUsers(suggestedUsersData);

  const { follow, loadingUserId } = useFollowSuggestedUserMutation({
    optimisticRemoveFromQueryKeys: [SUGGESTED_USERS_QUERY_KEYS.mobile],
    invalidateQueryKeys: [
      SUGGESTED_USERS_QUERY_KEYS.mobile,
      SUGGESTED_USERS_QUERY_KEYS.rightPanel,
      ["authUser"],
    ],
    successToast: "Takip edildi",
  });

  if (isLoading || suggestedUsers.length === 0) {
    return null;
  }

  return (
    <section className="mb-4 px-3 sm:px-4 lg:hidden">
      <div className="overflow-hidden rounded-3xl border border-base-300/60 bg-gradient-to-b from-base-100 to-base-200/20 shadow-lg ring-1 ring-black/5 dark:to-base-300/15 dark:ring-white/5">
        <div className="flex items-center justify-between gap-2 border-b border-base-300/40 px-4 py-3">
          <div className="flex min-w-0 items-center gap-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent/12 text-accent">
              <LuSparkles className="h-4 w-4" strokeWidth={2.25} />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-bold tracking-tight text-base-content">Kimi takip etmeli?</h3>
              <p className="text-[11px] text-base-content/50">Hızlı öneriler</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => navigate("/suggestions")}
            className="btn btn-ghost btn-xs shrink-0 gap-0.5 rounded-full text-accent"
          >
            Tümü
            <LuChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="scrollbar-hide overflow-x-auto px-2 pb-3 pt-1">
          <div className="flex gap-3 px-1">
            {suggestedUsers.map((user) => (
              <article
                key={user._id}
                className="flex w-[148px] shrink-0 flex-col rounded-2xl border border-base-300/45 bg-base-200/25 p-3 shadow-sm transition hover:border-accent/25 hover:shadow-md"
              >
                <Link to={`/profile/${user.username}`} className="flex flex-col items-center text-center">
                  <div className="avatar mb-2">
                    <div className="h-16 w-16 rounded-full ring-2 ring-base-300/70 ring-offset-2 ring-offset-base-100 transition hover:ring-accent/40">
                      <img
                        src={user.profileImage || defaultProfilePicture}
                        className="h-full w-full rounded-full object-cover"
                        alt=""
                      />
                    </div>
                  </div>
                  <p className="mb-0.5 w-full truncate text-sm font-semibold text-base-content">{user.fullname}</p>
                  <p className="mb-3 w-full truncate text-xs text-base-content/50">@{user.username}</p>
                </Link>
                <button
                  type="button"
                  className="btn btn-accent btn-sm mt-auto w-full rounded-full font-semibold shadow-sm"
                  onClick={(e) => {
                    e.preventDefault();
                    follow(user._id);
                  }}
                  disabled={loadingUserId === user._id}
                >
                  {loadingUserId === user._id ? <LoadingSpinner size="sm" /> : "Takip et"}
                </button>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default MobileSuggestedUsers;
