import { FaHeart, FaRegComment } from "react-icons/fa";

export default function CommentActionsBar({
  likeCount,
  isLiked,
  onLike,
  onReply,
}) {
  return (
    <div className="mt-2 flex items-center gap-4">
      <button
        type="button"
        onClick={onLike}
        className={`flex items-center gap-1.5 text-sm transition-colors ${
          isLiked ? "text-red-500" : "text-base-content/60 hover:text-red-500"
        }`}
      >
        <FaHeart className={isLiked ? "fill-current" : ""} />
        <span>{likeCount}</span>
      </button>
      <button
        type="button"
        onClick={onReply}
        className="flex items-center gap-1.5 text-sm text-base-content/60 transition-colors hover:text-primary"
      >
        <FaRegComment />
        <span>Yanıtla</span>
      </button>
    </div>
  );
}
