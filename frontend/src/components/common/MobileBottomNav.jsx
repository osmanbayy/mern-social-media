import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { LuBell, LuUser, LuSearch, LuHouse, LuMessageSquare } from "react-icons/lu";
import defaultProfilePicture from "../../assets/avatar-placeholder.png";
import OSSvg from "../svgs/OS";
import { invalidatePostsFeed } from "../../utils/queryInvalidation";

const SCROLL_DELTA = 6;
const TOP_REVEAL_PX = 48;

const MobileBottomNav = ({ authUser, isNotRead, onMenuClick }) => {
  const location = useLocation();
  const queryClient = useQueryClient();
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
  const isMessagesActive = location.pathname.startsWith("/messages");
  const isNotificationsActive = location.pathname === "/notifications";
  const isProfileActive = location.pathname === `/profile/${authUser?.username}`;

  const hideOnMessages = location.pathname.startsWith("/messages");

  if (hideOnMessages) {
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
    <>
      <header
        className={`md:hidden fixed top-0 left-0 right-0 z-40 border-b border-base-300/60 bg-base-100/95 backdrop-blur-md pt-[env(safe-area-inset-top)] transform-gpu will-change-[transform,opacity] transition-[transform,opacity] duration-500 ease-[cubic-bezier(0.33,1,0.68,1)] ${
          isVisible
            ? "translate-y-0 opacity-100 pointer-events-auto"
            : "-translate-y-[calc(100%+0.375rem)] opacity-0 pointer-events-none"
        }`}
      >
        <div className="grid h-[3.75rem] grid-cols-[2.25rem_1fr_2.25rem] items-center gap-2 px-3">
          <button
            type="button"
            onClick={onMenuClick}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full ring-2 ring-base-300/80 overflow-hidden transition-transform active:scale-95 touch-manipulation"
            aria-label="Menüyü aç"
          >
            <img
              src={authUser?.profileImage || defaultProfilePicture}
              alt=""
              className="h-full w-full object-cover"
            />
          </button>

          <Link
            to="/"
            className="flex min-w-0 items-center justify-center gap-2"
            onClick={() => invalidatePostsFeed(queryClient)}
          >
            <OSSvg className="h-8 w-8 shrink-0 rounded-full" />
            <span className="mobile-header-brand text-base-content truncate leading-none">
              OnSekiz
            </span>
          </Link>

          <div className="h-9 w-9 shrink-0" aria-hidden />
        </div>
      </header>

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
              to="/messages"
              isActive={isMessagesActive}
              icon={LuMessageSquare}
            />
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
          </div>
        </nav>
      </div>
    </>
  );
};

export default MobileBottomNav;
