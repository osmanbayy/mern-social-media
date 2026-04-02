import { Link, useNavigate } from "react-router-dom";
import RightPanelSkeleton from "../skeletons/RightPanelSkeleton";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import defaultProfilePicture from "../../assets/avatar-placeholder.png";
import LoadingSpinner from "./LoadingSpinner";
import { followUser, getSuggestedUsers } from "../../api/users";
import toast from "react-hot-toast";
import { LuSearch, LuSparkles, LuChevronRight } from "react-icons/lu";
import { RIGHT_PANEL_CONSTANTS, RIGHT_PANEL_ROUTES } from "../../constants/rightPanel";
import { extractSuggestedUsers, getHasMoreUsers, getDisplayedUsers } from "../../utils/suggestedUsers";

const RightPanel = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [loadingUserId, setLoadingUserId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: suggestedUsersData, isLoading } = useQuery({
    queryKey: ["suggestedUsers"],
    queryFn: () =>
      getSuggestedUsers(RIGHT_PANEL_CONSTANTS.INITIAL_PAGE, RIGHT_PANEL_CONSTANTS.SUGGESTED_USERS_LIMIT),
  });

  const suggestedUsers = extractSuggestedUsers(suggestedUsersData);
  const hasMore = getHasMoreUsers(suggestedUsersData, RIGHT_PANEL_CONSTANTS.SUGGESTED_USERS_LIMIT);
  const displayedUsers = getDisplayedUsers(suggestedUsers, RIGHT_PANEL_CONSTANTS.SUGGESTED_USERS_LIMIT);

  const { mutate: follow } = useMutation({
    mutationFn: (userId) => followUser(userId),
    onMutate: (userId) => {
      setLoadingUserId(userId);
      queryClient.setQueryData(["suggestedUsers"], (oldData) => {
        if (!oldData) return oldData;

        if (Array.isArray(oldData)) {
          return oldData.filter((user) => user._id !== userId);
        }

        if (oldData.users) {
          return {
            ...oldData,
            users: oldData.users.filter((user) => user._id !== userId),
            hasMore: oldData.hasMore || false,
          };
        }

        return oldData;
      });
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["suggestedUsers"] }),
        queryClient.invalidateQueries({ queryKey: ["authUser"] }),
      ]);
      setLoadingUserId(null);
    },
    onError: (error) => {
      toast.error(error.message);
      queryClient.invalidateQueries({ queryKey: ["suggestedUsers"] });
      setLoadingUserId(null);
    },
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
        <form onSubmit={handleSearch} className="relative w-full">
          <label className="input input-bordered flex h-11 w-full items-center gap-2 rounded-full border-base-300/60 bg-base-200/40 pl-1 pr-2 text-sm shadow-sm transition focus-within:border-accent/40 focus-within:ring-2 focus-within:ring-accent/20">
            <LuSearch className="ml-2 h-5 w-5 shrink-0 text-base-content/45" aria-hidden />
            <input
              type="search"
              placeholder="Ara…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="grow bg-transparent placeholder:text-base-content/45 focus:outline-none"
              autoComplete="off"
            />
          </label>
        </form>

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
                  <Link
                    to={`${RIGHT_PANEL_ROUTES.PROFILE}/${user.username}`}
                    className="group flex items-center justify-between gap-3 rounded-2xl px-3 py-2.5 transition-colors hover:bg-base-200/50"
                    key={user._id}
                  >
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                      <div className="avatar shrink-0">
                        <div className="h-11 w-11 rounded-full ring-2 ring-base-300/70 transition-[box-shadow] duration-300 group-hover:ring-accent/35">
                          <img
                            src={user.profileImage || defaultProfilePicture}
                            className="h-full w-full rounded-full object-cover"
                            alt=""
                          />
                        </div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold tracking-tight text-base-content group-hover:text-accent">
                          {user.fullname}
                        </p>
                        <p className="truncate text-xs text-base-content/50">@{user.username}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="btn btn-outline btn-accent btn-xs shrink-0 rounded-full px-4 font-semibold shadow-sm"
                      onClick={(e) => handleFollowClick(e, user._id)}
                      disabled={loadingUserId === user._id}
                    >
                      {loadingUserId === user._id ? (
                        <LoadingSpinner size="sm" />
                      ) : (
                        "Takip et"
                      )}
                    </button>
                  </Link>
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
