import { Link, useNavigate } from "react-router-dom";
import {
  LuBell,
  LuHeart,
  LuSettings,
  LuUser,
  LuTrash2,
  LuCheckCheck,
  LuMessageCircle,
  LuX,
  LuMessageSquare,
  LuSparkles,
} from "react-icons/lu";
import { BiRepost } from "react-icons/bi";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import defaultProfilePicture from "../../assets/avatar-placeholder.png";
import { FaArrowLeft } from "react-icons/fa6";
import {
  getNotifications,
  deleteAllNotifications,
  markAllNotificationsAsRead,
  deleteNotification,
} from "../../api/notifications";

const getNotificationLink = (notification) => {
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
};

const formatNotifTime = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleString("tr-TR", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const iconShell = (type) => {
  const map = {
    follow: "bg-sky-500/12 text-sky-600 dark:text-sky-400 ring-1 ring-sky-500/20",
    comment: "bg-emerald-500/12 text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-500/20",
    retweet: "bg-green-500/12 text-green-600 dark:text-green-400 ring-1 ring-green-500/20",
    quote_retweet: "bg-green-500/12 text-green-600 dark:text-green-400 ring-1 ring-green-500/20",
    mention: "bg-violet-500/12 text-violet-600 dark:text-violet-400 ring-1 ring-violet-500/20",
    message_request: "bg-amber-500/12 text-amber-600 dark:text-amber-400 ring-1 ring-amber-500/20",
    like: "bg-rose-500/12 text-rose-600 dark:text-rose-400 ring-1 ring-rose-500/20",
  };
  return map[type] || map.like;
};

const NotificationSkeleton = () => (
  <div className="animate-pulse rounded-2xl border border-base-300/30 bg-base-100/50 p-4">
    <div className="flex gap-4">
      <div className="skeleton h-12 w-12 shrink-0 rounded-full" />
      <div className="skeleton h-12 w-12 shrink-0 rounded-full" />
      <div className="min-w-0 flex-1 space-y-2 pt-1">
        <div className="skeleton h-4 w-3/4 max-w-xs rounded-full" />
        <div className="skeleton h-3 w-24 rounded-full" />
      </div>
    </div>
  </div>
);

const NotificationPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: notifications, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: getNotifications,
  });

  const { mutate: deleteNotifications, isPending: isDeleting } = useMutation({
    mutationFn: deleteAllNotifications,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast.success("Bildirimler silindi");
    },
    onError: () => {
      toast.error("Bildirimler silinemedi");
    },
  });

  const { mutate: markAllAsRead, isPending: isMarkingRead } = useMutation({
    mutationFn: markAllNotificationsAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast.success("Tümü okundu olarak işaretlendi");
    },
    onError: () => {
      toast.error("İşlem yapılamadı");
    },
  });

  const { mutate: deleteSingleNotification, isPending: isDeletingSingle } = useMutation({
    mutationFn: deleteNotification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast.success("Bildirim silindi");
    },
    onError: () => {
      toast.error("Bildirim silinemedi");
    },
  });

  const unreadCount = notifications?.filter((n) => !n.read).length || 0;

  const renderTypeIcon = (notification) => {
    const unread = !notification.read;
    const dim = unread ? "" : "opacity-70";
    switch (notification.type) {
      case "follow":
        return <LuUser className={`h-6 w-6 ${dim}`} strokeWidth={2} />;
      case "comment":
        return <LuMessageCircle className={`h-6 w-6 ${dim}`} strokeWidth={2} />;
      case "retweet":
      case "quote_retweet":
        return <BiRepost className={`h-6 w-6 ${dim}`} />;
      case "mention":
        return <LuMessageCircle className={`h-6 w-6 ${dim}`} strokeWidth={2} />;
      case "message_request":
        return <LuMessageSquare className={`h-6 w-6 ${dim}`} strokeWidth={2} />;
      default:
        return <LuHeart className={`h-6 w-6 ${dim}`} strokeWidth={2} fill="currentColor" />;
    }
  };

  const messageFor = (n) => {
    if (n.type === "follow") return "seni takip etti";
    if (n.type === "comment") return "gönderine yorum yaptı";
    if (n.type === "retweet") return "gönderini retweet etti";
    if (n.type === "quote_retweet") return "gönderini alıntı retweet etti";
    if (n.type === "mention") return "senden bahsetti";
    if (n.type === "message_request") return "sana bir mesaj isteği gönderdi";
    return "gönderini beğendi";
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-base-200/35 via-base-100 to-base-100 pb-20 dark:from-base-300/15 lg:pb-0">
      <header className="sticky top-0 z-30 border-b border-base-300/45 bg-base-100/90 shadow-sm backdrop-blur-xl">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-3 px-4 py-3 sm:px-5">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="btn btn-circle btn-ghost btn-sm shrink-0"
              aria-label="Geri"
            >
              <FaArrowLeft className="h-5 w-5" />
            </button>
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-accent/12 text-accent ring-1 ring-accent/15">
                <LuBell className="h-5 w-5" strokeWidth={2.25} />
              </div>
              <div className="min-w-0">
                <h1 className="text-lg font-bold tracking-tight text-base-content">Bildirimler</h1>
                <p className="truncate text-xs text-base-content/50 sm:text-sm">
                  {unreadCount > 0 ? (
                    <span className="font-medium text-accent">{unreadCount} okunmamış</span>
                  ) : (
                    "Hepsi güncel"
                  )}
                </p>
              </div>
            </div>
          </div>

          <div className="dropdown dropdown-end">
            <div
              tabIndex={0}
              role="button"
              className="btn btn-circle btn-ghost btn-sm border border-base-300/40"
              aria-label="Bildirim seçenekleri"
            >
              <LuSettings className="h-5 w-5" />
            </div>
            <ul
              tabIndex={0}
              className="dropdown-content z-[90] mt-2 min-w-[14rem] overflow-hidden rounded-2xl border border-base-300/50 bg-base-100/98 p-1.5 shadow-2xl ring-1 ring-black/5 backdrop-blur-xl dark:bg-base-200/95 dark:ring-white/10"
            >
              {unreadCount > 0 && (
                <li>
                  <button
                    type="button"
                    onClick={() => markAllAsRead()}
                    disabled={isMarkingRead}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition hover:bg-accent/10 hover:text-accent disabled:opacity-50"
                  >
                    <LuCheckCheck className="h-5 w-5 shrink-0" />
                    Tümünü okundu işaretle
                  </button>
                </li>
              )}
              <li>
                <button
                  type="button"
                  onClick={() => deleteNotifications()}
                  disabled={isDeleting}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-error transition hover:bg-error/10 disabled:opacity-50"
                >
                  <LuTrash2 className="h-5 w-5 shrink-0" />
                  Tümünü sil
                </button>
              </li>
            </ul>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-5 sm:px-5 sm:py-6">
        {isLoading && (
          <div className="flex flex-col gap-3">
            <NotificationSkeleton />
            <NotificationSkeleton />
            <NotificationSkeleton />
            <NotificationSkeleton />
          </div>
        )}

        {!isLoading && notifications?.length === 0 && (
          <div className="flex flex-col items-center justify-center px-4 py-20 text-center sm:py-24">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-accent/25 via-accent/10 to-transparent ring-1 ring-accent/20">
              <LuSparkles className="h-10 w-10 text-accent" strokeWidth={1.5} />
            </div>
            <h2 className="text-xl font-bold tracking-tight text-base-content">Henüz bildirim yok</h2>
            <p className="mt-2 max-w-sm text-sm leading-relaxed text-base-content/55">
              Beğeni, yorum, takip ve mesajlar burada görünecek.
            </p>
          </div>
        )}

        {!isLoading && notifications && notifications.length > 0 && (
          <ul className="flex flex-col gap-3">
            {notifications.map((notification) => {
              const unread = !notification.read;
              const shell = iconShell(notification.type);
              return (
                <li
                  key={notification._id}
                  className={`group relative overflow-hidden rounded-2xl border transition-all duration-200 ${
                    unread
                      ? "border-accent/25 bg-accent/[0.06] shadow-sm ring-1 ring-accent/10"
                      : "border-base-300/45 bg-base-100/80 hover:border-base-300/70 hover:shadow-md"
                  }`}
                >
                  {unread && (
                    <span
                      className="absolute left-0 top-0 h-full w-1 rounded-r-full bg-accent"
                      aria-hidden
                    />
                  )}
                  <div className="flex items-center gap-3 p-3.5 pl-4 sm:gap-4 sm:p-4">
                    <Link
                      to={getNotificationLink(notification)}
                      className="flex min-w-0 flex-1 items-center gap-3 sm:gap-4"
                    >
                      <div
                        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${shell}`}
                      >
                        {renderTypeIcon(notification)}
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
                          <span className="font-bold text-base-content">
                            {notification.from?.fullname || notification.from?.username}
                          </span>{" "}
                          <span className="font-normal">{messageFor(notification)}</span>
                        </p>
                        {notification.createdAt && (
                          <p className="mt-1 text-xs text-base-content/45">{formatNotifTime(notification.createdAt)}</p>
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
                        deleteSingleNotification(notification._id);
                      }}
                      disabled={isDeletingSingle}
                      className="btn btn-circle btn-ghost btn-sm shrink-0 text-base-content/40 opacity-100 transition hover:bg-error/10 hover:text-error sm:opacity-0 sm:group-hover:opacity-100"
                      title="Bildirimi sil"
                    >
                      <LuX className="h-5 w-5" />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </main>
    </div>
  );
};

export default NotificationPage;
