import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useRef } from "react";
import toast from "react-hot-toast";
import { LuPin } from "react-icons/lu";
import { FaHeart, FaRegComment } from "react-icons/fa";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import defaultProfilePicture from "../../assets/avatar-placeholder.png";
import { formatPostDate } from "../../utils/date";
import { IoArrowBack } from "react-icons/io5";
import PostImageModal from "../../components/modals/PostImageModal";
import DeletePostDialog from "../../components/modals/DeletePostDialog";
import EditPostDialog from "../../components/modals/EditPostDialog";
import PostOptions from "../../components/PostOptions";
import CommentOptions from "../../components/CommentOptions";
import CommentItem from "../../components/CommentItem";
import PostActions from "../../components/common/PostActions";
import { getSinglePost, likeComment, replyToComment, deleteComment, editComment } from "../../api/posts";
import usePostDetailActions from "../../hooks/usePostDetailActions";
import useMention from "../../hooks/useMention";
import MentionDropdown from "../../components/common/MentionDropdown";
import MentionText from "../../components/common/MentionText";

const PostDetailPage = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [comment, setComment] = useState("");
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [editingComment, setEditingComment] = useState(null);
  const [replyTexts, setReplyTexts] = useState({});
  const [deletingCommentId, setDeletingCommentId] = useState(null);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const commentTextareaRef = useRef(null);
  const replyTextareaRefs = useRef({});

  // Mention functionality for comments
  const {
    showMentionDropdown,
    mentionQuery,
    mentionPosition,
    handleTextChange: handleCommentTextChange,
    handleSelectUser,
    closeMentionDropdown,
  } = useMention(comment, setComment, commentTextareaRef);

  const { data: authUser, isLoading: isAuthLoading } = useQuery({
    queryKey: ["authUser"],
  });

  // Fetch single post
  const { data: post, isLoading: isPostLoading } = useQuery({
    queryKey: ["post", postId],
    queryFn: () => getSinglePost(postId),
    enabled: !!postId,
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });

  // Post actions (like, save, delete, comment, pin)
  const {
    likePost,
    savePost,
    deletePost,
    commentPost,
    pinPost,
    isDeleting,
    isCommenting,
    isPinning,
  } = usePostDetailActions(postId);

  // Handle delete with navigation
  const handleDeletePost = () => {
    deletePost();
    toast.success("Gönderi silindi.");
    navigate("/");
  };

  // Comment like mutation
  const likeCommentMutation = useMutation({
    mutationFn: ({ postId, commentId }) => likeComment(postId, commentId),
    onSuccess: (data) => {
      queryClient.setQueryData(["post", postId], data);
    },
    onError: (error) => {
      toast.error(error.message || "Bir hata oluştu.");
    },
  });

  // Reply to comment mutation
  const replyToCommentMutation = useMutation({
    mutationFn: ({ postId, commentId, replyText }) => replyToComment(postId, commentId, replyText),
    onSuccess: (data) => {
      queryClient.setQueryData(["post", postId], data);
      setReplyingTo(null);
      setReplyTexts(prev => ({ ...prev, [commentId]: "" }));
      toast.success("Yanıt gönderildi.");
    },
    onError: (error) => {
      toast.error(error.message || "Bir hata oluştu.");
    },
  });

  // Delete comment mutation
  const deleteCommentMutation = useMutation({
    mutationFn: ({ postId, commentId }) => deleteComment(postId, commentId),
    onMutate: ({ commentId }) => {
      setDeletingCommentId(commentId);
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["post", postId], data);
      setDeletingCommentId(null);
      toast.success("Yorum silindi.");
    },
    onError: (error) => {
      toast.error(error.message || "Bir hata oluştu.");
      setDeletingCommentId(null);
    },
  });

  // Edit comment mutation
  const editCommentMutation = useMutation({
    mutationFn: ({ postId, commentId, commentText }) => editComment(postId, commentId, commentText),
    onMutate: ({ commentId }) => {
      setEditingCommentId(commentId);
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["post", postId], data);
      setEditingCommentId(null);
      setEditingComment(null);
      toast.success("Yorum güncellendi.");
    },
    onError: (error) => {
      toast.error(error.message || "Bir hata oluştu.");
      setEditingCommentId(null);
    },
  });

  // Handle comment submission
  const handlePostComment = (e) => {
    e.preventDefault();
    if (isCommenting || !comment.trim()) return;
    commentPost(comment);
    setComment("");
  };

  if (isAuthLoading || isPostLoading) {
    return (
      <div className="w-full flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="w-full flex flex-col items-center justify-center min-h-screen">
        <p className="text-xl mb-4">Gönderi bulunamadı</p>
        <button onClick={() => navigate("/")} className="btn btn-primary">
          Ana Sayfaya Dön
        </button>
      </div>
    );
  }

  const postOwner = post?.user;
  const isLiked = post.likes.includes(authUser?._id);
  const isSaved = post.saves.includes(authUser?._id);
  const isMyPost = authUser?._id === post.user?._id;
  const formattedDate = formatPostDate(post.createdAt);
  const theme = localStorage.getItem("theme");

  // Comment handlers
  const handleLikeComment = (commentId, e) => {
    e.stopPropagation();
    likeCommentMutation.mutate({ postId, commentId });
  };

  const handleReplyToComment = (commentId, e) => {
    e.stopPropagation();
    setReplyingTo(commentId);
  };

  const handleSubmitReply = (commentId, e) => {
    e.preventDefault();
    e.stopPropagation();
    const replyText = replyTexts[commentId] || "";
    if (!replyText.trim()) return;
    replyToCommentMutation.mutate({ postId, commentId, replyText });
  };

  const handleDeleteComment = (commentId) => {
    deleteCommentMutation.mutate({ postId, commentId });
  };

  const handleEditComment = (commentItem) => {
    setEditingComment({ ...commentItem, text: commentItem.text });
    setEditingCommentId(commentItem._id);
  };

  const handleUpdateEditingComment = (updatedComment) => {
    setEditingComment(updatedComment);
  };

  const handleSubmitEditComment = (commentId, e) => {
    e.preventDefault();
    e.stopPropagation();
    const commentText = editingComment?.text || "";
    if (!commentText.trim()) return;
    editCommentMutation.mutate({ postId, commentId, commentText });
  };

  const handleCancelEdit = () => {
    setEditingComment(null);
    setEditingCommentId(null);
  };

  const handleEditPost = () => {
    setShowEditDialog(true);
    document.getElementById(`edit_post_modal_${post._id}`).showModal();
  };

  const handleCloseEditDialog = () => {
    setShowEditDialog(false);
    document.getElementById(`edit_post_modal_${post._id}`).close();
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

  const handleProfileClick = (e) => {
    e.stopPropagation();
  };

  const handleImageClick = (e) => {
    e.stopPropagation();
    e.preventDefault();
    setShowImageModal(true);
  };

  const handleImageTouch = (e) => {
    e.stopPropagation();
    e.preventDefault();
    setShowImageModal(true);
  };

  const closeImageModal = () => {
    setShowImageModal(false);
  };

  return (
    <div className="w-full min-h-screen pb-20 lg:pb-0">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-base-100/95 backdrop-blur-xl border-b border-base-300/50 px-5 py-4 flex items-center gap-4 shadow-sm">
        <button
          onClick={() => navigate(-1)}
          className="btn btn-ghost btn-sm btn-circle hover:bg-base-200 transition-all duration-200 hover:scale-110"
        >
          <IoArrowBack className="w-5 h-5" />
        </button>
        <h2 className="font-bold text-xl">Gönderi</h2>
      </div>

      {/* Post Content */}
      <div className="border-b border-base-300/50">
        <div className="flex gap-4 items-start p-5">
          {postOwner ? (
            <Link
              to={`/profile/${postOwner.username}`}
              className="avatar flex-shrink-0"
              onClick={handleProfileClick}
            >
              <div className="w-12 h-12 rounded-full overflow-hidden ring-2 ring-base-300 hover:ring-primary transition-all duration-300">
                <img
                  src={postOwner.profileImage || defaultProfilePicture}
                  alt={postOwner.fullname || "Kullanıcı"}
                  className="w-full h-full object-cover"
                />
              </div>
            </Link>
          ) : (
            <div className="avatar flex-shrink-0">
              <div className="w-12 h-12 rounded-full overflow-hidden ring-2 ring-base-300">
                <img
                  src={defaultProfilePicture}
                  alt="Silinmiş Kullanıcı"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )}
          <div className="flex flex-col flex-1 min-w-0">
            {/* Pinned Badge */}
            {post?.isPinned && (
              <div className="flex items-center gap-1 mb-1 text-xs text-base-content/60">
                <LuPin className="w-3 h-3" />
                <span>Başa sabitlendi</span>
              </div>
            )}
            <div className="flex items-start gap-2 mb-1 flex-wrap">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                {postOwner ? (
                  <>
                    <Link
                      to={`/profile/${postOwner.username}`}
                      className="font-bold hover:underline truncate"
                      onClick={handleProfileClick}
                    >
                      {postOwner.fullname || "Kullanıcı"}
                    </Link>
                    <span className="text-base-content/60 text-sm whitespace-nowrap flex-shrink-0">
                      <Link
                        to={`/profile/${postOwner.username}`}
                        className="hover:underline"
                        onClick={handleProfileClick}
                      >
                        @{postOwner.username}
                      </Link>
                      <span className="mx-1">·</span>
                      <span>{formattedDate}</span>
                    </span>
                  </>
                ) : (
                  <>
                    <span className="font-bold truncate">Silinmiş Kullanıcı</span>
                    <span className="text-base-content/60 text-sm whitespace-nowrap flex-shrink-0">
                      <span className="mx-1">·</span>
                      <span>{formattedDate}</span>
                    </span>
                  </>
                )}
              </div>
              <div
                className="flex flex-shrink-0"
                onClick={handleOptions}
              >
                <PostOptions
                  post={post}
                  postOwner={postOwner}
                  isMyPost={isMyPost}
                  isHidden={false}
                  isDeleting={isDeleting}
                  isHiding={false}
                  isUnhiding={false}
                  isPinning={isPinning}
                  onEdit={handleEditPost}
                  onHide={() => {}}
                  onUnhide={() => {}}
                  onPin={pinPost}
                  theme={theme}
                />
              </div>
            </div>
            <p className="text-base-content text-[15px] leading-relaxed mb-3">
              <MentionText text={post.text} />
            </p>
            {post.img && (
              <div 
                className="rounded-2xl overflow-hidden border border-base-300/50 mb-4 hover:border-base-300 transition-all duration-300 group/image"
                onClick={handleImageClick}
                onTouchStart={handleImageTouch}
                onTouchEnd={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                }}
                style={{ touchAction: 'manipulation' }}
              >
                <img
                  src={post.img}
                  className="w-full max-h-[600px] object-contain cursor-pointer hover:scale-[1.01] transition-transform duration-500 pointer-events-none"
                  alt="Gönderi Resmi"
                />
              </div>
            )}

            {/* Action Buttons */}
            <PostActions
              post={post}
              isLiked={isLiked}
              isSaved={isSaved}
              isLiking={false}
              isSaving={false}
              onLike={handleLikePost}
              onSave={handleSavePost}
              onComment={() => {}}
              onRepost={() => {}}
              showCounts={true}
            />
          </div>
        </div>
      </div>

      {/* Comment Input */}
      <div className="sticky bottom-0 bg-base-100/95 backdrop-blur-xl border-t border-base-300/50 p-5 shadow-lg">
        <form onSubmit={handlePostComment} className="flex gap-3 items-end">
          <div className="avatar flex-shrink-0">
            <div className="w-10 h-10 rounded-full ring-2 ring-base-300">
              <img
                src={authUser?.profileImage || defaultProfilePicture}
                alt={authUser?.fullname}
                className="w-full h-full rounded-full object-cover"
              />
            </div>
          </div>
          <div className="flex-1 flex flex-col gap-2 relative">
            <textarea
              ref={commentTextareaRef}
              className="textarea textarea-bordered w-full min-h-[80px] max-h-32 resize-none rounded-2xl text-sm bg-base-200/50 border-base-300 focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-base-content/40"
              placeholder="Yorumunu yaz..."
              value={comment}
              onChange={handleCommentTextChange}
              rows={3}
            />
            <MentionDropdown
              show={showMentionDropdown}
              position={mentionPosition}
              searchQuery={mentionQuery}
              onSelectUser={handleSelectUser}
              onClose={closeMentionDropdown}
            />
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={!comment.trim() || isCommenting}
                className="btn btn-primary rounded-full px-6 btn-sm disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 transition-transform duration-200 shadow-md hover:shadow-lg"
              >
                {isCommenting ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    <span className="ml-2">Gönderiliyor...</span>
                  </>
                ) : (
                  "Yorum Yap"
                )}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Comments Section */}
      <div className="overflow-y-auto custom-scrollbar px-5" style={{ maxHeight: 'calc(100vh - 400px)' }}>
        {!post.comments || post.comments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center px-4">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center mb-4 shadow-lg">
              <span className="text-5xl">💬</span>
            </div>
            <p className="text-base-content/80 font-semibold text-lg mb-2">
              Henüz yorum yok
            </p>
            <p className="text-base-content/50 text-sm">
              İlk yorumu sen yap!
            </p>
          </div>
        ) : (
          <div className="divide-y divide-base-300/50">
            {post.comments?.map((commentItem) => {
              // Skip comments with null user
              if (!commentItem.user) return null;
              
              const isMyComment = authUser?._id === commentItem.user?._id;
              const isPostOwner = authUser?._id === post.user?._id;
              const isLiked = commentItem.likes?.some(
                (id) => id?._id === authUser?._id || id === authUser?._id
              ) || false;
              const isEditing = editingCommentId === commentItem._id;
              const isDeleting = deletingCommentId === commentItem._id;
              const isReplying = replyingTo === commentItem._id;
              
              return (
                <CommentItem
                  key={commentItem._id}
                  commentItem={commentItem}
                  authUser={authUser}
                  post={post}
                  postOwner={postOwner}
                  isMyComment={isMyComment}
                  isPostOwner={isPostOwner}
                  isLiked={isLiked}
                  isEditing={isEditing}
                  isDeleting={isDeleting}
                  isReplying={isReplying}
                  editingComment={editingComment}
                  replyText={replyTexts[commentItem._id] || ""}
                  onLike={(e) => handleLikeComment(commentItem._id, e)}
                  onReply={(e) => handleReplyToComment(commentItem._id, e)}
                  onEdit={handleUpdateEditingComment}
                  onDelete={() => handleDeleteComment(commentItem._id)}
                  onStartEdit={() => handleEditComment(commentItem)}
                  onSubmitEdit={(e) => handleSubmitEditComment(commentItem._id, e)}
                  onSubmitReply={(e) => handleSubmitReply(commentItem._id, e)}
                  onCancelEdit={handleCancelEdit}
                  onCancelReply={() => {
                    setReplyingTo(null);
                    setReplyTexts(prev => ({ ...prev, [commentItem._id]: "" }));
                  }}
                  onReplyTextChange={(text) => setReplyTexts(prev => ({ ...prev, [commentItem._id]: text }))}
                  replyTextareaRef={(el) => {
                    if (el) replyTextareaRefs.current[commentItem._id] = el;
                  }}
                  theme={theme}
                  defaultProfilePicture={defaultProfilePicture}
                  editCommentMutation={editCommentMutation}
                  replyToCommentMutation={replyToCommentMutation}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Image Modal */}
      {showImageModal && (
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={closeImageModal}
          style={{ touchAction: 'manipulation' }}
        >
          <div 
            className="relative max-w-screen-sm w-full p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeImageModal}
              className="absolute top-2 right-2 z-10 btn btn-sm btn-circle btn-ghost bg-black/50 text-white hover:bg-black/70"
            >
              ✕
            </button>
            <img 
              src={post.img} 
              className="w-full h-auto object-contain rounded-lg" 
              alt="Gönderi Resmi"
              style={{ maxHeight: '90vh' }}
              draggable="false"
            />
          </div>
        </div>
      )}
      <PostImageModal post={post} />
      <DeletePostDialog
        modalId={`delete_modal_${post._id}`}
        handleDeletePost={handleDeletePost}
      />
      {showEditDialog && (
        <EditPostDialog
          post={post}
          onClose={handleCloseEditDialog}
          modalId={`edit_post_modal_${post._id}`}
        />
      )}
    </div>
  );
};

export default PostDetailPage;
