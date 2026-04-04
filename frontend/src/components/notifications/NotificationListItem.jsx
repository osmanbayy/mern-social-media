import { Link } from "react-router-dom";
import { LuX } from "react-icons/lu";
import VerifiedBadge from "../common/VerifiedBadge";
import defaultProfilePicture from "../../assets/avatar-placeholder.png";
import NotificationTypeIcon from "./NotificationTypeIcon";
import {
  formatNotificationTime,
  getNotificationLink,
  getNotificationMessage,
  getNotificationTypeShellClass,
} from "../../utils/notificationFormatting";

export default function NotificationListItem({
  notification,
  onDelete,
  deleteDisabled,
}) {
  const unread = !notification.read;
  const shellClass = getNotificationTypeShellClass(notification.type);

  return (
    <li
      className={`group relative overflow-hidden rounded-2xl border transition-all duration-200 ${
        unread
          ? "border-accent/25 bg-accent/[0.06] shadow-sm ring-1 ring-accent/10"
          : "border-base-300/45 bg-base-100/80 hover:border-base-300/70 hover:shadow-md"
      }`}
    >
      {unread && (
        <span className="absolute left-0 top-0 h-full w-1 rounded-r-full bg-accent" aria-hidden />
      )}
      <div className="flex items-center gap-3 p-3.5 pl-4 sm:gap-4 sm:p-4">
        <Link
          to={getNotificationLink(notification)}
          className="flex min-w-0 flex-1 items-center gap-3 sm:gap-4"
        >
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${shellClass}`}
          >
            <NotificationTypeIcon type={notification.type} read={notification.read} />
          </div>
          <div className="avatar shrink-0">
            <div
              className={`h-11 w-11 rounded-full ring-2 ring-offset-2 ring-offset-base-100 transition ${
                unread ? "ring-accent/40" : "ring-base-300/70 group-hover:ring-accent/25"
              }`}
            >
              <img
                src={notification.from?.profileImage || defaultProfilePicture}
                alt=""
                className="h-full w-full rounded-full object-cover"
              />
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <p
              className={`text-sm leading-snug sm:text-[15px] ${
                unread ? "font-semibold text-base-content" : "font-medium text-base-content/85"
              }`}
            >
              <span className="inline-flex items-center gap-1 font-bold text-base-content">
                <span>{notification.from?.fullname || notification.from?.username}</span>
                <VerifiedBadge user={notification.from} size="sm" />
              </span>{" "}
              <span className="font-normal">{getNotificationMessage(notification)}</span>
            </p>
            {notification.createdAt && (
              <p className="mt-1 text-xs text-base-content/45">
                {formatNotificationTime(notification.createdAt)}
              </p>
            )}
          </div>
          {unread && (
            <span className="hidden h-2.5 w-2.5 shrink-0 animate-pulse rounded-full bg-accent ring-2 ring-base-100 sm:block" />
          )}
        </Link>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onDelete(notification._id);
          }}
          disabled={deleteDisabled}
          className="btn btn-circle btn-ghost btn-sm shrink-0 text-base-content/40 opacity-100 transition hover:bg-error/10 hover:text-error sm:opacity-0 sm:group-hover:opacity-100"
          title="Bildirimi sil"
        >
          <LuX className="h-5 w-5" />
        </button>
      </div>
    </li>
  );
}
