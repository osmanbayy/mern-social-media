import { FaRegComment } from "react-icons/fa";
import { BiRepost } from "react-icons/bi";
import { IoMdBookmark } from "react-icons/io";
import { FaHeart } from "react-icons/fa6";
import LoadingSpinner from "./LoadingSpinner";

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
      <div className="flex justify-between mt-3">
        <div className="flex gap-4 items-center w-2/3 justify-between">
          {onComment && (
            <div
              className="flex gap-1 items-center cursor-pointer group"
              onClick={onComment}
            >
              <FaRegComment className="w-4 h-4 text-slate-500 group-hover:text-sky-400" />
              {showCounts && (
                <span className="text-sm text-slate-500 group-hover:text-sky-400">
                  {post.comments.length}
                </span>
              )}
            </div>
          )}

          {onRepost && (
            <div
              className="flex gap-1 items-center group cursor-pointer"
              onClick={onRepost}
            >
              <BiRepost className="w-6 h-6 text-slate-500 group-hover:text-green-500" />
              {showCounts && (
                <span className="text-sm text-slate-500 group-hover:text-green-500">
                  0
                </span>
              )}
            </div>
          )}

          <div
            className="flex gap-1 items-center group cursor-pointer"
            onClick={onLike}
          >
            <FaHeart
              className={`w-5 h-4 cursor-pointer transition-colors ${
                isLiked
                  ? "fill-red-600 text-red-600"
                  : "text-slate-500 group-hover:text-pink-500"
              }`}
            />
            {showCounts && (
              <span
                className={`text-sm text-slate-500 group-hover:text-pink-500 transition-colors ${
                  isLiked ? "text-red-600" : "text-slate-500"
                }`}
              >
                {post.likes.length}
              </span>
            )}
          </div>
        </div>
        <div
          className="flex w-1/3 justify-end gap-2 items-center"
          onClick={onSave}
        >
          <IoMdBookmark
            className={`w-5 h-5 cursor-pointer transition-colors ${
              isSaved
                ? "fill-blue-500 text-blue-500"
                : "text-slate-500"
            }`}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between pt-3 border-t border-base-300 mt-2">
      <div className="flex items-center gap-6">
        {/* Comment Button */}
        {onComment && (
          <div
            className="flex items-center gap-2 group cursor-pointer"
            onClick={onComment}
          >
            <div className="p-2 rounded-full group-hover:bg-blue-500/10 transition-colors">
              <FaRegComment className="w-5 h-5 text-base-content/60 group-hover:text-blue-500 transition-colors" />
            </div>
            {showCounts && (
              <span className="text-sm text-base-content/60 group-hover:text-blue-500 transition-colors">
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
            <div className="p-2 rounded-full group-hover:bg-green-500/10 transition-colors">
              <BiRepost className="w-5 h-5 text-base-content/60 group-hover:text-green-500 transition-colors" />
            </div>
            {showCounts && (
              <span className="text-sm text-base-content/60 group-hover:text-green-500 transition-colors">
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
          <div className="p-2 rounded-full group-hover:bg-pink-500/10 transition-colors">
            <FaHeart
              className={`w-5 h-5 transition-colors ${
                isLiked
                  ? "fill-red-500 text-red-500"
                  : "text-base-content/60 group-hover:text-pink-500"
              }`}
            />
          </div>
          {showCounts && (
            <span
              className={`text-sm transition-colors ${
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
          <div className="p-2 rounded-full group-hover:bg-blue-500/10 transition-colors">
            <IoMdBookmark
              className={`w-5 h-5 transition-colors ${
                isSaved
                  ? "fill-blue-500 text-blue-500"
                  : "text-base-content/60 group-hover:text-blue-500"
              }`}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostActions;
