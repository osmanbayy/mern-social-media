import { Link } from "react-router-dom";

const SIZE = {
  md: "w-10 h-10 ring-2 ring-base-300 hover:ring-primary transition-all duration-300",
  sm: "w-8 h-8 ring-2 ring-base-300",
};

export default function CommentUserAvatar({
  user,
  defaultProfilePicture,
  size = "md",
  onLinkClick,
}) {
  if (!user?.username) return null;

  return (
    <Link
      to={`/profile/${user.username}`}
      className="avatar flex-shrink-0"
      onClick={onLinkClick}
    >
      <div className={`${SIZE[size]} rounded-full`}>
        <img
          src={user.profileImage || defaultProfilePicture}
          alt={user.fullname || "Kullanıcı"}
          className="h-full w-full rounded-full object-cover"
        />
      </div>
    </Link>
  );
}
