import { useNavigate } from "react-router-dom";
import RightPanelSkeleton from "../skeletons/RightPanelSkeleton";
import { useState } from "react";
import { LuSparkles, LuChevronRight } from "react-icons/lu";
import { useAuth } from "../../contexts/AuthContext";
import { isFollowingUser } from "../../utils/followStatus";
import { RIGHT_PANEL_CONSTANTS, RIGHT_PANEL_ROUTES } from "../../constants/rightPanel";
import { SUGGESTED_USERS_QUERY_KEYS } from "../../constants/suggestedUsersQueries";
import { extractSuggestedUsers, getHasMoreUsers, getDisplayedUsers } from "../../utils/suggestedUsers";
import { useSuggestedUsersQuery } from "../../hooks/useSuggestedUsersQuery";
import { useFollowSuggestedUserMutation } from "../../hooks/useFollowSuggestedUserMutation";
import SearchBar from "./SearchBar";
import SuggestedUserRow from "./SuggestedUserRow";

const RightPanel = () => {
  const navigate = useNavigate();
  const { authUser } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");

  const { data: suggestedUsersData, isLoading } = useSuggestedUsersQuery({
    queryKey: SUGGESTED_USERS_QUERY_KEYS.rightPanel,
    page: RIGHT_PANEL_CONSTANTS.INITIAL_PAGE,
    limit: RIGHT_PANEL_CONSTANTS.SUGGESTED_USERS_LIMIT,
  });

  const suggestedUsers = extractSuggestedUsers(suggestedUsersData);
  const hasMore = getHasMoreUsers(suggestedUsersData, RIGHT_PANEL_CONSTANTS.SUGGESTED_USERS_LIMIT);
  const displayedUsers = getDisplayedUsers(suggestedUsers, RIGHT_PANEL_CONSTANTS.SUGGESTED_USERS_LIMIT);

  const { follow, loadingUserId, isFollowed } = useFollowSuggestedUserMutation({
    optimisticRemoveFromQueryKeys: [SUGGESTED_USERS_QUERY_KEYS.rightPanel],
    invalidateQueryKeys: [
      SUGGESTED_USERS_QUERY_KEYS.rightPanel,
      SUGGESTED_USERS_QUERY_KEYS.mobile,
      ["authUser"],
    ],
  });

  const handleSearch = (e) => {
    e.preventDefault();
    const trimmedQuery = searchQuery.trim();
    if (!trimmedQuery) return;

    navigate(`${RIGHT_PANEL_ROUTES.SEARCH}?q=${encodeURIComponent(trimmedQuery)}`);
    setSearchQuery("");
  };

  const handleFollowClick = (e, userId) => {
    e.preventDefault();
    e.stopPropagation();
    follow(userId);
  };

  const showSuggestionsBlock = isLoading || displayedUsers.length > 0;

  return (
    <div className="hidden w-92 flex-shrink-0 lg:flex">
      <div className="sticky top-0 flex h-screen flex-col gap-4 overflow-y-auto p-5 pt-4">
        <SearchBar
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onSubmit={handleSearch}
        />

        {showSuggestionsBlock && (
          <section className="w-full overflow-hidden rounded-3xl border border-base-300/60 bg-gradient-to-b from-base-100 via-base-100 to-base-200/25 shadow-xl ring-1 ring-black/5 dark:from-base-100 dark:via-base-100 dark:to-base-300/20 dark:ring-white/5">
            <div className="border-b border-base-300/40 bg-gradient-to-r from-accent/8 to-transparent px-4 py-3.5">
              <div className="flex items-start justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2.5">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent/12 text-accent">
                    <LuSparkles className="h-4 w-4" strokeWidth={2.25} />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-[15px] font-bold leading-tight tracking-tight text-base-content">
                      Kimi takip etmeli?
                    </h2>
                    <p className="text-xs text-base-content/55">Senin için seçildi</p>
                  </div>
                </div>
                {hasMore && (
                  <button
                    type="button"
                    onClick={() => navigate(RIGHT_PANEL_ROUTES.SUGGESTIONS)}
                    className="btn btn-ghost btn-xs shrink-0 gap-0.5 rounded-full text-accent"
                  >
                    Tümü
                    <LuChevronRight className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-0.5 p-2">
              {isLoading &&
                Array.from({ length: RIGHT_PANEL_CONSTANTS.SKELETON_COUNT }).map((_, index) => (
                  <RightPanelSkeleton key={index} />
                ))}

              {!isLoading &&
                displayedUsers.map((user) => (
                  <SuggestedUserRow
                    key={user._id}
                    user={user}
                    profileHref={`${RIGHT_PANEL_ROUTES.PROFILE}/${user.username}`}
                    variant="panel"
                    isFollowLoading={loadingUserId === user._id}
                    isFollowing={isFollowed(user._id) || isFollowingUser(authUser, user._id)}
                    onFollowClick={(e) => handleFollowClick(e, user._id)}
                  />
                ))}
            </div>

            {!isLoading && displayedUsers.length > 0 && (
              <div className="border-t border-base-300/40 p-2">
                <button
                  type="button"
                  onClick={() => navigate(RIGHT_PANEL_ROUTES.SUGGESTIONS)}
                  className="btn btn-ghost btn-sm h-10 w-full gap-1 rounded-2xl font-medium text-base-content/75 hover:bg-base-200/60 hover:text-base-content"
                >
                  Daha fazla öneri
                  <LuChevronRight className="h-4 w-4 opacity-70" />
                </button>
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
};

export default RightPanel;
