import { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import LoadingSpinner from "../common/LoadingSpinner";
import defaultProfilePicture from "../../assets/avatar-placeholder.png";
import { formatPostDate } from "../../utils/date";
import { FaTrash } from "react-icons/fa";

const PostCommentsModal = ({ post, postOwner, isMyPost, isDeleting, onDeletePost, onProfileClick, onImageClick }) => {
  const [comment, setComment] = useState("");
  const { data: authUser } = useQuery({ queryKey: ["authUser"] });
  const queryClient = useQueryClient();

  const formattedDate = formatPostDate(post.createdAt);

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

  const handlePostComment = (e) => {
    e.preventDefault();
    if (isCommenting) return;
    commentPost();
  };

  return (
    <dialog
      id={`comments_modal${post._id}`}
      className="modal border-none outline-none"
    >
      <div className="modal-box rounded shadow-2xl">
        <div className="flex gap-2 items-center">
          <div className="border rounded-full">
            <img
              src={postOwner.profileImage || defaultProfilePicture}
              alt="Profil Resmi"
              className="size-8 rounded-full object-cover"
            />
          </div>
          <Link
            to={`/profile/${postOwner.username}`}
            className="font-bold"
            onClick={onProfileClick}
          >
            {postOwner.fullname}
          </Link>
          <span className="text-gray-500 flex gap-1 text-sm">
            <Link to={`/profile/${postOwner.username}`} onClick={onProfileClick}>
              @{postOwner.username}
            </Link>
            <span>·</span>
            <span className="text-gray-600">{formattedDate}</span>
          </span>
          {isMyPost && (
            <span className="flex justify-end flex-1">
              {!isDeleting && (
                <FaTrash
                  className="cursor-pointer hover:text-red-500"
                  onClick={onDeletePost}
                />
              )}
              {isDeleting && <LoadingSpinner size="sm" />}
            </span>
          )}
        </div>
        <div className="flex flex-col gap-3 overflow-hidden border-b border-gray-500 pb-2">
          <span className="px-10 py-2">{post.text}</span>
          {post.img && (
            <img
              src={post.img}
              className="h-80 object-contain rounded-lg border border-gray-700 cursor-pointer"
              alt="Gönderi Resmi"
              onClick={onImageClick}
            />
          )}
        </div>
        <div className="flex flex-col gap-3 max-h-60 overflow-auto mt-5">
          {post.comments.length === 0 && (
            <p className="text-sm text-slate-500">
              Henüz yorum yok. 🤔 İlk yorum yapan sen ol! 😉
            </p>
          )}
          {post.comments.map((commentItem) => (
            <div key={commentItem._id} className="flex gap-2 items-start ml-5">
              <div className="avatar">
                <div className="w-8 rounded-full">
                  <img
                    src={commentItem.user.profileImage || defaultProfilePicture}
                    alt={commentItem.user.fullname}
                  />
                </div>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1">
                  <span className="font-bold">{commentItem.user.fullname}</span>
                  <span className="text-gray-500 text-sm">
                    @{commentItem.user.username}
                  </span>
                </div>
                <div className="text-sm">{commentItem.text}</div>
              </div>
            </div>
          ))}
        </div>
        <form
          className="flex gap-2 items-center mt-4 border-t border-gray-600 pt-2"
          onSubmit={handlePostComment}
        >
          <textarea
            className="textarea w-full p-1 rounded text-md resize-none border focus:outline-none border-gray-800"
            placeholder="Yorum yap..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
          <button className="btn btn-primary rounded-full btn-sm text-white px-4">
            {isCommenting ? <LoadingSpinner size="md" /> : "Paylaş"}
          </button>
        </form>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button className="outline-none">Kapat</button>
      </form>
    </dialog>
  );
};

export default PostCommentsModal;
