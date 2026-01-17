import { Link, useNavigate } from "react-router-dom";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { LuHeart, LuSettings, LuUser, LuTrash2, LuCheckCheck, LuMessageCircle, LuX } from "react-icons/lu";
import { BiRepost } from "react-icons/bi";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import defaultProfilePicture from "../../assets/avatar-placeholder.png";
import { FaArrowLeft } from "react-icons/fa6";
import { getNotifications, deleteAllNotifications, markAllNotificationsAsRead, deleteNotification } from "../../api/notifications";

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
      toast.success("Tüm bildirimler okundu olarak işaretlendi");
    },
    onError: () => {
      toast.error("Bildirimler işaretlenemedi");
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

  return (
    <>
      <div className="w-full min-h-screen pb-20 lg:pb-0">
        {/* Sticky Header */}
        <div className="sticky top-0 z-20 flex justify-between items-center px-4 py-3 border-b border-base-300 bg-base-100/95 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-full hover:bg-base-200 transition-colors"
            >
              <FaArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex flex-col">
              <p className="font-bold text-lg">Bildirimler</p>
              {unreadCount > 0 && (
                <p className="text-xs text-primary font-medium">
                  {unreadCount} okunmamış
                </p>
              )}
            </div>
          </div>
          <div className="dropdown dropdown-end">
            <div
              tabIndex={0}
              role="button"
              className="p-2 rounded-full hover:bg-base-200 transition-colors cursor-pointer"
            >
              <LuSettings className="w-5 h-5" />
            </div>
            <ul
              tabIndex={0}
              className="dropdown-content menu bg-base-100/95 backdrop-blur-xl border border-base-300/50 rounded-2xl z-[100] w-56 p-2 shadow-2xl mt-2"
            >
              {unreadCount > 0 && (
                <li>
                  <button
                    onClick={() => markAllAsRead()}
                    disabled={isMarkingRead}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-base-200/50 transition-colors w-full text-left"
                  >
                    <LuCheckCheck className="w-5 h-5" />
                    <span className="font-medium">Tümünü okundu işaretle</span>
                  </button>
                </li>
              )}
              <li>
                <button
                  onClick={() => deleteNotifications()}
                  disabled={isDeleting}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-500/10 hover:text-red-500 transition-colors w-full text-left"
                >
                  <LuTrash2 className="w-5 h-5" />
                  <span className="font-medium">Tümünü sil</span>
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center h-[60vh] items-center">
            <LoadingSpinner size="lg" />
          </div>
        )}

        {/* Empty State */}
        {!isLoading && notifications?.length === 0 && (
          <div className="flex flex-col items-center justify-center h-[60vh] px-4">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-4">
              <LuHeart className="w-12 h-12 text-primary/50" />
            </div>
            <p className="text-xl font-bold mb-2">Henüz bildirim yok</p>
            <p className="text-sm text-base-content/60 text-center max-w-sm">
              Yeni bildirimler geldiğinde burada görünecek
            </p>
          </div>
        )}

        {/* Notifications List */}
        {!isLoading && notifications && notifications.length > 0 && (
          <div className="flex flex-col">
            {notifications.map((notification) => (
              <div
                key={notification._id}
                className={`relative flex items-center gap-4 px-4 py-4 border-b border-base-300/30 transition-all duration-200 group ${
                  !notification.read
                    ? "bg-primary/5 hover:bg-primary/10"
                    : "hover:bg-base-200/30"
                }`}
              >
                {/* Unread Indicator */}
                {!notification.read && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-full" />
                )}

                <Link
                  to={
                    (notification.type === "like" || notification.type === "comment" || notification.type === "retweet" || notification.type === "quote_retweet") && notification.post?._id
                      ? `/post/${notification.post._id}`
                      : `/profile/${notification.from?.username}`
                  }
                  className="flex items-center gap-4 flex-1 min-w-0"
                >
                  {/* Icon Container */}
                  <div
                    className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 ${
                      notification.type === "follow"
                        ? "bg-blue-500/10 group-hover:bg-blue-500/20"
                        : notification.type === "comment"
                        ? "bg-emerald-500/10 group-hover:bg-emerald-500/20"
                        : notification.type === "retweet" || notification.type === "quote_retweet"
                        ? "bg-green-500/10 group-hover:bg-green-500/20"
                        : "bg-red-500/10 group-hover:bg-red-500/20"
                    }`}
                  >
                    {notification.type === "follow" ? (
                      <LuUser
                        className={`w-6 h-6 transition-colors ${
                          !notification.read
                            ? "text-blue-500"
                            : "text-blue-500/70"
                        }`}
                      />
                    ) : notification.type === "comment" ? (
                      <LuMessageCircle
                        className={`w-6 h-6 transition-colors ${
                          !notification.read
                            ? "text-emerald-500"
                            : "text-emerald-500/70"
                        }`}
                      />
                    ) : notification.type === "retweet" || notification.type === "quote_retweet" ? (
                      <BiRepost
                        className={`w-6 h-6 transition-colors ${
                          !notification.read
                            ? "text-green-500 fill-green-500"
                            : "text-green-500/70 fill-green-500/30"
                        }`}
                      />
                    ) : (
                      <LuHeart
                        className={`w-6 h-6 transition-colors ${
                          !notification.read
                            ? "text-red-500 fill-red-500"
                            : "text-red-500/70 fill-red-500/30"
                        }`}
                      />
                    )}
                  </div>

                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    <div className="avatar">
                      <div className="w-12 h-12 rounded-full ring-2 ring-base-300 group-hover:ring-primary transition-all duration-200">
                        <img
                          src={
                            notification.from?.profileImage ||
                            defaultProfilePicture
                          }
                          alt={notification.from?.username}
                          className="w-full h-full object-cover rounded-full"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col gap-1">
                      <p
                        className={`text-sm leading-relaxed ${
                          !notification.read
                            ? "font-semibold text-base-content"
                            : "font-medium text-base-content/80"
                        }`}
                      >
                        <span className="font-bold">
                          {notification.from?.fullname || notification.from?.username}
                        </span>{" "}
                        {notification.type === "follow"
                          ? "seni takip etti"
                          : notification.type === "comment"
                          ? "gönderine yorum yaptı"
                          : notification.type === "retweet"
                          ? "gönderini retweet etti"
                          : notification.type === "quote_retweet"
                          ? "gönderini alıntı retweet etti"
                          : "gönderini beğendi"}
                      </p>
                      {notification.createdAt && (
                        <p className="text-xs text-base-content/50">
                          {new Date(notification.createdAt).toLocaleDateString(
                            "tr-TR",
                            {
                              day: "numeric",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Unread Badge */}
                  {!notification.read && (
                    <div className="flex-shrink-0 w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
                  )}
                </Link>

                {/* Delete Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    deleteSingleNotification(notification._id);
                  }}
                  disabled={isDeletingSingle}
                  className="flex-shrink-0 p-2 rounded-full hover:bg-red-500/10 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                  title="Bildirimi sil"
                >
                  <LuX className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};
export default NotificationPage;
