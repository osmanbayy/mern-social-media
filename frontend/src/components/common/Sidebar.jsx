import {
  LuBell,
  LuUser,
  LuSquarePlus,
  LuHouse,
  LuLogOut,
  LuBookmark,
  LuSettings,
  LuMenu,
  LuEyeOff,
} from "react-icons/lu";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import OSSvg from "../svgs/OS";
import defaultProfilePicture from "../../assets/avatar-placeholder.png";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useEffect, useState } from "react";
import { GoDotFill } from "react-icons/go";
import LogoutDialog from "../modals/LogoutDialog";
import { logout } from "../../api/auth";

const Sidebar = () => {
  const [activeTab, setActiveTab] = useState("home");

  const navigate = useNavigate();
  const theme = localStorage.getItem("theme");

  const queryClient = useQueryClient();
  const { mutate: logoutMutation } = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      toast.success("Çıkış yapıldı.");
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
      window.location.reload();
    },
    onError: (error) => {
      console.error("Çıkış hatası:", error.message);
      toast.error(error.message || "Çıkış sırasında hata oluştu.");
    },
  });

  const { data: authUser } = useQuery({ queryKey: ["authUser"] });

  useEffect(() => {
    if (!authUser) {
      <Navigate to={"/login"} />;
    }
  }, [authUser]);

  const { data: notifications } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      try {
        const response = await fetch("/api/notifications");
        const data = await response.json();
        if (!response.ok)
          throw new Error(data.message || "Bir şeyler yanlış gitti");
        return data;
      } catch (error) {
        throw new Error(error);
      }
    },
  });

  const isNotRead = notifications?.map((item) => item?.read).includes(false);

  const location = useLocation();
  const isSettingPage = location.pathname === "/settings";
  
  // Mobil navigation için aktif sayfa tespiti
  const isHomeActive = location.pathname === "/";
  const isCreatePostActive = location.pathname === "/create-post";
  const isNotificationsActive = location.pathname === "/notifications";
  const isProfileActive = location.pathname === `/profile/${authUser?.username}`;

  return (
    <>
      {/* Sidebar - For Tablet and Desktop */}
      <div
        className={`hidden md:flex flex-[2_2_0] ${
          isSettingPage ? "min-w-18 md:min-w-52" : "max-w-18 md:max-w-52"
        }`}
      >
        <div className="sticky top-0 left-0 h-screen flex flex-col border-r border-base-300/50 bg-base-100/80 backdrop-blur-sm w-18 md:w-full">
          <Link to="/" className="flex justify-center md:justify-start mb-12">
            <OSSvg
              onClick={() =>
                queryClient.invalidateQueries({
                  queryKey: ["posts"],
                })
              }
              className="px-2 w-12 h-12 rounded-full"
            />
          </Link>

          <div className="items-center flex gap-2 flex-col mb-16">
            <div>
              <Link to={`/profile/${authUser?.username}`}>
                <img
                  src={authUser.profileImage || defaultProfilePicture}
                  alt=""
                  className="object-cover w-32 h-32 rounded-full border-4 border-base-300 shadow-lg hover:shadow-xl transition-shadow duration-300"
                />
              </Link>
            </div>
            <div className=" w-full flex flex-col items-center gap-2">
              <p>{authUser?.fullname}</p>
              <p className="whitespace-nowrap">{authUser?.bio}</p>
              <div className="flex gap-2">
                <p className="text-sm">
                  <span className="text-base-100 invert">
                    {authUser?.following.length || 0}
                  </span>{" "}
                  Takip
                </p>
                <p className="text-sm">
                  <span className="text-base-100 invert">
                    {authUser?.followers.length || 0}
                  </span>{" "}
                  Takipçi
                </p>
              </div>
            </div>
          </div>

          <ul className="flex flex-col gap-2 mt-4 mr-2">
            <li
              onClick={() => setActiveTab("home")}
              className={`flex justify-center md:justify-start w-full rounded-xl transition-all duration-300 ${
                activeTab === "home" 
                  ? "bg-primary/10 text-primary" 
                  : "hover:bg-base-200/50 text-base-content/70"
              }`}
            >
              <Link
                to="/"
                className="flex gap-3 items-center rounded-xl duration-300 py-3 pl-3 pr-4 max-w-fit cursor-pointer w-full"
              >
                <LuHouse className="w-6 h-6" />
                <span className="text-base font-medium hidden md:block">Anasayfa</span>
              </Link>
            </li>
            <li
              onClick={() => setActiveTab("notifications")}
              className={`flex justify-center md:justify-start w-full rounded-xl transition-all duration-300 ${
                activeTab === "notifications" 
                  ? "bg-primary/10 text-primary" 
                  : "hover:bg-base-200/50 text-base-content/70"
              }`}
            >
              <Link
                to="/notifications"
                className="relative flex gap-3 items-center rounded-xl duration-300 py-3 pl-3 pr-4 max-w-fit cursor-pointer w-full"
              >
                <LuBell className="w-6 h-6" />
                {isNotRead && (
                  <GoDotFill className="absolute top-2 left-3 w-2 h-2 fill-primary animate-pulse" />
                )}
                <span className="text-base font-medium hidden md:block">Bildirimler</span>
              </Link>
            </li>
            <li
              onClick={() => setActiveTab("savedPosts")}
              className={`flex justify-center md:justify-start w-full rounded-xl transition-all duration-300 ${
                activeTab === "savedPosts" 
                  ? "bg-primary/10 text-primary" 
                  : "hover:bg-base-200/50 text-base-content/70"
              }`}
            >
              <Link
                to={`/saved-posts`}
                className="flex gap-3 items-center rounded-xl duration-300 py-3 pl-3 pr-4 max-w-fit cursor-pointer w-full"
              >
                <LuBookmark className="w-6 h-6" />
                <span className="text-base font-medium hidden md:block">Kaydedilenler</span>
              </Link>
            </li>
            <li
              onClick={() => setActiveTab("hiddenPosts")}
              className={`flex justify-center md:justify-start w-full rounded-xl transition-all duration-300 ${
                activeTab === "hiddenPosts" 
                  ? "bg-primary/10 text-primary" 
                  : "hover:bg-base-200/50 text-base-content/70"
              }`}
            >
              <Link
                to={`/hidden-posts`}
                className="flex gap-3 items-center rounded-xl duration-300 py-3 pl-3 pr-4 max-w-fit cursor-pointer w-full"
              >
                <LuEyeOff className="w-6 h-6" />
                <span className="text-base font-medium hidden md:block">Gizlenenler</span>
              </Link>
            </li>
            <li
              onClick={() => setActiveTab("profile")}
              className={`flex justify-center md:justify-start w-full rounded-xl transition-all duration-300 ${
                activeTab === "profile" 
                  ? "bg-primary/10 text-primary" 
                  : "hover:bg-base-200/50 text-base-content/70"
              }`}
            >
              <Link
                to={`/profile/${authUser?.username}`}
                className="flex gap-3 items-center rounded-xl duration-300 py-3 pl-3 pr-4 max-w-fit cursor-pointer w-full"
              >
                <LuUser className="w-6 h-6" />
                <span className="text-base font-medium hidden md:block">Profil</span>
              </Link>
            </li>
            <li
              onClick={() => setActiveTab("settings")}
              className={`flex justify-center md:justify-start w-full rounded-xl transition-all duration-300 ${
                activeTab === "settings" 
                  ? "bg-primary/10 text-primary" 
                  : "hover:bg-base-200/50 text-base-content/70"
              }`}
            >
              <Link
                to={`/settings`}
                className="flex gap-3 items-center rounded-xl duration-300 py-3 pl-3 pr-4 max-w-fit cursor-pointer w-full"
              >
                <LuSettings className="w-6 h-6" />
                <span className="text-base font-medium hidden md:block">Ayarlar</span>
              </Link>
            </li>
          </ul>

          {authUser && (
            <Link
              to={`/profile/${authUser.username}`}
              className="mt-auto mb-10 flex gap-2 items-start transition-all duration-300 hover:bg-base-200 py-2 px-4 rounded-full"
            >
              <div className="avatar hidden md:inline-flex">
                <div className="w-8 rounded-full">
                  <img
                    src={authUser?.profileImage || defaultProfilePicture}
                    className="w-8 rounded-full"
                  />
                </div>
              </div>
              <div className="flex justify-between flex-1 items-center">
                <div className="hidden md:block">
                  <p className="text-base-100 invert font-bold text-sm w-20 truncate">
                    {authUser?.fullname}
                  </p>
                  <p className="text-slate-500 text-sm">
                    @{authUser?.username}
                  </p>
                </div>
                <LuLogOut
                  title="Çıkış Yap"
                  className="w-5 h-5 cursor-pointer"
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById("logout_modal").showModal();
                  }}
                />
              </div>
            </Link>
          )}
        </div>
      </div>

      {/* Bottom Navigation - For Mobile */}
      <div className="md:hidden z-10 fixed bottom-0 left-0 w-full bg-base-100/80 backdrop-blur-xl border-t border-base-300/50 py-4 rounded-t-3xl shadow-2xl flex justify-around items-center">
        <Link 
          to="/" 
          className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
            isHomeActive ? "text-indigo-600" : "hover:bg-gray-700"
          }`}
        >
          <LuHouse className="w-7 h-7" />
        </Link>
        <Link 
          to="/create-post" 
          className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
            isCreatePostActive ? "text-indigo-600" : "hover:bg-gray-700"
          }`}
        >
          <LuSquarePlus className="w-7 h-7" />
        </Link>
        <Link
          to="/notifications"
          className={`relative flex flex-col items-center p-2 rounded-lg transition-colors ${
            isNotificationsActive ? "text-indigo-600" : "hover:bg-gray-700"
          }`}
        >
          <LuBell className="w-7 h-7" />
          {isNotRead && (
            <GoDotFill className="absolute top-0 left-5 text-lg fill-green-500" />
          )}
        </Link>
        <Link
          to={`/profile/${authUser.username}`}
          className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
            isProfileActive ? "text-indigo-600" : "hover:bg-gray-700"
          }`}
        >
          <LuUser className="w-7 h-7" />
        </Link>
        <div className="dropdown dropdown-top dropdown-end">
          <LuMenu className="w-7 h-7" tabIndex={0} role="button" />
          <ul
            tabIndex={0}
            className={`dropdown-content menu bg-base-100 border border-gray-600 rounded-box z-1 w-52 p-2 shadow-lg ${
              theme === "fantasy" ? "shadow-black/20" : "shadow-white/10"
            } `}
          >
            <li>
              <Link to={`/settings`} className="flex items-center gap-2">
                <LuSettings className="w-5 h-5" />
                <span>Ayarlar</span>
              </Link>
            </li>
            <li>
              <Link to={`/saved-posts`} className="flex items-center gap-2">
                <LuBookmark className="w-5 h-5" />
                <span>Kaydedilenler</span>
              </Link>
            </li>
            <li>
              <Link to={`/hidden-posts`} className="flex items-center gap-2">
                <LuEyeOff className="w-5 h-5" />
                <span>Gizlenenler</span>
              </Link>
            </li>
            <li>
              <div
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById("logout_modal").showModal();
                  navigate("/login");
                }}
                className="flex items-center gap-2 cursor-pointer"
              >
                <LuLogOut className="w-5 h-5" />
                Çıkış Yap
              </div>
            </li>
          </ul>
        </div>
      </div>

      <LogoutDialog handleLogout={logoutMutation} />
    </>
  );
};

export default Sidebar;
