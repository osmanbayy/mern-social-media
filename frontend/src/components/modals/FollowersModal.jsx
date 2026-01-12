import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import LoadingSpinner from "../common/LoadingSpinner";
import defaultProfilePicture from "../../assets/avatar-placeholder.png";
import { getFollowers } from "../../api/users";
import useFollow from "../../hooks/useFollow";

const FollowersModal = ({ user, isOpen, onClose }) => {
  const navigate = useNavigate();

  const {
    data: followers,
    isLoading: isFollowersLoading,
    refetch: refetchFollowers,
  } = useQuery({
    queryKey: ["followers", user?.username],
    queryFn: () => getFollowers(user?.username),
    enabled: isOpen && !!user?.username,
  });

  const { follow, isPending } = useFollow(user?._id);

  if (!user) return null;

  const handleUserClick = (username) => {
    document.getElementById(`followers_modal${user._id}`).close();
    navigate(`/profile/${username}`);
  };

  const handleFollowClick = (e, userId) => {
    e.preventDefault();
    e.stopPropagation();
    follow(userId);
    refetchFollowers();
  };

  return (
    <dialog
      id={`followers_modal${user._id}`}
      className="modal border-none outline-none backdrop:bg-black/50"
      onClose={onClose}
    >
      <div className="modal-box p-6 max-w-screen-sm flex flex-col gap-4 bg-base-100 shadow-2xl">
        <h3 className="font-bold text-xl mb-1">Takipçiler</h3>
        {isFollowersLoading && <LoadingSpinner size="lg" />}
        {!isFollowersLoading && followers?.length === 0 && (
          <p className="text-center text-base-content/60 py-8">
            Kimse tarafından takip edilmiyor.
          </p>
        )}
        {followers &&
          !isFollowersLoading &&
          followers.map((item, index) => (
            <div
              key={item._id}
              className="flex items-center justify-between w-full p-4 rounded-xl hover:bg-base-200/50 transition-all duration-200 fade-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div
                onClick={() => handleUserClick(item?.username)}
                className="w-full rounded-lg flex gap-4 items-center cursor-pointer group"
              >
                <div className="avatar flex-shrink-0">
                  <div className="w-14 h-14 rounded-full ring-2 ring-base-300 group-hover:ring-primary transition-all duration-300">
                    <img
                      src={item?.profileImage || defaultProfilePicture}
                      alt="profile"
                      className="w-full h-full rounded-full object-cover"
                    />
                  </div>
                </div>
                <div className="flex flex-col min-w-0 flex-1">
                  <p className="font-semibold text-base truncate group-hover:text-primary transition-colors">
                    {item?.fullname}
                  </p>
                  <p className="text-sm text-base-content/60 truncate">
                    @{item?.username}
                  </p>
                </div>
              </div>

              {item?._id !== user?._id && (
                <button
                  onClick={(e) => handleFollowClick(e, item._id)}
                  className="btn btn-sm btn-primary rounded-full flex-shrink-0 hover:scale-105 transition-all duration-200 shadow-md hover:shadow-lg font-medium"
                  disabled={isPending}
                >
                  {isPending ? (
                    <LoadingSpinner size="sm" />
                  ) : item?.followers?.includes(user?._id) ? (
                    "Takibi Bırak"
                  ) : (
                    "Takip Et"
                  )}
                </button>
              )}
            </div>
          ))}
      </div>
      <form method="dialog" className="modal-backdrop">
        <button className="outline-none">close</button>
      </form>
    </dialog>
  );
};

export default FollowersModal;
