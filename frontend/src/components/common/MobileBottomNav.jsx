import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { LuBell, LuUser, LuSearch, LuHouse, LuMenu } from "react-icons/lu";
import defaultProfilePicture from "../../assets/avatar-placeholder.png";

const SCROLL_DELTA = 6;
const TOP_REVEAL_PX = 48;

const MobileBottomNav = ({ authUser, isNotRead, onMenuClick }) => {
  const location = useLocation();
  const lastScrollY = useRef(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    setIsVisible(true);
    lastScrollY.current = typeof window !== "undefined" ? window.scrollY : 0;
  }, [location.pathname]);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      const delta = y - lastScrollY.current;

      if (y <= TOP_REVEAL_PX) {
        setIsVisible(true);
      } else if (Math.abs(delta) >= SCROLL_DELTA) {
        setIsVisible(delta < 0);
      }

      lastScrollY.current = y;
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isHomeActive = location.pathname === "/";
  const isSearchActive = location.pathname.startsWith("/search");
  const isNotificationsActive = location.pathname === "/notifications";
  const isProfileActive = location.pathname === `/profile/${authUser?.username}`;

  if (location.pathname.startsWith("/messages")) {
    return null;
  }

  const NavItem = ({ to, isActive, icon: Icon, badge }) => (
    <Link
      to={to}
      className="relative flex flex-1 min-w-0 flex-col items-center justify-center py-2.5 rounded-2xl transition-all duration-300 ease-out group active:scale-95"
    >
      <span
        className={`absolute inset-x-1 inset-y-1 rounded-2xl transition-all duration-300 ease-out ${
          isActive
            ? "bg-base-200 shadow-inner"
            : "bg-transparent group-hover:bg-base-200 group-active:bg-base-300"
        }`}
      />
      <span className="relative flex items-center justify-center size-11">
        {typeof Icon === "function" ? (
          <Icon
            className={`size-[1.35rem] transition-all duration-300 ease-out ${
              isActive
                ? "text-primary scale-105"
                : "text-base-content/45 group-hover:text-base-content/75 group-active:text-base-content"
            }`}
          />
        ) : (
          Icon
        )}
        {badge && (
          <span className="absolute top-1.5 right-1.5 flex size-2.5 items-center justify-center">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-red-400 opacity-40" />
            <span className="relative size-2 rounded-full bg-gradient-to-br from-red-400 to-red-600 shadow-sm ring-2 ring-base-100" />
          </span>
        )}
      </span>
    </Link>
  );

  return (
    <div
      className={`md:hidden z-50 fixed inset-x-0 bottom-0 flex justify-center pointer-events-none transform-gpu will-change-[transform,opacity] transition-[transform,opacity] duration-500 ease-[cubic-bezier(0.33,1,0.68,1)] px-3 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 ${
        isVisible
          ? "translate-y-0 opacity-100"
          : "translate-y-[calc(100%+0.5rem)] opacity-0"
      }`}
    >
      <nav
        aria-label="Ana navigasyon"
        className={`relative w-full max-w-md overflow-hidden rounded-[1.35rem] border border-base-300 bg-base-100 shadow-[0_-4px_24px_rgba(0,0,0,0.08),0_12px_32px_-8px_rgba(0,0,0,0.12)] dark:shadow-[0_-4px_32px_rgba(0,0,0,0.45),0_12px_40px_-8px_rgba(0,0,0,0.55)] ${
          isVisible ? "pointer-events-auto" : "pointer-events-none"
        }`}
      >
        <div className="relative flex items-stretch justify-between gap-0.5 px-1 py-1">
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
                  className={`relative size-[1.35rem] rounded-full overflow-hidden transition-all duration-300 ease-out ${
                    isProfileActive
                      ? "ring-2 ring-primary ring-offset-2 ring-offset-base-100 scale-105 shadow-md"
                      : "ring-1 ring-base-300"
                  }`}
                >
                  <img
                    src={authUser.profileImage || defaultProfilePicture}
                    alt=""
                    className="size-full object-cover"
                  />
                </div>
              ) : (
                LuUser
              )
            }
          />
          <button
            type="button"
            onClick={onMenuClick}
            className="relative flex flex-1 min-w-0 flex-col items-center justify-center rounded-2xl py-2.5 transition-all duration-300 ease-out active:scale-95 group"
          >
            <span className="absolute inset-x-1 inset-y-1 rounded-2xl bg-transparent transition-colors duration-300 group-hover:bg-base-200 group-active:bg-base-300" />
            <span className="relative flex items-center justify-center size-11">
              <LuMenu className="size-[1.35rem] text-base-content/45 transition-all duration-300 group-hover:text-base-content/75 group-active:text-base-content group-active:scale-95" />
            </span>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default MobileBottomNav;
