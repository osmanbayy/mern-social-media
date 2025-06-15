import { FaRegComment } from "react-icons/fa";
import { BiRepost } from "react-icons/bi";
import { IoMdBookmark } from "react-icons/io";
import { FaTrash } from "react-icons/fa";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import LoadingSpinner from "../common/LoadingSpinner";
import defaultProfilePicture from "../../assets/avatar-placeholder.png";
import { formatPostDate } from "../../utils/date";
import { HiDotsHorizontal } from "react-icons/hi";
import { BsEmojiFrown } from "react-icons/bs";
import { SlUserFollow, SlUserUnfollow } from "react-icons/sl";
import { FaHeart } from "react-icons/fa6";
import { GoBlocked, GoMute } from "react-icons/go";
import { CiFlag1 } from "react-icons/ci";
import { TbEdit } from "react-icons/tb";
import { LuPin } from "react-icons/lu";
import useFollow from "../../hooks/useFollow";
import { MdOutlineShowChart } from "react-icons/md";
import DeletePostDialog from "../DeletePostDialog";

const Post = ({ post }) => {
  const [comment, setComment] = useState("");
  const { data: authUser, isLoading } = useQuery({ queryKey: ["authUser"] });

  const queryClient = useQueryClient();

  // Delete post mutation
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
        return oldData.map((oldPost) => {
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
    onError: () => {
      toast.error("Yorum yapılırken bir hata oluştu.");
    },
  });

  // Fetch the user
  const { data: user } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      try {
        const response = await fetch(`/api/user/profile/${post.user.username}`);
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || "Bir hata oluştu.");
        }
        return data;
      } catch (error) {
        throw new Error(error.message || "Bir hata oluştu.");
      }
    },
  });

  const { follow, isPending } = useFollow();

  const postOwner = post?.user;
  const isLiked = post.likes.includes(authUser._id);
  const isSaved = post.saves.includes(authUser._id);
  let amIFollowing = authUser?.following.includes(user?._id);

  const isMyPost = authUser._id === post.user._id;

  const formattedDate = formatPostDate(post.createdAt);

  const theme = localStorage.getItem("theme");

  const handleDeletePost = () => {
    deletePost();
  };

  const handleOptions = (e) => {
    e.stopPropagation();
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

  const handleSavePost = (e) => {
    e.stopPropagation();
    if (isSaving) return;
    savePost();
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

  if (isLoading) return <LoadingSpinner size="md" />;

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
            <div
              className="flex flex-1 justify-end w-12"
              onClick={handleOptions}
            >
              {/* Post Options Dropdown */}
              <div className="dropdown dropdown-left">
                <HiDotsHorizontal
                  tabIndex={0}
                  role="button"
                  className="size-5 rounded-full hover:invert-50"
                />
                <ul
                  tabIndex={0}
                  className={`dropdown-content rounded-md border-[0.2px] border-gray-600 menu bg-base-100 z-1 font-semibold min-w-60 shadow-lg p-2 ${
                    theme === "fantasy" ? "shadow-black/20" : "shadow-white/10"
                  }`}
                >
                  {isMyPost && (
                    <li
                      className=""
                      onClick={() =>
                        document.getElementById("delete_modal").showModal()
                      }
                    >
                      {!isDeleting && (
                        <div>
                          <FaTrash /> <span>Gönderiyi Sil</span>
                        </div>
                      )}
                      {isDeleting && <LoadingSpinner size="sm" />}
                    </li>
                  )}
                  {isMyPost && (
                    <li className="">
                      <a href="">
                        <TbEdit /> <span>Düzenle</span>
                      </a>
                    </li>
                  )}
                  {isMyPost && (
                    <li className="">
                      <a href="">
                        <LuPin /> <span>Profilde Başa Sabitle</span>
                      </a>
                    </li>
                  )}
                  {isMyPost && (
                    <li className="">
                      <a href="">
                        <MdOutlineShowChart /> <span>Görünürlüğü Düzenle</span>
                      </a>
                    </li>
                  )}
                  {!isMyPost && (
                    <li className="">
                      <a className="rounded-none flex whitespace-nowrap">
                        <BsEmojiFrown /> Bu gönderi ilgimi çekmiyor
                      </a>
                    </li>
                  )}
                  {!isMyPost && (
                    <li onClick={() => follow(post.user._id)}>
                      {isPending ? (
                        <>
                          <LoadingSpinner size="xs" /> Yükleniyor...
                        </>
                      ) : (
                        <a className="rounded-none whitespace-nowrap">
                          {amIFollowing ? (
                            <>
                              <SlUserUnfollow /> Takipten Çık
                            </>
                          ) : (
                            <>
                              <SlUserFollow /> Takip et
                            </>
                          )}
                          <span className="text-gray-500">
                            @{postOwner.username}
                          </span>
                        </a>
                      )}
                    </li>
                  )}
                  {!isMyPost && (
                    <li>
                      <a href="" className="rounded-none whitespace-nowrap">
                        <GoMute /> Sessize Al{" "}
                        <span className="text-gray-500">
                          @{postOwner.username}
                        </span>
                      </a>
                    </li>
                  )}
                  {!isMyPost && (
                    <li>
                      <a href="" className="rounded-none whitespace-nowrap">
                        <GoBlocked /> Engelle{" "}
                        <span className="text-gray-500">
                          @{postOwner.username}
                        </span>
                      </a>
                    </li>
                  )}
                  {!isMyPost && (
                    <li>
                      <a href="" className="rounded-none whitespace-nowrap">
                        <CiFlag1 /> Bildir{" "}
                      </a>
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </div>
          {/* Post Content */}
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
          {/* Post Actions (comment, like, repost , save etc.) */}
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
                  <FaHeart className="w-5 h-4 cursor-pointer text-slate-500 group-hover:text-pink-500" />
                )}
                {isLiked && !isLiking && (
                  <FaHeart className="w-4 h-4 cursor-pointer fill-red-600" />
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
            <div
              className="flex w-1/3 justify-end gap-2 items-center"
              onClick={handleSavePost}
            >
              {isSaving && <LoadingSpinner size="sm" />}
              {!isSaved && !isSaving && (
                <IoMdBookmark className="w-5 h-5 text-slate-500 cursor-pointer" />
              )}
              {isSaved && !isSaving && (
                <IoMdBookmark className="w-5 h-5 fill-blue-500 cursor-pointer" />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Comments Modal */}
      <dialog
        id={`comments_modal${post._id}`}
        className="modal border-none outline-none"
      >
        <div className="modal-box rounded shadow-2xl">
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
                  <FaHeart className="w-4 h-4 cursor-pointer text-slate-500 group-hover:text-pink-500" />
                )}
                {isLiked && !isLiking && (
                  <FaHeart className="w-4 h-4 cursor-pointer fill-red-600" />
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
              <IoMdBookmark className="w-4 h-4 text-slate-500 cursor-pointer" />
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

      {/* Delete Post Modal */}
      <DeletePostDialog handleDeletePost={handleDeletePost} />
    </>
  );
};

export default Post;
