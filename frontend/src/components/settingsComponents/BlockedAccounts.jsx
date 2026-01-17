import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getBlockedUsers, unblockUser } from "../../api/users";
import LoadingSpinner from "../common/LoadingSpinner";
import defaultProfilePicture from "../../assets/avatar-placeholder.png";
import UnblockUserDialog from "../modals/UnblockUserDialog";
import { useState } from "react";
import { Link } from "react-router-dom";

const BlockedAccounts = () => {
  const [showUnblockDialog, setShowUnblockDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isUnblocking, setIsUnblocking] = useState(false);
  const queryClient = useQueryClient();

  const {
    data: blockedUsers,
    isLoading,
  } = useQuery({
    queryKey: ["blockedUsers"],
    queryFn: getBlockedUsers,
  });

  const handleUnblockClick = (user) => {
    setSelectedUser(user);
    setShowUnblockDialog(true);
  };

  const handleUnblockConfirm = async () => {
    if (!selectedUser?._id) return;

    setIsUnblocking(true);
    try {
      await unblockUser(selectedUser._id);
      queryClient.invalidateQueries({ queryKey: ["blockedUsers"] });
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      setShowUnblockDialog(false);
      setSelectedUser(null);
      // refetch() is not needed - invalidateQueries already triggers refetch
    } catch (error) {
      // Error is handled by the API layer and toast
      if (process.env.NODE_ENV === "development") {
        console.error("Error unblocking user:", error);
      }
    } finally {
      setIsUnblocking(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {!blockedUsers || blockedUsers.length === 0 ? (
        <div className="p-6 rounded-2xl bg-base-200/30 backdrop-blur-sm border border-base-300/50 text-center">
          <p className="text-base-content/70">Henüz engellenen hesap yok.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {blockedUsers.map((user) => (
            <div
              key={user._id}
              className="flex items-center gap-4 p-4 rounded-xl bg-base-200/30 backdrop-blur-sm border border-base-300/50 hover:bg-base-200/50 transition-all duration-200"
            >
              <Link
                to={`/profile/${user.username}`}
                className="flex items-center gap-3 flex-1 min-w-0"
              >
                <div className="avatar flex-shrink-0">
                  <div className="w-12 h-12 rounded-full ring-2 ring-base-300">
                    <img
                      src={user.profileImage || defaultProfilePicture}
                      className="w-full h-full rounded-full object-cover"
                      alt={user.fullname}
                    />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">
                    {user.fullname}
                  </p>
                  <p className="text-xs text-base-content/60 truncate">
                    @{user.username}
                  </p>
                </div>
              </Link>
              <button
                onClick={() => handleUnblockClick(user)}
                className="btn btn-sm btn-outline rounded-full flex-shrink-0"
                disabled={isUnblocking}
              >
                Engeli Kaldır
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Unblock User Dialog */}
      {selectedUser && (
        <UnblockUserDialog
          isOpen={showUnblockDialog}
          onClose={() => {
            setShowUnblockDialog(false);
            setSelectedUser(null);
          }}
          onConfirm={handleUnblockConfirm}
          userName={selectedUser.username}
          isUnblocking={isUnblocking}
        />
      )}
    </div>
  );
};

export default BlockedAccounts;
