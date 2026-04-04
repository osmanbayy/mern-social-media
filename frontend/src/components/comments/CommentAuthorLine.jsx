import { Link } from "react-router-dom";
import VerifiedBadge from "../common/VerifiedBadge";

const NAME_CLASS = {
  md: "truncate font-semibold text-sm hover:text-primary transition-colors",
  sm: "truncate font-semibold text-xs hover:text-primary transition-colors",
};

export default function CommentAuthorLine({ user, nameSize = "md", onLinkClick }) {
  if (!user?.username) return null;

  return (
    <div className="flex min-w-0 items-center gap-2">
      <div className="flex min-w-0 items-center gap-1">
        <Link
          to={`/profile/${user.username}`}
          className={NAME_CLASS[nameSize]}
          onClick={onLinkClick}
        >
          {user.fullname || "Kullanıcı"}
        </Link>
        <VerifiedBadge user={user} size="sm" />
      </div>
      <span className="text-base-content/50 text-xs">@{user.username}</span>
    </div>
  );
}
