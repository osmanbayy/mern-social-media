import { Link } from "react-router-dom";
import { LuChevronRight } from "react-icons/lu";
import defaultProfilePicture from "../../assets/avatar-placeholder.png";
import { formatConversationListTime } from "../../utils/messagesListFormatting";

export default function ConversationListItem({ conversation: c }) {
  const timeLabel = formatConversationListTime(c.lastMessageAt);

  return (
    <li>
      <Link
        to={`/messages/chat/${c._id}`}
        className="group flex items-center gap-3 rounded-2xl border border-base-300/45 bg-base-100/90 p-3 shadow-sm transition-all duration-200 hover:border-accent/25 hover:bg-base-100 hover:shadow-md active:scale-[0.99] sm:p-3.5"
      >
        <div className="avatar shrink-0">
          <div className="h-14 w-14 rounded-full ring-2 ring-base-300/70 transition-[box-shadow] duration-200 group-hover:ring-accent/35 sm:h-[3.75rem] sm:w-[3.75rem]">
            <img
              src={c.otherUser?.profileImage || defaultProfilePicture}
              alt=""
              className="h-full w-full rounded-full object-cover"
            />
          </div>
        </div>
        <div className="min-w-0 flex-1 text-left">
          <div className="mb-0.5 flex items-center justify-between gap-2">
            <p className="truncate font-semibold text-base-content group-hover:text-accent">
              {c.otherUser?.fullname || c.otherUser?.username || "Kullanıcı"}
            </p>
            {timeLabel ? (
              <time
                dateTime={c.lastMessageAt}
                className="shrink-0 text-[11px] font-medium text-base-content/45 tabular-nums sm:text-xs"
              >
                {timeLabel}
              </time>
            ) : null}
          </div>
          <p className="line-clamp-2 text-sm text-base-content/55">
            {c.lastMessagePreview?.trim() || (
              <span className="italic text-base-content/35">Mesaj yok</span>
            )}
          </p>
        </div>
        <LuChevronRight className="h-5 w-5 shrink-0 text-base-content/25 transition group-hover:translate-x-0.5 group-hover:text-accent/70" />
      </Link>
    </li>
  );
}
