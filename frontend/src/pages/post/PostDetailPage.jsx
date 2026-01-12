import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import toast from "react-hot-toast";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import defaultProfilePicture from "../../assets/avatar-placeholder.png";
import { formatPostDate } from "../../utils/date";
import { FaRegComment } from "react-icons/fa";
import { BiRepost } from "react-icons/bi";
import { IoMdBookmark } from "react-icons/io";
import { FaHeart } from "react-icons/fa6";
import { IoArrowBack } from "react-icons/io5";
import PostImageModal from "../../components/modals/PostImageModal";
import DeletePostDialog from "../../components/modals/DeletePostDialog";
import EditPostDialog from "../../components/modals/EditPostDialog";
import PostOptions from "../../components/PostOptions";

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
    queryFn: async () => {
      try {
        // Add timestamp to bypass cache
        const timestamp = new Date().getTime();
        const response = await fetch(`/api/post/${postId}?t=${timestamp}`, {
          credentials: "include",
          cache: "no-store",
          headers: {
            "Cache-Control": "no-cache, no-store, must-revalidate",
            "Pragma": "no-cache",
            "Expires": "0",
            "Accept": "application/json",
          },
        });
        
        // Check if response is HTML (error page)
        const contentType = response.headers.get("content-type");
        if (contentType && !contentType.includes("application/json")) {
          const text = await response.text();
          console.error("Non-JSON response:", text.substring(0, 200));
          throw new Error("Sunucu hatası: JSON beklenirken HTML döndü.");
        }
        
        if (response.status === 304) {
          // If 304, force a fresh request
          const freshResponse = await fetch(`/api/post/${postId}?t=${new Date().getTime()}`, {
            credentials: "include",
            cache: "reload",
            headers: {
              "Accept": "application/json",
            },
          });
          const data = await freshResponse.json();
          if (!freshResponse.ok) {
            throw new Error(data.message || "Gönderi bulunamadı.");
          }
          return data;
        }
        
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || "Gönderi bulunamadı.");
        }
        return data;
      } catch (error) {
        throw new Error(error.message);
      }
    },
    enabled: !!postId,
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });

  // Delete post mutation
  const { mutate: deletePost, isPending: isDeleting } = useMutation({
    mutationFn: async () => {
      try {
        const response = await fetch(`/api/post/${postId}`, {
          method: "DELETE",
          credentials: "include",
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(
            data.message || "Hay aksi. Sunucuda bir sorun var gibi görünüyor."
          );
        }
        return data;
      } catch (error) {
        throw new Error(error);
      }
    },
    onSuccess: () => {
      toast.success("Gönderi silindi.");
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      navigate("/");
    },
  });

  // Like post mutation
  const { mutate: likePost, isPending: isLiking } = useMutation({
    mutationFn: async () => {
      try {
        const response = await fetch(`/api/post/like/${postId}`, {
          method: "POST",
          credentials: "include",
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || "Bir şeyler yanlış gitti");
        }
        return data;
      } catch (error) {
        throw new Error(error.message);
      }
    },
    onSuccess: (updatedLikes) => {
      queryClient.setQueryData(["post", postId], (oldPost) => {
        return { ...oldPost, likes: updatedLikes };
      });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // Save post mutation
  const { mutate: savePost, isPending: isSaving } = useMutation({
    mutationFn: async () => {
      try {
        const response = await fetch(`/api/post/save/${postId}`, {
          method: "POST",
          credentials: "include",
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || "Bir şeyler yanlış gitti!");
        }
        return data;
      } catch (error) {
        throw new Error(error.message);
      }
    },
    onSuccess: (updatedSaves) => {
      queryClient.setQueryData(["post", postId], (oldPost) => {
        return { ...oldPost, saves: updatedSaves };
      });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // Comment on post mutation
  const { mutate: commentPost, isPending: isCommenting } = useMutation({
    mutationFn: async () => {
      try {
        const response = await fetch(`/api/post/comment/${postId}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ text: comment }),
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || "Yorum yapılırken bir hata oluştu.");
        }
        return data;
      } catch (error) {
        throw new Error(error.message);
      }
    },
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
    if (isLiking) return;
    likePost();
  };

  const handleSavePost = (e) => {
    e.stopPropagation();
    if (isSaving) return;
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
            <div className="flex items-center justify-between pt-3 border-t border-base-300 mt-2">
              <div className="flex items-center gap-6">
                {/* Comment Button */}
                <div className="flex items-center gap-2 group cursor-pointer">
                  <div className="p-2 rounded-full group-hover:bg-blue-500/10 transition-colors">
                    <FaRegComment className="w-5 h-5 text-base-content/60 group-hover:text-blue-500 transition-colors" />
                  </div>
                  <span className="text-sm text-base-content/60 group-hover:text-blue-500 transition-colors">
                    {post.comments.length}
                  </span>
                </div>

                {/* Repost Button */}
                <div className="flex items-center gap-2 group cursor-pointer">
                  <div className="p-2 rounded-full group-hover:bg-green-500/10 transition-colors">
                    <BiRepost className="w-5 h-5 text-base-content/60 group-hover:text-green-500 transition-colors" />
                  </div>
                  <span className="text-sm text-base-content/60 group-hover:text-green-500 transition-colors">
                    0
                  </span>
                </div>

                {/* Like Button */}
                <div
                  className="flex items-center gap-2 group cursor-pointer"
                  onClick={handleLikePost}
                >
                  {isLiking ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <div className="p-2 rounded-full group-hover:bg-pink-500/10 transition-colors">
                      <FaHeart
                        className={`w-5 h-5 transition-colors ${
                          isLiked
                            ? "fill-red-500 text-red-500"
                            : "text-base-content/60 group-hover:text-pink-500"
                        }`}
                      />
                    </div>
                  )}
                  <span
                    className={`text-sm transition-colors ${
                      isLiked
                        ? "text-red-500"
                        : "text-base-content/60 group-hover:text-pink-500"
                    }`}
                  >
                    {post.likes.length}
                  </span>
                </div>

                {/* Save Button */}
                <div
                  className="flex items-center gap-2 group cursor-pointer"
                  onClick={handleSavePost}
                >
                  {isSaving ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <div className="p-2 rounded-full group-hover:bg-blue-500/10 transition-colors">
                      <IoMdBookmark
                        className={`w-5 h-5 transition-colors ${
                          isSaved
                            ? "fill-blue-500 text-blue-500"
                            : "text-base-content/60 group-hover:text-blue-500"
                        }`}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
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
        {post.comments.length === 0 ? (
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
            {post.comments.map((commentItem) => (
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
