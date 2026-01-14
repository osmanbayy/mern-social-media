import { Link, useNavigate } from "react-router-dom";
import RightPanelSkeleton from "../skeletons/RightPanelSkeleton";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import defaultProfilePicture from "../../assets/avatar-placeholder.png";
import LoadingSpinner from "./LoadingSpinner";
import { followUser, getSuggestedUsers } from "../../api/users";
import toast from "react-hot-toast";
import { LuSearch } from "react-icons/lu";
import { RIGHT_PANEL_CONSTANTS, RIGHT_PANEL_ROUTES } from "../../constants/rightPanel";
import { extractSuggestedUsers, getHasMoreUsers, getDisplayedUsers } from "../../utils/suggestedUsers";

const RightPanel = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [loadingUserId, setLoadingUserId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  const { data: suggestedUsersData, isLoading } = useQuery({
    queryKey: ["suggestedUsers"],
    queryFn: () => getSuggestedUsers(RIGHT_PANEL_CONSTANTS.INITIAL_PAGE, RIGHT_PANEL_CONSTANTS.SUGGESTED_USERS_LIMIT),
  });

  const suggestedUsers = extractSuggestedUsers(suggestedUsersData);
  const hasMore = getHasMoreUsers(suggestedUsersData, RIGHT_PANEL_CONSTANTS.SUGGESTED_USERS_LIMIT);
  const displayedUsers = getDisplayedUsers(suggestedUsers, RIGHT_PANEL_CONSTANTS.SUGGESTED_USERS_LIMIT);

  const { mutate: follow } = useMutation({
    mutationFn: (userId) => followUser(userId),
    onMutate: (userId) => {
      setLoadingUserId(userId);
      // Optimistically remove user from list
      queryClient.setQueryData(["suggestedUsers"], (oldData) => {
        if (!oldData) return oldData;
        
        if (Array.isArray(oldData)) {
          return oldData.filter(user => user._id !== userId);
        }
        
        if (oldData.users) {
          return {
            ...oldData,
            users: oldData.users.filter(user => user._id !== userId),
            hasMore: oldData.hasMore || false,
          };
        }
        
        return oldData;
      });
    },
    onSuccess: async () => {
      // Invalidate queries to refresh data
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["suggestedUsers"] }),
        queryClient.invalidateQueries({ queryKey: ["authUser"] }),
      ]);
      setLoadingUserId(null);
    },
    onError: (error, userId) => {
      toast.error(error.message);
      // Revert optimistic update on error
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

  if (suggestedUsers.length === 0) {
    return <div className="md:w-64 w-0"></div>;
  }

  return (
    <div className="hidden lg:flex flex-shrink-0 w-80">
      <div className="sticky top-0 h-screen flex flex-col p-5 pt-4 overflow-y-auto gap-4">
        {/* Search Input */}
        <div className="w-full">
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              placeholder="Ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-full bg-base-200/50 border border-base-300/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200 text-sm"
            />
            <LuSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-base-content/40" />
          </form>
        </div>

        <div className="p-5 rounded-2xl bg-base-200/30 backdrop-blur-sm border border-base-300/50 shadow w-full">
          <p className="font-bold text-lg mb-5 text-base-content">Kimi takip etmeli?</p>
          <div className="flex flex-col gap-4">
            {isLoading && (
              <>
                {Array.from({ length: RIGHT_PANEL_CONSTANTS.SKELETON_COUNT }).map((_, index) => (
                  <RightPanelSkeleton key={index} />
                ))}
              </>
            )}
            {!isLoading && displayedUsers.map((user) => (
              <Link
                to={`${RIGHT_PANEL_ROUTES.PROFILE}/${user.username}`}
                className="flex items-center justify-between gap-3 p-3 rounded-xl hover:bg-base-200/50 transition-all duration-300 group w-full"
                key={user._id}
              >
                <div className="flex gap-3 items-center flex-1 min-w-0 overflow-hidden">
                  <div className="avatar flex-shrink-0">
                    <div className="w-10 h-10 rounded-full ring-2 ring-base-300 group-hover:ring-primary transition-all duration-300">
                      <img
                        src={user.profileImage || defaultProfilePicture}
                        className="w-full h-full rounded-full object-cover"
                        alt={user.fullname}
                      />
                    </div>
                  </div>
                  <div className="flex flex-col min-w-0 flex-1 overflow-hidden">
                    <span className="text-sm tracking-tight truncate group-hover:text-primary transition-colors block">
                      {user.fullname}
                    </span>
                    <span className="text-xs text-base-content/60 truncate block">
                      @{user.username}
                    </span>
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <button
                    className="btn btn-primary btn-sm rounded-full text-white hover:scale-105 transition-transform duration-200 shadow-md hover:shadow-lg whitespace-nowrap"
                    onClick={(e) => handleFollowClick(e, user._id)}
                    disabled={loadingUserId === user._id}
                  >
                    {loadingUserId === user._id ? <LoadingSpinner size="sm" /> : "Takip et"}
                  </button>
                </div>
              </Link>
            ))}
            {!isLoading && displayedUsers.length > 0 && (
              <button
                onClick={() => navigate(RIGHT_PANEL_ROUTES.SUGGESTIONS)}
                className="btn btn-ghost btn-sm w-full mt-2 hover:bg-base-200/50 transition-all duration-200 text-center rounded-xl"
              >
                Daha fazla öneri göster
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default RightPanel;
