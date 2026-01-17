import { useState, useRef } from "react";
import { FaRegComment } from "react-icons/fa";
import { IoMdBookmark } from "react-icons/io";
import { FaHeart } from "react-icons/fa6";
import { AiOutlineRetweet } from "react-icons/ai";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { retweetPost } from "../../api/posts";
import RetweetDropdown from "./RetweetDropdown";


const PostActions = ({
  post,
  isLiked,
  isSaved,
  isRetweeted = false,
  isLiking,
  isSaving,
  onLike,
  onSave,
  onComment,
  showCounts = true,
  variant = "default", // "default" or "compact"
}) => {
  const [showRetweetDropdown, setShowRetweetDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const queryClient = useQueryClient();

  const { mutate: directRetweet, isPending: isDirectRetweeting } = useMutation({
    mutationFn: () => retweetPost(post._id),
    onSuccess: (data) => {
      toast.success(data.retweeted ? "Gönderi retweet edildi." : "Retweet geri alındı.");
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
    onError: (error) => {
      toast.error(error.message || "Retweet edilirken bir hata oluştu.");
    },
  });

  const handleRetweetClick = (e) => {
    e.stopPropagation();
    
    // If already retweeted, unretweet directly
    if (isRetweeted) {
      directRetweet();
      return;
    }
    
    // Otherwise, open dropdown
    setShowRetweetDropdown(!showRetweetDropdown);
  };
  if (variant === "compact") {
    return (
      <div className="flex justify-between mt-4 pt-3 border-t border-base-300/30">
        <div className="flex gap-6 items-center">
          {onComment && (
            <div
              className="flex gap-1.5 items-center cursor-pointer group"
              onClick={onComment}
            >
              <div className="p-1.5 rounded-full transition-all duration-200">
                <FaRegComment className="w-5 h-5 text-base-content/60 transition-all duration-200" />
              </div>
              {showCounts && (
                <span className="text-sm text-base-content/60 transition-colors font-medium">
                  {post.comments.length}
                </span>
              )}
            </div>
          )}

          <div className="relative" ref={dropdownRef}>
            <div
              className="flex gap-1.5 items-center group cursor-pointer"
              onClick={handleRetweetClick}
            >
              <div className="p-1.5 rounded-full transition-all duration-200">
                <AiOutlineRetweet
                  className={`w-6 h-6 transition-all duration-200 ${
                    isRetweeted
                      ? "fill-green-500 text-green-500 scale-110"
                      : "text-base-content/60"
                  }`}
                />
              </div>
              {showCounts && (
                <span
                  className={`text-sm transition-colors font-medium ${
                    isRetweeted ? "text-green-500" : "text-base-content/60"
                  }`}
                >
                  {post?.retweetedBy?.length || 0}
                </span>
              )}
            </div>
            
            {/* Retweet Dropdown */}
            {showRetweetDropdown && !isRetweeted && (
              <RetweetDropdown
                post={post}
                isRetweeted={isRetweeted}
                onClose={() => setShowRetweetDropdown(false)}
              />
            )}
          </div>

          <div
            className="flex gap-1.5 items-center group cursor-pointer"
            onClick={onLike}
          >
            <div className="p-1.5 rounded-full transition-all duration-200">
              <FaHeart
                className={`w-5 h-5 transition-all duration-200 ${
                  isLiked
                    ? "fill-red-500 text-red-500 scale-110"
                    : "text-base-content/60"
                }`}
              />
            </div>
            {showCounts && (
              <span
                className={`text-sm transition-colors font-medium ${
                  isLiked ? "text-red-500" : "text-base-content/60"
                }`}
              >
                {post.likes.length}
              </span>
            )}
          </div>
        </div>
        <div
          className="flex items-center cursor-pointer group"
          onClick={onSave}
        >
          <div className="p-1.5 rounded-full transition-all duration-200">
            <IoMdBookmark
              className={`w-5 h-5 transition-all duration-200 ${
                isSaved
                  ? "fill-blue-500 text-blue-500 scale-110"
                  : "text-base-content/60"
              }`}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between pt-4 border-t border-base-300/50 mt-3">
      <div className="flex items-center gap-8">
        {/* Comment Button */}
        {onComment && (
          <div
            className="flex items-center gap-2 group cursor-pointer"
            onClick={onComment}
          >
            <div className="p-2.5 rounded-full transition-all duration-200 group-active:scale-95">
              <FaRegComment className="w-5 h-5 text-base-content/60 transition-all duration-200" />
            </div>
            {showCounts && (
              <span className="text-sm text-base-content/60 transition-colors font-medium">
                {post.comments.length}
              </span>
            )}
          </div>
        )}

        {/* Repost Button with Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <div
            className="flex items-center gap-2 group cursor-pointer"
            onClick={handleRetweetClick}
          >
            <div className="rounded-full transition-all duration-200 group-active:scale-95">
              <AiOutlineRetweet
                className={`w-5 h-5 transition-all duration-200 ${
                  isRetweeted
                    ? "fill-green-500 text-green-500 scale-110"
                    : "text-base-content/60"
                }`}
              />
            </div>
            {showCounts && (
              <span
                className={`text-sm transition-colors font-medium ${
                  isRetweeted ? "text-green-500" : "text-base-content/60"
                }`}
              >
                {post?.retweetedBy?.length || 0}
              </span>
            )}
          </div>
          
          {/* Retweet Dropdown */}
          {showRetweetDropdown && !isRetweeted && (
            <RetweetDropdown
              post={post}
              isRetweeted={isRetweeted}
              onClose={() => setShowRetweetDropdown(false)}
            />
          )}
        </div>

        {/* Like Button */}
        <div
          className="flex items-center gap-2 group cursor-pointer"
          onClick={onLike}
        >
          <div className="p-2.5 rounded-full transition-all duration-200 group-active:scale-95">
            <FaHeart
              className={`w-5 h-5 transition-all duration-200 ${
                isLiked
                  ? "fill-red-500 text-red-500 scale-110"
                  : "text-base-content/60"
              }`}
            />
          </div>
          {showCounts && (
            <span
              className={`text-sm transition-colors font-medium ${
                isLiked
                  ? "text-red-500"
                  : "text-base-content/60"
              }`}
            >
              {post.likes.length}
            </span>
          )}
        </div>

        {/* Save Button */}
        <div
          className="flex items-center gap-2 group cursor-pointer"
          onClick={onSave}
        >
          <div className="p-2.5 rounded-full transition-all duration-200 group-active:scale-95">
            <IoMdBookmark
              className={`w-5 h-5 transition-all duration-200 ${
                isSaved
                  ? "fill-blue-500 text-blue-500 scale-110"
                  : "text-base-content/60"
              }`}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostActions;
