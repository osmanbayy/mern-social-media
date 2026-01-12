import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import toast from "react-hot-toast";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import defaultProfilePicture from "../../assets/avatar-placeholder.png";
import { formatPostDate } from "../../utils/date";
import { IoArrowBack } from "react-icons/io5";
import PostImageModal from "../../components/modals/PostImageModal";
import DeletePostDialog from "../../components/modals/DeletePostDialog";
import EditPostDialog from "../../components/modals/EditPostDialog";
import PostOptions from "../../components/PostOptions";
import PostActions from "../../components/common/PostActions";
import { getSinglePost, deletePost as deletePostAPI, likePost as likePostAPI, savePost as savePostAPI, commentPost as commentPostAPI } from "../../api/posts";

const PostDetailPage = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const [comment, setComment] = useState("");
  const [showEditDialog, setShowEditDialog] = useState(false);
  const queryClient = useQueryClient();

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

  // Delete post mutation
  const { mutate: deletePost, isPending: isDeleting } = useMutation({
    mutationFn: () => deletePostAPI(postId),
    onSuccess: () => {
      toast.success("Gönderi silindi.");
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      navigate("/");
    },
  });

  // Like post mutation with optimistic update
  const { mutate: likePost } = useMutation({
    mutationFn: () => likePostAPI(postId),
    onMutate: async () => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["post", postId] });
      await queryClient.cancelQueries({ queryKey: ["posts"] });

      // Snapshot previous values
      const previousPost = queryClient.getQueryData(["post", postId]);
      const previousPosts = queryClient.getQueryData(["posts"]);

      // Optimistically update single post
      queryClient.setQueryData(["post", postId], (oldPost) => {
        if (!oldPost) return oldPost;
        const isCurrentlyLiked = oldPost.likes.includes(authUser?._id);
        const newLikes = isCurrentlyLiked
          ? oldPost.likes.filter((id) => id.toString() !== authUser?._id.toString())
          : [...oldPost.likes, authUser?._id];
        return { ...oldPost, likes: newLikes };
      });

      // Optimistically update posts list
      queryClient.setQueryData(["posts"], (oldData) => {
        if (!oldData || !Array.isArray(oldData)) return oldData;
        return oldData.map((oldPost) => {
          if (oldPost._id === postId) {
            const isCurrentlyLiked = oldPost.likes.includes(authUser?._id);
            const newLikes = isCurrentlyLiked
              ? oldPost.likes.filter((id) => id.toString() !== authUser?._id.toString())
              : [...oldPost.likes, authUser?._id];
            return { ...oldPost, likes: newLikes };
          }
          return oldPost;
        });
      });

      return { previousPost, previousPosts };
    },
    onError: (error, variables, context) => {
      // Rollback on error
      if (context?.previousPost) {
        queryClient.setQueryData(["post", postId], context.previousPost);
      }
      if (context?.previousPosts) {
        queryClient.setQueryData(["posts"], context.previousPosts);
      }
      toast.error(error.message);
    },
    onSuccess: (updatedLikes) => {
      // Update cache with server response (optional, optimistic update already done)
      queryClient.setQueryData(["post", postId], (oldPost) => {
        if (!oldPost) return oldPost;
        return { ...oldPost, likes: updatedLikes };
      });
      queryClient.setQueryData(["posts"], (oldData) => {
        if (!oldData || !Array.isArray(oldData)) return oldData;
        return oldData.map((oldPost) => {
          if (oldPost._id === postId) {
            return { ...oldPost, likes: updatedLikes };
          }
          return oldPost;
        });
      });
    },
  });

  // Save post mutation with optimistic update
  const { mutate: savePost } = useMutation({
    mutationFn: () => savePostAPI(postId),
    onMutate: async () => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["post", postId] });
      await queryClient.cancelQueries({ queryKey: ["posts"] });

      // Snapshot previous values
      const previousPost = queryClient.getQueryData(["post", postId]);
      const previousPosts = queryClient.getQueryData(["posts"]);

      // Optimistically update single post
      queryClient.setQueryData(["post", postId], (oldPost) => {
        if (!oldPost) return oldPost;
        const isCurrentlySaved = oldPost.saves.includes(authUser?._id);
        const newSaves = isCurrentlySaved
          ? oldPost.saves.filter((id) => id.toString() !== authUser?._id.toString())
          : [...oldPost.saves, authUser?._id];
        return { ...oldPost, saves: newSaves };
      });

      // Optimistically update posts list
      queryClient.setQueryData(["posts"], (oldData) => {
        if (!oldData || !Array.isArray(oldData)) return oldData;
        return oldData.map((oldPost) => {
          if (oldPost._id === postId) {
            const isCurrentlySaved = oldPost.saves.includes(authUser?._id);
            const newSaves = isCurrentlySaved
              ? oldPost.saves.filter((id) => id.toString() !== authUser?._id.toString())
              : [...oldPost.saves, authUser?._id];
            return { ...oldPost, saves: newSaves };
          }
          return oldPost;
        });
      });

      return { previousPost, previousPosts };
    },
    onError: (error, variables, context) => {
      // Rollback on error
      if (context?.previousPost) {
        queryClient.setQueryData(["post", postId], context.previousPost);
      }
      if (context?.previousPosts) {
        queryClient.setQueryData(["posts"], context.previousPosts);
      }
      toast.error(error.message);
    },
    onSuccess: (updatedSaves) => {
      // Update cache with server response (optional, optimistic update already done)
      queryClient.setQueryData(["post", postId], (oldPost) => {
        if (!oldPost) return oldPost;
        return { ...oldPost, saves: updatedSaves };
      });
      queryClient.setQueryData(["posts"], (oldData) => {
        if (!oldData || !Array.isArray(oldData)) return oldData;
        return oldData.map((oldPost) => {
          if (oldPost._id === postId) {
            return { ...oldPost, saves: updatedSaves };
          }
          return oldPost;
        });
      });
    },
  });

  // Comment on post mutation
  const { mutate: commentPost, isPending: isCommenting } = useMutation({
    mutationFn: () => commentPostAPI(postId, comment),
    onSuccess: () => {
      setComment("");
      queryClient.invalidateQueries({ queryKey: ["post", postId] });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
    onError: (error) => {
      toast.error(error.message || "Yorum yapılırken bir hata oluştu.");
    },
  });

  if (isAuthLoading || isPostLoading) {
    return (
      <div className="flex-[4_4_0] flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="flex-[4_4_0] flex flex-col items-center justify-center min-h-screen">
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
  const isMyPost = authUser?._id === post.user._id;
  const formattedDate = formatPostDate(post.createdAt);
  const theme = localStorage.getItem("theme");

  const handleDeletePost = () => {
    deletePost();
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

  const handlePostComment = (e) => {
    e.preventDefault();
    if (isCommenting || !comment.trim()) return;
    commentPost();
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
    document.getElementById("image_modal" + post._id).showModal();
  };

  return (
    <div className="flex-[4_4_0] border-r border-gray-700 min-h-screen">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-base-100/95 backdrop-blur-sm border-b border-gray-700 px-4 py-3 flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="btn btn-ghost btn-sm btn-circle hover:bg-base-200"
        >
          <IoArrowBack className="w-5 h-5" />
        </button>
        <h2 className="font-bold text-xl">Gönderi</h2>
      </div>

      {/* Post Content */}
      <div className="border-b border-gray-700">
        <div className="flex gap-3 items-start p-4">
          <Link
            to={`/profile/${postOwner.username}`}
            className="avatar flex-shrink-0"
            onClick={handleProfileClick}
          >
            <div className="w-12 h-12 rounded-full overflow-hidden">
              <img
                src={postOwner.profileImage || defaultProfilePicture}
                alt={postOwner.fullname}
                className="w-full h-full object-cover"
              />
            </div>
          </Link>
          <div className="flex flex-col flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Link
                to={`/profile/${postOwner.username}`}
                className="font-bold hover:underline"
                onClick={handleProfileClick}
              >
                {postOwner.fullname}
              </Link>
              <span className="text-base-content/60 text-sm">
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
              <div
                className="flex flex-1 justify-end"
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
                  onEdit={handleEditPost}
                  onHide={() => {}}
                  onUnhide={() => {}}
                  theme={theme}
                />
              </div>
            </div>
            <p className="text-base-content text-[15px] leading-relaxed whitespace-pre-wrap break-words mb-3">
              {post.text}
            </p>
            {post.img && (
              <div className="rounded-2xl overflow-hidden border border-base-300 mb-3">
                <img
                  src={post.img}
                  className="w-full max-h-[600px] object-contain cursor-pointer hover:opacity-90 transition-opacity"
                  alt="Gönderi Resmi"
                  onClick={handleImageClick}
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
      <div className="border-b border-gray-700 p-4">
        <form onSubmit={handlePostComment} className="flex gap-3">
          <div className="avatar flex-shrink-0">
            <div className="w-10 h-10 rounded-full">
              <img
                src={authUser?.profileImage || defaultProfilePicture}
                alt={authUser?.fullname}
                className="w-full h-full rounded-full object-cover"
              />
            </div>
          </div>
          <div className="flex-1 flex flex-col gap-2">
            <textarea
              className="textarea textarea-bordered w-full min-h-[80px] max-h-32 resize-none rounded-2xl text-sm bg-base-200/50 border-base-300 focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-base-content/40"
              placeholder="Yorumunu yaz..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
            />
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={!comment.trim() || isCommenting}
                className="btn btn-primary rounded-full px-6 btn-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCommenting ? (
                  <>
                    <LoadingSpinner size="sm" />
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
      <div className="overflow-y-auto custom-scrollbar" style={{ maxHeight: 'calc(100vh - 400px)' }}>
        {!post.comments || post.comments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center px-4">
            <div className="w-20 h-20 rounded-full bg-base-200 flex items-center justify-center mb-4">
              <span className="text-4xl">💬</span>
            </div>
            <p className="text-base-content/70 font-semibold text-base mb-1">
              Henüz yorum yok
            </p>
            <p className="text-base-content/50 text-sm">
              İlk yorumu sen yap!
            </p>
          </div>
        ) : (
          <div className="divide-y divide-base-300">
            {post.comments?.map((commentItem) => (
              <div
                key={commentItem._id}
                className="flex gap-3 p-4 hover:bg-base-200/30 transition-colors"
              >
                <Link
                  to={`/profile/${commentItem.user.username}`}
                  className="avatar flex-shrink-0"
                >
                  <div className="w-10 h-10 rounded-full">
                    <img
                      src={commentItem.user.profileImage || defaultProfilePicture}
                      alt={commentItem.user.fullname}
                      className="w-full h-full rounded-full object-cover"
                    />
                  </div>
                </Link>
                <div className="flex flex-col flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Link
                      to={`/profile/${commentItem.user.username}`}
                      className="font-bold text-sm hover:underline"
                    >
                      {commentItem.user.fullname}
                    </Link>
                    <span className="text-base-content/50 text-xs">
                      @{commentItem.user.username}
                    </span>
                  </div>
                  <p className="text-base-content text-sm leading-relaxed whitespace-pre-wrap break-words">
                    {commentItem.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
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
