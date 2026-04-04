/**
 * Pure helpers for notification UI (links, copy, styling).
 */

export function getNotificationLink(notification) {
  if (notification.type === "message_request") return "/messages/requests";
  if (notification.type === "mention" && notification.post?._id) {
    return `/post/${notification.post._id}`;
  }
  if (
    (notification.type === "like" ||
      notification.type === "comment" ||
      notification.type === "retweet" ||
      notification.type === "quote_retweet") &&
    notification.post?._id
  ) {
    return `/post/${notification.post._id}`;
  }
  return `/profile/${notification.from?.username}`;
}

export function formatNotificationTime(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleString("tr-TR", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const TYPE_SHELL_CLASS = {
  follow: "bg-sky-500/12 text-sky-600 dark:text-sky-400 ring-1 ring-sky-500/20",
  comment: "bg-emerald-500/12 text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-500/20",
  retweet: "bg-green-500/12 text-green-600 dark:text-green-400 ring-1 ring-green-500/20",
  quote_retweet: "bg-green-500/12 text-green-600 dark:text-green-400 ring-1 ring-green-500/20",
  mention: "bg-violet-500/12 text-violet-600 dark:text-violet-400 ring-1 ring-violet-500/20",
  message_request: "bg-amber-500/12 text-amber-600 dark:text-amber-400 ring-1 ring-amber-500/20",
  like: "bg-rose-500/12 text-rose-600 dark:text-rose-400 ring-1 ring-rose-500/20",
};

export function getNotificationTypeShellClass(type) {
  return TYPE_SHELL_CLASS[type] ?? TYPE_SHELL_CLASS.like;
}

export function getNotificationMessage(notification) {
  switch (notification.type) {
    case "follow":
      return "seni takip etti";
    case "comment":
      return "gönderine yorum yaptı";
    case "retweet":
      return "gönderini retweet etti";
    case "quote_retweet":
      return "gönderini alıntı retweet etti";
    case "mention":
      return "senden bahsetti";
    case "message_request":
      return "sana bir mesaj isteği gönderdi";
    default:
      return "gönderini beğendi";
  }
}
