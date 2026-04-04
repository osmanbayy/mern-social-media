import { BiRepost } from "react-icons/bi";
import { LuHeart, LuMessageCircle, LuMessageSquare, LuUser } from "react-icons/lu";

const dimClass = (read) => (read ? "opacity-70" : "");

export default function NotificationTypeIcon({ type, read }) {
  const dim = dimClass(read);
  switch (type) {
    case "follow":
      return <LuUser className={`h-6 w-6 ${dim}`} strokeWidth={2} />;
    case "comment":
    case "mention":
      return <LuMessageCircle className={`h-6 w-6 ${dim}`} strokeWidth={2} />;
    case "retweet":
    case "quote_retweet":
      return <BiRepost className={`h-6 w-6 ${dim}`} />;
    case "message_request":
      return <LuMessageSquare className={`h-6 w-6 ${dim}`} strokeWidth={2} />;
    default:
      return <LuHeart className={`h-6 w-6 ${dim}`} strokeWidth={2} fill="currentColor" />;
  }
}
