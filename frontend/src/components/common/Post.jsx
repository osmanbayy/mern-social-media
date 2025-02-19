import { FaRegComment } from "react-icons/fa";
import { BiRepost } from "react-icons/bi";
import { FaRegHeart } from "react-icons/fa";
import { FaRegBookmark } from "react-icons/fa6";
import { FaTrash } from "react-icons/fa";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import LoadingSpinner from "../common/LoadingSpinner";
import defaultProfilePicture from "../../assets/avatar-placeholder.png";
import { formatPostDate } from "../../utils/date";

const Post = ({ post }) => {
  const [comment, setComment] = useState("");
  const { data: authUser } = useQuery({ queryKey: ["authUser"] });

  const queryClient = useQueryClient();

  const { mutate: deletePost, isPending: isDeleting } = useMutation({
    mutationFn: async () => {
      try {
        const response = await fetch(`api/post/${post._id}`, {
          method: "DELETE",
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
    },
  });

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
        return oldData.map((oldPost) => {
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
    onError: () => {
      toast.error("Yorum yapılırken bir hata oluştu.");
    },
  });

  const postOwner = post.user;
  const isLiked = post.likes.includes(authUser._id);

  const isMyPost = authUser._id === post.user._id;

  const formattedDate = formatPostDate(post.createdAt);

  const handleDeletePost = (e) => {
    e.stopPropagation(); // Gönderi sil butonuna tıklanarak modal açılmasın
    deletePost();
  };

  const handlePostComment = (e) => {
    e.preventDefault();
    if (isCommenting) return;
    commentPost();
  };

  const handleLikePost = (e) => {
    e.stopPropagation();
    if (isLiking) return;
    likePost();
  };

  const handleRepost = (e) => {
    e.stopPropagation();
  };

  const handleProfileClick = (e) => {
    e.stopPropagation();
  };

  const handleImageClick = (e) => {
    e.stopPropagation();
    document.getElementById("image_modal" + post._id).showModal();
  };

  const handlePostClick = (e) => {
    e.stopPropagation(); // Posta tıklanarak yorum modalı açılır
    document.getElementById("comments_modal" + post._id).showModal();
  };

  return (
    <>
      {/* Post Body */}
      <div
        className="flex gap-2 items-start p-4 border-b transition cursor-pointer border-gray-700"
        onClick={handlePostClick}
      >
        <div className="avatar">
          <Link
            to={`/profile/${postOwner.username}`}
            className="w-8 rounded-full overflow-hidden h-8"
            onClick={handleProfileClick}
          >
            <img src={postOwner.profileImage || defaultProfilePicture} />
          </Link>
        </div>
        <div className="flex flex-col flex-1">
          <div className="flex gap-2 items-center">
            <Link
              to={`/profile/${postOwner.username}`}
              className="font-bold"
              onClick={handleProfileClick}
            >
              {postOwner.fullname}
            </Link>
            <span className="text-gray-500 flex gap-1 text-sm">
              <Link to={`/profile/${postOwner.username}`}>
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
                    onClick={handleDeletePost}
                  />
                )}
                {isDeleting && <LoadingSpinner size="sm" />}
              </span>
            )}
          </div>
          <div className="flex flex-col gap-3 overflow-hidden">
            <span>{post.text}</span>
            {post.img && (
              <img
                src={post.img}
                className="h-80 object-contain rounded-lg border border-gray-700"
                alt=""
                onClick={handleImageClick}
              />
            )}
          </div>
          <div className="flex justify-between mt-3">
            <div className="flex gap-4 items-center w-2/3 justify-between">
              <div
                className="flex gap-1 items-center cursor-pointer group"
                onClick={handlePostClick}
              >
                <FaRegComment className="w-4 h-4  text-slate-500 group-hover:text-sky-400" />
                <span className="text-sm text-slate-500 group-hover:text-sky-400">
                  {post.comments.length}
                </span>
              </div>

              <div
                className="flex gap-1 items-center group cursor-pointer"
                onClick={handleRepost}
              >
                <BiRepost className="w-6 h-6  text-slate-500 group-hover:text-green-500" />
                <span className="text-sm text-slate-500 group-hover:text-green-500">
                  0
                </span>
              </div>

              <div
                className="flex gap-1 items-center group cursor-pointer"
                onClick={handleLikePost}
              >
                {isLiking && <LoadingSpinner size="sm" />}
                {!isLiked && !isLiking && (
                  <FaRegHeart className="w-4 h-4 cursor-pointer text-slate-500 group-hover:text-pink-500" />
                )}
                {isLiked && !isLiking && (
                  <FaRegHeart className="w-4 h-4 cursor-pointer text-red-600" />
                )}

                <span
                  className={`text-sm text-slate-500 group-hover:text-pink-500 ${
                    isLiked ? "text-red-600" : "text-slate-500"
                  }`}
                >
                  {post.likes.length}
                </span>
              </div>
            </div>
            <div className="flex w-1/3 justify-end gap-2 items-center">
              <FaRegBookmark className="w-4 h-4 text-slate-500 cursor-pointer" />
            </div>
          </div>
        </div>
      </div>

      {/* Comments Modal */}
      <dialog
        id={`comments_modal${post._id}`}
        className="modal border-none outline-none"
      >
        <div className="modal-box rounded border border-gray-600">
          <div className="flex gap-2 items-center">
            <Link
              to={`/profile/${postOwner.username}`}
              className="font-bold"
              onClick={handleProfileClick}
            >
              {postOwner.fullname}
            </Link>
            <span className="text-gray-500 flex gap-1 text-sm">
              <Link to={`/profile/${postOwner.username}`}>
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
                    onClick={handleDeletePost}
                  />
                )}
                {isDeleting && <LoadingSpinner size="sm" />}
              </span>
            )}
          </div>
          <div className="flex flex-col gap-3 overflow-hidden">
            <span>{post.text}</span>
            {post.img && (
              <img
                src={post.img}
                className="h-80 object-contain rounded-lg border border-gray-700"
                alt=""
                onClick={handleImageClick}
              />
            )}
          </div>
          <div className="flex justify-between mt-3">
            <div className="flex gap-4 items-center w-2/3 justify-between">
              <div
                className="flex gap-1 items-center cursor-pointer group"
                onClick={handlePostClick}
              >
                <FaRegComment className="w-4 h-4  text-slate-500 group-hover:text-sky-400" />
                <span className="text-sm text-slate-500 group-hover:text-sky-400">
                  {post.comments.length}
                </span>
              </div>

              <div
                className="flex gap-1 items-center group cursor-pointer"
                onClick={handleRepost}
              >
                <BiRepost className="w-6 h-6  text-slate-500 group-hover:text-green-500" />
                <span className="text-sm text-slate-500 group-hover:text-green-500">
                  0
                </span>
              </div>

              <div
                className="flex gap-1 items-center group cursor-pointer"
                onClick={handleLikePost}
              >
                {isLiking && <LoadingSpinner size="sm" />}
                {!isLiked && !isLiking && (
                  <FaRegHeart className="w-4 h-4 cursor-pointer text-slate-500 group-hover:text-pink-500" />
                )}
                {isLiked && !isLiking && (
                  <FaRegHeart className="w-4 h-4 cursor-pointer text-red-600" />
                )}

                <span
                  className={`text-sm text-slate-500 group-hover:text-pink-500 ${
                    isLiked ? "text-red-600" : "text-slate-500"
                  }`}
                >
                  {post.likes.length}
                </span>
              </div>
            </div>
            <div className="flex w-1/3 justify-end gap-2 items-center">
              <FaRegBookmark className="w-4 h-4 text-slate-500 cursor-pointer" />
            </div>
          </div>
          {/* <h3 className="font-bold text-lg mb-4 text-indigo-300">Yorumlar</h3> */}
          <div className="flex flex-col gap-3 max-h-60 overflow-auto mt-5">
            {post.comments.length === 0 && (
              <p className="text-sm text-slate-500">
                Henüz yorum yok. 🤔 İlk yorum yapan sen ol! 😉
              </p>
            )}
            {post.comments.map((comment) => (
              <div key={comment._id} className="flex gap-2 items-start">
                <div className="avatar">
                  <div className="w-8 rounded-full">
                    <img
                      src={comment.user.profileImage || defaultProfilePicture}
                    />
                  </div>
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-1">
                    <span className="font-bold">{comment.user.fullname}</span>
                    <span className="text-gray-500 text-sm">
                      @{comment.user.username}
                    </span>
                  </div>
                  <div className="text-sm">{comment.text}</div>
                </div>
              </div>
            ))}
          </div>
          <form
            className="flex gap-2 items-center mt-4 border-t border-gray-600 pt-2"
            onSubmit={handlePostComment}
          >
            <textarea
              className="textarea w-full p-1 rounded text-md resize-none border focus:outline-none  border-gray-800"
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
          <button className="outline-none">close</button>
        </form>
      </dialog>

      {/* Image Modal */}
      <dialog
        id={`image_modal${post._id}`}
        className="modal border-none outline-none"
      >
        <div className="modal-box p-0 max-w-screen-sm">
          <img src={post.img} className="w-full object-contain" alt="" />
        </div>
        <form method="dialog" className="modal-backdrop">
          <button className="outline-none">close</button>
        </form>
      </dialog>
    </>
  );
};

export default Post;
