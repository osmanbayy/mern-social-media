import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getBlockedUsers, unblockUser } from "../../api/users";
import LoadingSpinner from "../common/LoadingSpinner";
import defaultProfilePicture from "../../assets/avatar-placeholder.png";
import UnblockUserDialog from "../modals/UnblockUserDialog";
import { useState } from "react";
import { Link } from "react-router-dom";
import { LuBan } from "react-icons/lu";
import { invalidateBlockedAndFeed } from "../../utils/queryInvalidation";

const BlockedAccounts = () => {
  const [showUnblockDialog, setShowUnblockDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isUnblocking, setIsUnblocking] = useState(false);
  const queryClient = useQueryClient();

  const { data: blockedUsers, isLoading } = useQuery({
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
      await invalidateBlockedAndFeed(queryClient);
      setShowUnblockDialog(false);
      setSelectedUser(null);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("Error unblocking user:", error);
      }
    } finally {
      setIsUnblocking(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {!blockedUsers || blockedUsers.length === 0 ? (
        <div className="rounded-3xl border border-base-300/55 bg-gradient-to-b from-base-100 to-base-200/20 px-6 py-14 text-center shadow-lg ring-1 ring-black/5 dark:to-base-300/15">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-base-200/80 text-base-content/35">
            <LuBan className="h-7 w-7" strokeWidth={1.5} />
          </div>
          <p className="font-semibold text-base-content">Engellenen hesap yok</p>
          <p className="mx-auto mt-2 max-w-sm text-sm text-base-content/55">
            Engellediğin kullanıcılar burada listelenir; profilden engel kaldırabilirsin.
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {blockedUsers.map((user) => (
            <li
              key={user._id}
              className="flex items-center gap-4 rounded-2xl border border-base-300/45 bg-base-100/80 p-4 shadow-sm transition hover:border-accent/20 hover:shadow-md"
            >
              <Link to={`/profile/${user.username}`} className="flex min-w-0 flex-1 items-center gap-3">
                <div className="avatar shrink-0">
                  <div className="h-12 w-12 rounded-full ring-2 ring-base-300/80">
                    <img
                      src={user.profileImage || defaultProfilePicture}
                      className="h-full w-full rounded-full object-cover"
                      alt=""
                    />
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-base-content">{user.fullname}</p>
                  <p className="truncate text-sm text-base-content/50">@{user.username}</p>
                </div>
              </Link>
              <button
                type="button"
                onClick={() => handleUnblockClick(user)}
                className="btn btn-outline btn-accent btn-sm shrink-0 rounded-full font-semibold"
                disabled={isUnblocking}
              >
                Engeli kaldır
              </button>
            </li>
          ))}
        </ul>
      )}

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
