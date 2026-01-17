import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { LuPin } from "react-icons/lu";
import { BiRepost } from "react-icons/bi";
import LoadingSpinner from "../common/LoadingSpinner";
import defaultProfilePicture from "../../assets/avatar-placeholder.png";
import { formatPostDate } from "../../utils/date";
import DeletePostDialog from "../modals/DeletePostDialog";
import EditPostDialog from "../modals/EditPostDialog";
import PostImageModal from "../modals/PostImageModal";
import PostImageViewer from "../modals/PostImageViewer";
import PostOptions from "../PostOptions";
import PostActions from "./PostActions";
import usePostCache from "../../hooks/usePostCache";
import usePostActions from "../../hooks/usePostActions";
import MentionText from "./MentionText";

const Post = ({ post, isHidden = false }) => {
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const navigate = useNavigate();
  const { data: authUser, isLoading } = useQuery({ queryKey: ["authUser"] });

  // Get updated post from cache
  const updatedPost = usePostCache(post);

  // Post actions (like, save, delete, hide, unhide, pin)
  const {
    likePost,
    savePost,
    deletePost,
    hidePost,
    unhidePost,
    pinPost,
    isDeleting,
    isHiding,
    isUnhiding,
    isPinning,
  } = usePostActions(updatedPost._id, updatedPost);


  // Determine if this is a retweet or quote retweet
  const isRetweet = updatedPost?.originalPost;
  const originalPost = isRetweet ? updatedPost.originalPost : updatedPost;
  const postOwner = isRetweet ? originalPost?.user : updatedPost?.user;
  const retweetedBy = isRetweet ? updatedPost?.user : null;
  
  // Check if current user retweeted the original post
  const isRetweeted = authUser?._id ? originalPost?.retweetedBy?.some(
    (user) => {
      const userId = typeof user === 'object' ? user._id : user;
      return userId === authUser._id;
    }
  ) : false;
  
  const isLiked = authUser?._id ? updatedPost.likes.includes(authUser._id) : false;
  const isSaved = authUser?._id ? updatedPost.saves.includes(authUser._id) : false;

  const isMyPost = authUser?._id === updatedPost.user?._id;
  
  // Get retweet text
  const getRetweetText = () => {
    if (!isRetweet || !retweetedBy) return null;
    
    if (retweetedBy._id === authUser?._id) {
      return "Yeniden gönderdin";
    } else {
      return `${retweetedBy.fullname || retweetedBy.username} yeniden gönderdi`;
    }
  };

  const formattedDate = formatPostDate(updatedPost.createdAt);

  const theme = localStorage.getItem("theme");

  const handleDeletePost = () => {
    deletePost();
  };

  const handleEditPost = () => {
    setShowEditDialog(true);
    const openModal = () => {
      const modal = document.getElementById(`edit_post_modal_${updatedPost._id}`);
      if (modal && typeof modal.showModal === 'function') {
        modal.showModal();
      } else if (modal) {
        // If showModal is not yet overridden, wait a bit and try again
        setTimeout(openModal, 50);
      } else {
        // If modal element doesn't exist, wait a bit and try again
        setTimeout(openModal, 50);
      }
    };
    openModal();
  };

  const handleCloseEditDialog = () => {
    setShowEditDialog(false);
    // Don't call modalElement.close() here to avoid infinite loop
    // The EditPostDialog component handles its own state
  };

  const handleOptions = (e) => {
    e.stopPropagation();
  };

  const handleLikePost = (e) => {
    e.stopPropagation();
    likePost();
  };

  const handleSavePost = (e) => {
    e.stopPropagation();
    savePost();
  };


  // Retweet is now handled in PostActions component

  const handleProfileClick = (e) => {
    e.stopPropagation();
  };

  const handleImageClick = (e) => {
    e.stopPropagation();
    e.preventDefault();
    setShowImageModal(true);
  };

  const closeImageModal = () => {
    setShowImageModal(false);
  };

  const handlePostClick = (e) => {
    e.stopPropagation();
    navigate(`/post/${updatedPost._id}`);
  };

  if (isLoading) return <LoadingSpinner size="md" />;

  return (
    <>
      {/* Post Body */}
      <div
        className="flex gap-3 items-start p-5 border-b border-base-300/50 hover:bg-base-200/30 transition-all duration-300 group fade-in"
      >
        <div className="avatar flex-shrink-0">
          {postOwner ? (
            <Link
              to={`/profile/${postOwner.username}`}
              className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-base-300"
              onClick={handleProfileClick}
            >
              <img 
                src={postOwner.profileImage || defaultProfilePicture}
                alt={postOwner.fullname || "Kullanıcı"}
                className="w-full h-full object-cover"
              />
            </Link>
          ) : (
            <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-base-300">
              <img 
                src={defaultProfilePicture}
                alt="Silinmiş Kullanıcı"
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </div>
        <div className="flex flex-col flex-1 min-w-0">
          {/* Retweet Badge */}
          {isRetweet && retweetedBy && (
            <div className="flex items-center gap-1 mb-1 text-xs text-base-content/60">
              <BiRepost className="w-3 h-3" />
              <span>{getRetweetText()}</span>
            </div>
          )}
          {/* Pinned Badge */}
          {updatedPost?.isPinned && (
            <div className="flex items-center gap-1 mb-1 text-xs text-base-content/60">
              <LuPin className="w-3 h-3" />
              <span>Başa sabitlendi</span>
            </div>
          )}
          <div className="flex gap-2 items-center mb-1">
            {postOwner ? (
              <>
                <Link
                  to={`/profile/${postOwner.username}`}
                  className="font-semibold text-sm md:text-base truncate hover:text-primary transition-colors"
                  onClick={handleProfileClick}
                >
                  {postOwner.fullname || "Kullanıcı"}
                </Link>
                <span className="text-base-content/60 flex gap-1 text-xs md:text-sm">
                  <Link 
                    to={`/profile/${postOwner.username}`}
                    className="hover:text-primary transition-colors"
                    onClick={handleProfileClick}
                  >
                    @{postOwner.username}
                  </Link>
                  <span>·</span>
                  <span className="text-base-content/50">{formattedDate}</span>
                </span>
              </>
            ) : (
              <>
                <span className="font-semibold text-sm md:text-base truncate">Silinmiş Kullanıcı</span>
                <span className="text-base-content/60 flex gap-1 text-xs md:text-sm">
                  <span>·</span>
                  <span className="text-base-content/50">{formattedDate}</span>
                </span>
              </>
            )}
            <div
              className="flex flex-1 justify-end w-12"
              onClick={handleOptions}
            >
              <PostOptions
                post={updatedPost}
                postOwner={postOwner}
                isMyPost={isMyPost}
                isHidden={isHidden}
                isDeleting={isDeleting}
                isHiding={isHiding}
                isUnhiding={isUnhiding}
                isPinning={isPinning}
                onDelete={() => setShowDeleteDialog(true)}
                onEdit={handleEditPost}
                onHide={hidePost}
                onUnhide={unhidePost}
                onPin={pinPost}
                theme={theme}
              />
            </div>
          </div>
          {/* Post Content */}
          <div className="flex flex-col gap-3 overflow-hidden mt-2">
            {/* Quote retweet text - show first if quote retweet */}
            {isRetweet && updatedPost.isQuoteRetweet && (
              <>
                {updatedPost.text && (
                  <p 
                    className="text-sm md:text-base leading-relaxed cursor-pointer"
                    onClick={handlePostClick}
                  >
                    <MentionText text={updatedPost.text} />
                  </p>
                )}
                {updatedPost.img && (
                  <img
                    src={updatedPost.img}
                    alt=""
                    className="w-full max-h-96 object-cover rounded-xl cursor-pointer"
                    onClick={handlePostClick}
                  />
                )}
              </>
            )}
            {/* If quote retweet, show original post preview below quote text */}
            {isRetweet && updatedPost.isQuoteRetweet && originalPost && (
              <div className="p-3 border border-base-300/50 rounded-xl bg-base-200/30">
                <div className="flex gap-2 items-center mb-2">
                  <span className="text-xs font-semibold">
                    {originalPost.user?.fullname || "Kullanıcı"}
                  </span>
                  <span className="text-xs text-base-content/60">
                    @{originalPost.user?.username || "kullanici"}
                  </span>
                </div>
                {originalPost.text && (
                  <p className="text-sm mb-2">{originalPost.text}</p>
                )}
                {originalPost.img && (
                  <img
                    src={originalPost.img}
                    alt=""
                    className="w-full max-h-48 object-cover rounded-lg"
                  />
                )}
              </div>
            )}
            {/* Direct retweet or regular post text */}
            {isRetweet && !updatedPost.isQuoteRetweet ? (
              // Direct retweet - show original post text
              <p 
                className="text-sm md:text-base leading-relaxed cursor-pointer"
                onClick={handlePostClick}
              >
                <MentionText text={originalPost?.text || ""} />
              </p>
            ) : !isRetweet ? (
              // Regular post
              <p 
                className="text-sm md:text-base leading-relaxed cursor-pointer"
                onClick={handlePostClick}
              >
                <MentionText text={updatedPost.text} />
              </p>
            ) : null}
            {(isRetweet && !updatedPost.isQuoteRetweet ? originalPost?.img : updatedPost.img) && (
              <div 
                className="post-image-container rounded-2xl overflow-hidden border border-base-300/50 hover:border-base-300 transition-all duration-300 group/image"
                onClick={handleImageClick}
              >
                <img
                  src={isRetweet ? originalPost?.img : updatedPost.img}
                  className="w-full max-h-[300px] object-cover cursor-pointer hover:scale-[1.02] transition-transform duration-500"
                  alt=""
                  draggable="false"
                />
              </div>
            )}
          </div>
          {/* Post Actions */}
          <PostActions
            post={isRetweet ? originalPost : updatedPost}
            isLiked={isLiked}
            isSaved={isSaved}
            isRetweeted={isRetweeted}
            isLiking={false}
            isSaving={false}
            onLike={handleLikePost}
            onSave={handleSavePost}
            onComment={handlePostClick}
            showCounts={true}
            variant="compact"
          />
        </div>
      </div>

      {/* Image Viewer */}
      <PostImageViewer 
        imageUrl={updatedPost.img}
        isOpen={showImageModal}
        onClose={closeImageModal}
      />
      
      <PostImageModal post={updatedPost} />

      {/* Delete Post Modal */}
      <DeletePostDialog 
        modalId={`delete_modal_${updatedPost._id}`}
        handleDeletePost={handleDeletePost}
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
      />

      {/* Edit Post Modal */}
      {showEditDialog && (
        <EditPostDialog 
          post={updatedPost} 
          onClose={handleCloseEditDialog}
          modalId={`edit_post_modal_${post._id}`}
        />
      )}

    </>
  );
};

export default Post;