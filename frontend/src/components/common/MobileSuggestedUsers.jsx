import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { useState } from "react";
import defaultProfilePicture from "../../assets/avatar-placeholder.png";
import LoadingSpinner from "./LoadingSpinner";
import { followUser, getSuggestedUsers } from "../../api/users";
import toast from "react-hot-toast";

const MobileSuggestedUsers = () => {
  const queryClient = useQueryClient();
  const [loadingUserId, setLoadingUserId] = useState(null);
  
  const { data: suggestedUsersData, isLoading } = useQuery({
    queryKey: ["mobileSuggestedUsers"],
    queryFn: () => getSuggestedUsers(1, 20), // Get more users for horizontal scroll
  });

  // Handle both old array format and new paginated format
  const suggestedUsers = Array.isArray(suggestedUsersData) 
    ? suggestedUsersData 
    : suggestedUsersData?.users || [];

  const { mutate: follow } = useMutation({
    mutationFn: (userId) => followUser(userId),
    onMutate: (userId) => {
      setLoadingUserId(userId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mobileSuggestedUsers"] });
      queryClient.invalidateQueries({ queryKey: ["suggestedUsers"] });
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
      setLoadingUserId(null);
      toast.success("Kullanıcı takip edildi");
    },
    onError: (error) => {
      toast.error(error.message);
      setLoadingUserId(null);
    },
  });

  if (isLoading || suggestedUsers.length === 0) {
    return null;
  }

  return (
    <div className="lg:hidden mb-4 w-full max-w-full overflow-hidden">
      <div className="py-3 w-full max-w-full">
        <h3 className="text-sm font-semibold text-base-content/80 mb-3 px-4">Kimi takip etmeli?</h3>
        <div className="overflow-x-auto scrollbar-hide w-full max-w-full" style={{ WebkitOverflowScrolling: 'touch' }}>
          <div className="flex gap-3 px-4 pb-1" style={{ width: 'max-content', display: 'inline-flex' }}>
            {suggestedUsers.map((user) => (
              <div
                key={user._id}
                className="flex-shrink-0 w-32 bg-base-200/50 rounded-xl p-3 border border-base-300/50"
              >
                <Link to={`/profile/${user.username}`} className="flex flex-col items-center">
                  <div className="avatar mb-2">
                    <div className="w-16 h-16 rounded-full ring-2 ring-base-300">
                      <img
                        src={user.profileImage || defaultProfilePicture}
                        className="w-full h-full rounded-full object-cover"
                        alt={user.fullname}
                      />
                    </div>
                  </div>
                  <div className="text-center w-full mb-2">
                    <p className="text-xs font-semibold truncate">{user.fullname}</p>
                    <p className="text-xs text-base-content/60 truncate">@{user.username}</p>
                  </div>
                  <button
                    className="btn btn-primary btn-xs w-full rounded-full text-white"
                    onClick={(e) => {
                      e.preventDefault();
                      follow(user._id);
                    }}
                    disabled={loadingUserId === user._id}
                  >
                    {loadingUserId === user._id ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      "Takip et"
                    )}
                  </button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileSuggestedUsers;
