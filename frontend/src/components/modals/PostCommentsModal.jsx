import { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import LoadingSpinner from "../common/LoadingSpinner";
import defaultProfilePicture from "../../assets/avatar-placeholder.png";
import { formatPostDate } from "../../utils/date";
import { FaTrash } from "react-icons/fa";
import { FaRegComment } from "react-icons/fa";
import { BiRepost } from "react-icons/bi";
import { IoMdBookmark } from "react-icons/io";
import { FaHeart } from "react-icons/fa6";
import { IoClose } from "react-icons/io5";

const PostCommentsModal = ({ post, postOwner, isMyPost, isDeleting, onDeletePost, onProfileClick, onImageClick }) => {
  const [comment, setComment] = useState("");
  const { data: authUser } = useQuery({ queryKey: ["authUser"] });
  const queryClient = useQueryClient();

  const formattedDate = formatPostDate(post.createdAt);
  const isLiked = post.likes.includes(authUser?._id);
  const isSaved = post.saves.includes(authUser?._id);

  // Comment on post mutation
  const { mutate: commentPost, isPending: isCommenting } = useMutation({
    mutationFn: async () => {
      try {
        const response = await fetch(`api/post/comment/${post._id}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
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
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
    onError: (error) => {
      toast.error(error.message || "Yorum yapılırken bir hata oluştu.");
    },
  });

  // Like post mutation
  const { mutate: likePost, isPending: isLiking } = useMutation({
    mutationFn: async () => {
      try {
        const response = await fetch(`api/post/like/${post._id}`, {
          method: "POST",
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
      queryClient.setQueryData(["posts"], (oldData) => {
        return oldData?.map((oldPost) => {
          if (oldPost._id === post._id) {
            return { ...oldPost, likes: updatedLikes };
          }
          return oldPost;
        });
      });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // Save post mutation
  const { mutate: savePost, isPending: isSaving } = useMutation({
    mutationFn: async () => {
      try {
        const response = await fetch(`api/post/save/${post._id}`, {
          method: "POST",
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
      queryClient.setQueryData(["posts"], (oldData) => {
        return oldData?.map((oldPost) => {
          if (oldPost._id === post._id) {
            return { ...oldPost, saves: updatedSaves };
          }
          return oldPost;
        });
      });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

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

  return (
    <dialog
      id={`comments_modal${post._id}`}
      className="modal backdrop:bg-black/60 backdrop:backdrop-blur-sm"
    >
      <div className="modal-box max-w-2xl w-full p-0 rounded-2xl shadow-2xl border border-base-300 bg-base-100 overflow-hidden">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-base-100 border-b border-base-300 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <form method="dialog">
              <button className="btn btn-ghost btn-sm btn-circle hover:bg-base-200">
                <IoClose className="w-5 h-5" />
              </button>
            </form>
            <h3 className="font-bold text-lg">Gönderi</h3>
          </div>
          {isMyPost && (
            <button
              onClick={onDeletePost}
              className="btn btn-ghost btn-sm hover:bg-red-500/10 hover:text-red-500"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <LoadingSpinner size="sm" />
              ) : (
                <FaTrash className="w-4 h-4" />
              )}
            </button>
          )}
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto custom-scrollbar" style={{ maxHeight: 'calc(100vh - 200px)' }}>
          {/* Post Content */}
          <div className="px-4 py-4 border-b border-base-300">
            <div className="flex gap-3">
              <Link
                to={`/profile/${postOwner.username}`}
                onClick={onProfileClick}
                className="avatar flex-shrink-0"
              >
                <div className="w-12 h-12 rounded-full">
                  <img
                    src={postOwner.profileImage || defaultProfilePicture}
                    alt="Profil Resmi"
                    className="w-full h-full rounded-full object-cover"
                  />
                </div>
              </Link>
              <div className="flex flex-col flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Link
                    to={`/profile/${postOwner.username}`}
                    className="font-bold hover:underline"
                    onClick={onProfileClick}
                  >
                    {postOwner.fullname}
                  </Link>
                  <span className="text-base-content/60 text-sm">
                    <Link
                      to={`/profile/${postOwner.username}`}
                      className="hover:underline"
                      onClick={onProfileClick}
                    >
                      @{postOwner.username}
                    </Link>
                    <span className="mx-1">·</span>
                    <span>{formattedDate}</span>
                  </span>
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
                      onClick={onImageClick}
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

          {/* Comments Section */}
          <div className="px-4 py-4">
            {post.comments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 rounded-full bg-base-200 flex items-center justify-center mb-3">
                  <span className="text-3xl">💬</span>
                </div>
                <p className="text-base-content/70 font-semibold text-base mb-1">
                  Henüz yorum yok
                </p>
                <p className="text-base-content/50 text-sm">
                  İlk yorumu sen yap!
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {post.comments.map((commentItem) => (
                  <div
                    key={commentItem._id}
                    className="flex gap-3 pb-4 border-b border-base-300 last:border-0"
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
        </div>

        {/* Comment Input - Fixed at Bottom */}
        <div className="sticky bottom-0 bg-base-100 border-t border-base-300 px-4 py-3">
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
                className="textarea textarea-bordered w-full min-h-[60px] max-h-32 resize-none rounded-2xl text-sm bg-base-200/50 border-base-300 focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-base-content/40"
                placeholder="Yorumunu yaz..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={2}
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
      </div>
      <form method="dialog" className="modal-backdrop">
        <button>Kapat</button>
      </form>
    </dialog>
  );
};

export default PostCommentsModal;
