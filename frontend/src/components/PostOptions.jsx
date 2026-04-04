import { useState, useRef } from "react";
import { HiDotsHorizontal } from "react-icons/hi";
import { useAuth } from "../contexts/AuthContext";
import useFollow from "../hooks/useFollow";
import { useBlockPostAuthor } from "../hooks/useBlockPostAuthor";
import { useOpenModalAfterDropdownBlur } from "../hooks/useOpenModalAfterDropdownBlur";
import ShareModal from "./modals/ShareModal";
import BlockUserDialog from "./modals/BlockUserDialog";
import PostOptionsMenu from "./postOptions/PostOptionsMenu";
import { isAuthUserFollowing } from "../utils/followingUtils";

const stop = (e) => {
  e.preventDefault();
  e.stopPropagation();
};

const PostOptions = ({
  post,
  postOwner,
  isMyPost,
  isHidden,
  isDeleting,
  isHiding,
  isUnhiding,
  isPinning,
  onEdit,
  onDelete,
  onHide,
  onUnhide,
  onPin,
  theme,
}) => {
  const { authUser } = useAuth();
  const { follow, unfollow, isPending: followPending } = useFollow(postOwner._id);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showBlockDialog, setShowBlockDialog] = useState(false);
  const dropdownTriggerRef = useRef(null);
  const openModalAfterBlur = useOpenModalAfterDropdownBlur(dropdownTriggerRef);
  const { blockAuthor, isBlocking } = useBlockPostAuthor(postOwner._id);

  const amIFollowing = isAuthUserFollowing(authUser, postOwner._id);

  const handleShareClick = (e) => {
    stop(e);
    openModalAfterBlur(setShowShareModal);
  };

  const handleBlockClick = (e) => {
    stop(e);
    openModalAfterBlur(setShowBlockDialog);
  };

  const handleBlockConfirm = async () => {
    const ok = await blockAuthor();
    if (ok) setShowBlockDialog(false);
  };

  return (
    <div className="flex w-12 flex-1 justify-end">
      <div className="dropdown dropdown-left">
        <button
          type="button"
          ref={dropdownTriggerRef}
          tabIndex={0}
          className="btn btn-ghost btn-sm btn-circle min-h-0 h-auto w-auto border-0 p-0"
          aria-label="Gönderi seçenekleri"
          aria-haspopup="menu"
        >
          <HiDotsHorizontal className="size-5 rounded-full hover:opacity-80" />
        </button>
        <PostOptionsMenu
          theme={theme}
          post={post}
          postOwner={postOwner}
          isMyPost={isMyPost}
          isHidden={isHidden}
          isDeleting={isDeleting}
          isHiding={isHiding}
          isUnhiding={isUnhiding}
          isPinning={isPinning}
          amIFollowing={amIFollowing}
          followPending={followPending}
          follow={follow}
          unfollow={unfollow}
          onShare={handleShareClick}
          onUnhide={onUnhide}
          onDelete={onDelete}
          onEdit={onEdit}
          onPin={onPin}
          onHide={onHide}
          onBlock={handleBlockClick}
        />
      </div>

      <ShareModal
        post={post}
        postOwner={postOwner}
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
      />

      {!isMyPost && (
        <BlockUserDialog
          isOpen={showBlockDialog}
          onClose={() => setShowBlockDialog(false)}
          onConfirm={handleBlockConfirm}
          userName={postOwner.username}
          isBlocking={isBlocking}
        />
      )}
    </div>
  );
};

export default PostOptions;
