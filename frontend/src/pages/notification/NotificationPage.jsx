import { Link, useNavigate } from "react-router-dom";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { LuHeart, LuSettings, LuUser } from "react-icons/lu";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import defaultProfilePicture from "../../assets/avatar-placeholder.png";
import { FaArrowLeft } from "react-icons/fa";
import { getNotifications, deleteAllNotifications } from "../../api/notifications";

const NotificationPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: notifications, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: getNotifications,
  });

  const { mutate: deleteNotifications } = useMutation({
    mutationFn: deleteAllNotifications,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast.success("Bildirimler silindi");
    },
    onError: () => {
      toast.error("Bildirimler silinemedi");
    },
  });

  return (
    <>
      <div className="flex-[4_4_0] border-l border-r border-gray-700 min-h-screen relative">
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <div className="flex items-center gap-5">
            <div
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-base-100 cursor-pointer transition-all rounded-full invert-25"
            >
              <FaArrowLeft />
            </div>
            <p className="font-bold">Bildirimler</p>
          </div>
          <div className="dropdown">
            <div tabIndex={0} role="button" className="m-1">
              <LuSettings className="size-5 cursor-pointer" />
            </div>
            <ul
              tabIndex={0}
              className="dropdown-content z-[1] menu p-2 shadow-lg bg-base-300 rounded-box w-52 absolute top-5 right-1"
            >
              <li>
                <a onClick={deleteNotifications}>Tüm bildirimleri sil</a>
              </li>
            </ul>
          </div>
        </div>
        {isLoading && (
          <div className="flex justify-center h-full items-center">
            <LoadingSpinner size="lg" />
          </div>
        )}
        {notifications?.length === 0 && (
          <div className="text-center p-4 font-bold">Hiç bildirim yok. 🤔</div>
        )}
        {notifications?.map((notification) => (
          <div className="border-b border-gray-700" key={notification._id}>
            <div className="flex gap-2 p-4">
              {notification.type === "follow" && (
                <LuUser className="w-7 h-7 text-indigo-500" />
              )}
              {notification.type === "like" && (
                <LuHeart className="w-7 h-7 text-red-500" />
              )}
              <Link to={`/profile/${notification.from.username}`}>
                <div className="avatar">
                  <div className="w-8 rounded-full">
                    <img
                      src={
                        notification.from.profileImg || defaultProfilePicture
                      }
                    />
                  </div>
                </div>
                <div className="flex gap-1">
                  <span className="font-bold">
                    @{notification.from.username}
                  </span>{" "}
                  {notification.type === "follow"
                    ? "seni takip etti"
                    : "gönderini beğendi"}
                </div>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};
export default NotificationPage;
