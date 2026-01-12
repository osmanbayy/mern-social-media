import { FaRegComment } from "react-icons/fa";
import { BiRepost } from "react-icons/bi";
import { IoMdBookmark } from "react-icons/io";
import { FaHeart } from "react-icons/fa6";

const PostActions = ({
  post,
  isLiked,
  isSaved,
  isLiking,
  isSaving,
  onLike,
  onSave,
  onComment,
  onRepost,
  showCounts = true,
  variant = "default", // "default" or "compact"
}) => {
  if (variant === "compact") {
    return (
      <div className="flex justify-between mt-4 pt-3 border-t border-base-300/30">
        <div className="flex gap-6 items-center">
          {onComment && (
            <div
              className="flex gap-1.5 items-center cursor-pointer group"
              onClick={onComment}
            >
              <div className="p-1.5 rounded-full group-hover:bg-blue-500/10 transition-all duration-200">
                <FaRegComment className="w-5 h-5 text-base-content/60 group-hover:text-blue-500 transition-all duration-200 group-hover:scale-110" />
              </div>
              {showCounts && (
                <span className="text-sm text-base-content/60 group-hover:text-blue-500 transition-colors font-medium">
                  {post.comments.length}
                </span>
              )}
            </div>
          )}

          {onRepost && (
            <div
              className="flex gap-1.5 items-center group cursor-pointer"
              onClick={onRepost}
            >
              <div className="p-1.5 rounded-full group-hover:bg-green-500/10 transition-all duration-200">
                <BiRepost className="w-6 h-6 text-base-content/60 group-hover:text-green-500 transition-all duration-200 group-hover:scale-110" />
              </div>
              {showCounts && (
                <span className="text-sm text-base-content/60 group-hover:text-green-500 transition-colors font-medium">
                  0
                </span>
              )}
            </div>
          )}

          <div
            className="flex gap-1.5 items-center group cursor-pointer"
            onClick={onLike}
          >
            <div className="p-1.5 rounded-full group-hover:bg-pink-500/10 transition-all duration-200">
              <FaHeart
                className={`w-5 h-5 transition-all duration-200 ${
                  isLiked
                    ? "fill-red-500 text-red-500 scale-110"
                    : "text-base-content/60 group-hover:text-pink-500 group-hover:scale-110"
                }`}
              />
            </div>
            {showCounts && (
              <span
                className={`text-sm transition-colors font-medium ${
                  isLiked ? "text-red-500" : "text-base-content/60 group-hover:text-pink-500"
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
          <div className="p-1.5 rounded-full group-hover:bg-blue-500/10 transition-all duration-200">
            <IoMdBookmark
              className={`w-5 h-5 transition-all duration-200 ${
                isSaved
                  ? "fill-blue-500 text-blue-500 scale-110"
                  : "text-base-content/60 group-hover:text-blue-500 group-hover:scale-110"
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
            <div className="p-2.5 rounded-full group-hover:bg-blue-500/10 transition-all duration-200 group-active:scale-95">
              <FaRegComment className="w-5 h-5 text-base-content/60 group-hover:text-blue-500 transition-all duration-200 group-hover:scale-110" />
            </div>
            {showCounts && (
              <span className="text-sm text-base-content/60 group-hover:text-blue-500 transition-colors font-medium">
                {post.comments.length}
              </span>
            )}
          </div>
        )}

        {/* Repost Button */}
        {onRepost && (
          <div
            className="flex items-center gap-2 group cursor-pointer"
            onClick={onRepost}
          >
            <div className="p-2.5 rounded-full group-hover:bg-green-500/10 transition-all duration-200 group-active:scale-95">
              <BiRepost className="w-5 h-5 text-base-content/60 group-hover:text-green-500 transition-all duration-200 group-hover:scale-110" />
            </div>
            {showCounts && (
              <span className="text-sm text-base-content/60 group-hover:text-green-500 transition-colors font-medium">
                0
              </span>
            )}
          </div>
        )}

        {/* Like Button */}
        <div
          className="flex items-center gap-2 group cursor-pointer"
          onClick={onLike}
        >
          <div className="p-2.5 rounded-full group-hover:bg-pink-500/10 transition-all duration-200 group-active:scale-95">
            <FaHeart
              className={`w-5 h-5 transition-all duration-200 ${
                isLiked
                  ? "fill-red-500 text-red-500 scale-110"
                  : "text-base-content/60 group-hover:text-pink-500 group-hover:scale-110"
              }`}
            />
          </div>
          {showCounts && (
            <span
              className={`text-sm transition-colors font-medium ${
                isLiked
                  ? "text-red-500"
                  : "text-base-content/60 group-hover:text-pink-500"
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
          <div className="p-2.5 rounded-full group-hover:bg-blue-500/10 transition-all duration-200 group-active:scale-95">
            <IoMdBookmark
              className={`w-5 h-5 transition-all duration-200 ${
                isSaved
                  ? "fill-blue-500 text-blue-500 scale-110"
                  : "text-base-content/60 group-hover:text-blue-500 group-hover:scale-110"
              }`}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostActions;
