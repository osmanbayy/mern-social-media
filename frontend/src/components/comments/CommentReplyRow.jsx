import { FaHeart } from "react-icons/fa";
import MentionText from "../common/MentionText";
import CommentAuthorLine from "./CommentAuthorLine";
import CommentUserAvatar from "./CommentUserAvatar";
import { commentLikeListIncludesUser } from "../../utils/commentLikes";

const stop = (e) => e.stopPropagation();

export default function CommentReplyRow({
  reply,
  authUser,
  defaultProfilePicture,
}) {
  if (!reply.user) return null;

  const liked = commentLikeListIncludesUser(reply.likes, authUser?._id);

  return (
    <div className="flex gap-2">
      <CommentUserAvatar
        user={reply.user}
        defaultProfilePicture={defaultProfilePicture}
        size="sm"
        onLinkClick={stop}
      />
      <div className="min-w-0 flex-1">
        <div className="mb-1">
          <CommentAuthorLine user={reply.user} nameSize="sm" onLinkClick={stop} />
        </div>
        <p className="text-base-content text-xs leading-relaxed">
          <MentionText text={reply.text} />
        </p>
        <div className="mt-1 flex items-center gap-3">
          <button
            type="button"
            onClick={stop}
            className={`flex items-center gap-1 text-xs transition-colors ${
              liked ? "text-red-500" : "text-base-content/60 hover:text-red-500"
            }`}
          >
            <FaHeart className={liked ? "fill-current" : ""} />
            <span>{reply.likes?.length || 0}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
