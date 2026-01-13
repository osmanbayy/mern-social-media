import { Link } from "react-router-dom";
import { LuBell, LuUser, LuBookmark, LuSettings, LuHouse, LuLogOut, LuEyeOff } from "react-icons/lu";
import { GoDotFill } from "react-icons/go";
import OSSvg from "../svgs/OS";
import defaultProfilePicture from "../../assets/avatar-placeholder.png";
import { useQueryClient } from "@tanstack/react-query";

const DesktopSidebar = ({ authUser, activeTab, setActiveTab, isNotRead, isSettingPage }) => {
  const theme = localStorage.getItem("theme");
  const isDark = (theme || "").toLowerCase() === "dark";
  const queryClient = useQueryClient();

  const navItems = [
    { id: "home", path: "/", icon: LuHouse, label: "Anasayfa" },
    { id: "notifications", path: "/notifications", icon: LuBell, label: "Bildirimler", hasBadge: isNotRead },
    { id: "savedPosts", path: "/saved-posts", icon: LuBookmark, label: "Kaydedilenler" },
    { id: "hiddenPosts", path: "/hidden-posts", icon: LuEyeOff, label: "Gizlenenler" },
    { id: "profile", path: `/profile/${authUser?.username}`, icon: LuUser, label: "Profil" },
    { id: "settings", path: "/settings", icon: LuSettings, label: "Ayarlar" },
  ];

  return (
    <div
      className={`hidden md:flex flex-[2_2_0] flex-shrink-0 ${
        isSettingPage ? "min-w-18 md:min-w-52" : "max-w-18 md:max-w-52"
      }`}
    >
      <div className="sticky top-0 h-screen flex flex-col border-r border-base-300/50 bg-base-100/80 backdrop-blur-sm w-18 md:w-full">
        <Link to="/" className="flex justify-center md:justify-start mb-12">
          <OSSvg
            onClick={() => queryClient.invalidateQueries({ queryKey: ["posts"] })}
            className="px-2 w-12 h-12 rounded-full"
          />
        </Link>

        <div className="items-center flex gap-2 flex-col mb-16">
          <div>
            <Link to={`/profile/${authUser?.username}`}>
              <img
                src={authUser?.profileImage || defaultProfilePicture}
                alt=""
                className={`object-cover w-32 h-32 rounded-full border-4 transition-shadow duration-300 ${
                  isDark
                    ? "border-white/25 shadow-[0_8px_32px_rgba(255,255,255,0.1),0_4px_16px_rgba(0,0,0,0.5)] hover:shadow-[0_12px_40px_rgba(255,255,255,0.15),0_6px_20px_rgba(0,0,0,0.6)]"
                    : "border-base-300 shadow-[0_4px_16px_rgba(0,0,0,0.1),0_2px_8px_rgba(0,0,0,0.05)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.12),0_3px_10px_rgba(0,0,0,0.08)]"
                }`}
              />
            </Link>
          </div>
          <div className="w-full flex flex-col items-center gap-2">
            <p>{authUser?.fullname}</p>
            <p className="whitespace-nowrap">{authUser?.bio}</p>
            <div className="flex gap-2">
              <p className="text-sm">
                <span className="text-base-100 invert">{authUser?.following.length || 0}</span> Takip
              </p>
              <p className="text-sm">
                <span className="text-base-100 invert">{authUser?.followers.length || 0}</span> Takipçi
              </p>
            </div>
          </div>
        </div>

        <ul className="flex flex-col gap-2 mt-4 mr-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <li
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex justify-center md:justify-start w-full rounded-xl transition-all duration-300 ${
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "hover:bg-base-200/50 text-base-content/70"
                }`}
              >
                <Link
                  to={item.path}
                  className="relative flex gap-3 items-center rounded-xl duration-300 py-3 pl-3 pr-4 max-w-fit cursor-pointer w-full"
                >
                  <Icon className="w-6 h-6" />
                  {item.hasBadge && (
                    <GoDotFill className="absolute top-2 left-3 w-2 h-2 fill-primary animate-pulse" />
                  )}
                  <span className="text-base font-medium hidden md:block">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>

        {authUser && (
          <Link
            to={`/profile/${authUser.username}`}
            className="mt-auto mb-10 flex gap-2 items-start transition-all duration-300 hover:bg-base-200 py-2 px-4 rounded-full"
          >
            <div className="avatar hidden md:inline-flex">
              <div
                className={`w-8 rounded-full overflow-hidden border transition-shadow duration-300 ${
                  isDark
                    ? "border-white/25 shadow-[0_2px_8px_rgba(255,255,255,0.1),0_1px_4px_rgba(0,0,0,0.4)]"
                    : "border-base-300 shadow-[0_2px_6px_rgba(0,0,0,0.1),0_1px_3px_rgba(0,0,0,0.05)]"
                }`}
              >
                <img
                  src={authUser?.profileImage || defaultProfilePicture}
                  className="w-8 h-8 object-cover"
                  alt={authUser?.fullname}
                />
              </div>
            </div>
            <div className="flex justify-between flex-1 items-center">
              <div className="hidden md:block">
                <p className="text-base-100 invert font-bold text-sm w-20 truncate">
                  {authUser?.fullname}
                </p>
                <p className="text-slate-500 text-sm">@{authUser?.username}</p>
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
  );
};

export default DesktopSidebar;
