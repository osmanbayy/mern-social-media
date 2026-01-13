import { Link, useLocation } from "react-router-dom";
import { LuBell, LuUser, LuSearch, LuHouse, LuMenu } from "react-icons/lu";
import defaultProfilePicture from "../../assets/avatar-placeholder.png";

const MobileBottomNav = ({ authUser, isNotRead, onMenuClick }) => {
  const location = useLocation();
  const isHomeActive = location.pathname === "/";
  const isSearchActive = location.pathname.startsWith("/search");
  const isNotificationsActive = location.pathname === "/notifications";
  const isProfileActive = location.pathname === `/profile/${authUser?.username}`;

  const NavItem = ({ to, isActive, icon: Icon, children, badge }) => (
    <Link
      to={to}
      className="relative flex flex-col items-center justify-center min-w-[60px] py-2 rounded-2xl transition-all duration-300 group"
    >
      <div
        className={`absolute inset-0 rounded-2xl transition-all duration-300 ${
          isActive
            ? "bg-primary/15 scale-100"
            : "bg-transparent scale-95 group-active:scale-100 group-active:bg-base-200/50"
        }`}
      />
      <div className="relative">
        {typeof Icon === "function" ? (
          <Icon
            className={`w-6 h-6 transition-all duration-300 ${
              isActive ? "text-primary scale-110" : "text-base-content/60 group-active:scale-105"
            }`}
          />
        ) : (
          Icon
        )}
        {badge && (
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-base-100 animate-pulse" />
        )}
      </div>
      {isActive && (
        <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
      )}
    </Link>
  );

  return (
    <div className="md:hidden z-50 fixed bottom-0 left-0 w-full bg-base-100/95 backdrop-blur-2xl border-t border-base-300/30 shadow-[0_-4px_20px_rgba(0,0,0,0.1)]">
      <div className="flex justify-around items-center px-2 py-2.5 safe-area-bottom">
        <NavItem to="/" isActive={isHomeActive} icon={LuHouse} />
        <NavItem to="/search" isActive={isSearchActive} icon={LuSearch} />
        <NavItem
          to="/notifications"
          isActive={isNotificationsActive}
          icon={LuBell}
          badge={isNotRead}
        />
        <NavItem
          to={`/profile/${authUser?.username}`}
          isActive={isProfileActive}
          icon={
            authUser?.profileImage ? (
              <div
                className={`relative w-6 h-6 rounded-full overflow-hidden border-2 transition-all duration-300 ${
                  isProfileActive ? "border-primary scale-110" : "border-base-300"
                }`}
              >
                <img
                  src={authUser.profileImage || defaultProfilePicture}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              LuUser
            )
          }
        />
        <button
          onClick={onMenuClick}
          className="relative flex flex-col items-center justify-center min-w-[60px] py-2 rounded-2xl transition-all duration-300 group active:bg-base-200/50"
        >
          <LuMenu className="w-6 h-6 text-base-content/60 transition-all duration-300 group-active:scale-105" />
        </button>
      </div>
    </div>
  );
};

export default MobileBottomNav;
