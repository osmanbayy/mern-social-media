import { Link, useNavigate } from "react-router-dom";
import RightPanelSkeleton from "../skeletons/RightPanelSkeleton";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import defaultProfilePicture from "../../assets/avatar-placeholder.png";
import LoadingSpinner from "./LoadingSpinner";
import { followUser, getSuggestedUsers } from "../../api/users";
import toast from "react-hot-toast";

const RightPanel = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [loadingUserId, setLoadingUserId] = useState(null);
  
  const { data: suggestedUsersData, isLoading } = useQuery({
    queryKey: ["suggestedUsers"],
    queryFn: () => getSuggestedUsers(1, 5),
  });

  // Handle both old array format and new paginated format
  const suggestedUsers = Array.isArray(suggestedUsersData) 
    ? suggestedUsersData 
    : suggestedUsersData?.users || [];
  
  // Check if there are more users available
  const hasMore = Array.isArray(suggestedUsersData) 
    ? suggestedUsersData.length > 5
    : suggestedUsersData?.hasMore || false;

  const { mutate: follow } = useMutation({
    mutationFn: (userId) => followUser(userId),
    onMutate: (userId) => {
      setLoadingUserId(userId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suggestedUsers"] });
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
      setLoadingUserId(null);
    },
    onError: (error) => {
      toast.error(error.message);
      setLoadingUserId(null);
    },
  });

  // Show only first 5 users
  const displayedUsers = suggestedUsers?.slice(0, 5) || [];

  if (suggestedUsers?.length === 0) return <div className="md:w-64 w-0"></div>;

  return (
    <div className="hidden lg:block my-4 mx-2">
      <div className="p-5 rounded-2xl bg-base-200/30 backdrop-blur-sm border border-base-300/50 sticky top-4 shadow-lg">
        <p className="font-bold text-lg mb-5 text-base-content">Kimi takip etmeli?</p>
        <div className="flex flex-col gap-4">
          {/* item */}
          {isLoading && (
            <>
              <RightPanelSkeleton />
              <RightPanelSkeleton />
              <RightPanelSkeleton />
              <RightPanelSkeleton />
              <RightPanelSkeleton />
            </>
          )}
          {!isLoading &&
            displayedUsers.map((user) => (
              <Link
                to={`/profile/${user.username}`}
                className="flex items-center justify-between gap-4 p-3 rounded-xl hover:bg-base-200/50 transition-all duration-300 group"
                key={user._id}
              >
                <div className="flex gap-3 items-center flex-1 min-w-0">
                  <div className="avatar flex-shrink-0">
                    <div className="w-10 h-10 rounded-full ring-2 ring-base-300 group-hover:ring-primary transition-all duration-300">
                      <img
                        src={user.profileImage || defaultProfilePicture}
                        className="w-full h-full rounded-full object-cover"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-semibold tracking-tight truncate group-hover:text-primary transition-colors">
                      {user.fullname}
                    </span>
                    <span className="text-xs text-base-content/60 truncate">
                      @{user.username}
                    </span>
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <button
                    className="btn btn-primary btn-sm rounded-full text-white hover:scale-105 transition-transform duration-200 shadow-md hover:shadow-lg"
                    onClick={(e) => {
                      e.preventDefault();
                      follow(user._id);
                    }}
                    disabled={loadingUserId === user._id}
                  >
                    {loadingUserId === user._id ? <LoadingSpinner size="sm" /> : "Takip et"}
                  </button>
                </div>
              </Link>
            ))}
          {!isLoading && displayedUsers.length > 0 && (
            <button
              onClick={() => navigate("/suggestions")}
              className="btn btn-ghost btn-sm w-full mt-2 hover:bg-base-200/50 transition-all duration-200 text-center"
            >
              Daha fazla öneri göster
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
export default RightPanel;
