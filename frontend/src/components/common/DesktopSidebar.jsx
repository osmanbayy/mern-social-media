import { Link, useLocation } from "react-router-dom";
import { LuLogOut, LuEllipsis, LuChevronRight } from "react-icons/lu";
import OSSvg from "../svgs/OS";
import defaultProfilePicture from "../../assets/avatar-placeholder.png";
import VerifiedBadge from "./VerifiedBadge";
import { useQueryClient } from "@tanstack/react-query";
import { getNavItems, DESKTOP_MORE_NAV_ITEMS } from "../../constants/navItems";
import { useTheme } from "../../contexts/ThemeContext";

const isMainItemActive = (item, pathname, username) => {
  if (item.id === "home") return pathname === "/";
  if (item.id === "messages") return pathname.startsWith("/messages");
  if (item.id === "notifications") return pathname === "/notifications";
  if (item.id === "profile" && username) {
    return pathname.startsWith(`/profile/${username}`);
  }
  if (item.id === "settings") return pathname === "/settings";
  return false;
};

const isMoreItemActive = (pathname) =>
  pathname === "/saved-posts" || pathname === "/hidden-posts";

const DesktopSidebar = ({ authUser, isNotRead, isSettingPage, onLogoutClick }) => {
  const { theme } = useTheme();
  const isDark = (theme || "").toLowerCase() === "dark";
  const queryClient = useQueryClient();
  const location = useLocation();
  const pathname = location.pathname;
  const username = authUser?.username;

  const navItems = getNavItems(authUser, isNotRead);
  const moreActive = isMoreItemActive(pathname);

  const sidebarWidth = isSettingPage ? "md:w-56 lg:w-60" : "md:w-56 lg:w-60";

  return (
    <aside
      className={`hidden shrink-0 md:flex ${sidebarWidth} xl:w-[15.5rem]`}
    >
      <div
        className={`sticky top-0 z-20 flex h-screen w-full flex-col border-r border-base-300/45 bg-gradient-to-b from-base-100 via-base-100 to-base-200/35 backdrop-blur-xl dark:to-base-300/25`}
      >
        <div className="flex flex-1 flex-col px-3 pb-4 pt-5">
          {/* Logo */}
          <Link
            to="/"
            className="group mb-5 flex items-center gap-2 rounded-2xl px-2 py-1.5 transition hover:bg-base-200/50"
            onClick={() => queryClient.invalidateQueries({ queryKey: ["posts"] })}
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-base-200/50 ring-1 ring-base-300/60 transition group-hover:ring-accent/35">
              <OSSvg className="h-8 w-8" />
            </div>
            <span className="desktop-sidebar-label hidden text-2xl font-bold tracking-wider text-base-content lg:inline">
              OnSekiz
            </span>
          </Link>

          {/* Kompakt profil */}
          <Link
            to={`/profile/${authUser?.username}`}
            className="mb-6 flex gap-3 rounded-2xl border border-base-300/50 bg-base-100/70 p-3 shadow-sm ring-1 ring-black/[0.03] transition hover:border-accent/30 hover:shadow-md dark:bg-base-200/20 dark:ring-white/5"
          >
            <div className="avatar shrink-0">
              <div
                className={`h-12 w-12 rounded-full ring-2 ring-offset-2 ring-offset-base-100 ${
                  isDark ? "ring-white/20" : "ring-base-300/80"
                }`}
              >
                <img
                  src={authUser?.profileImage || defaultProfilePicture}
                  alt=""
                  className="h-full w-full rounded-full object-cover"
                />
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex min-w-0 items-center gap-1">
                <p className="truncate text-sm font-bold leading-tight text-base-content">
                  {authUser?.fullname}
                </p>
                <VerifiedBadge user={authUser} size="sm" />
              </div>
              <p className="truncate text-xs text-base-content/50">@{authUser?.username}</p>
              {authUser?.bio && (
                <p className="mt-1 line-clamp-2 text-[11px] leading-snug text-base-content/45">
                  {authUser.bio}
                </p>
              )}
              <div className="mt-2 flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] text-base-content/55">
                <span>
                  <strong className="font-semibold text-base-content">
                    {authUser?.following?.length ?? 0}
                  </strong>{" "}
                  takip
                </span>
                <span>
                  <strong className="font-semibold text-base-content">
                    {authUser?.followers?.length ?? 0}
                  </strong>{" "}
                  takipçi
                </span>
              </div>
            </div>
          </Link>

          {/* Ana navigasyon */}
          <nav className="flex flex-col gap-1" aria-label="Ana menü">
            <ul className="flex flex-col gap-0.5">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = isMainItemActive(item, pathname, username);
                return (
                  <li key={item.id}>
                    <Link
                      to={item.path}
                      className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-200 ${
                        isActive
                          ? "bg-accent/12 font-semibold text-accent shadow-sm ring-1 ring-accent/15"
                          : "text-base-content/70 hover:bg-base-200/55 hover:text-base-content"
                      }`}
                    >
                      <span
                        className={`absolute left-0 top-1/2 hidden h-8 w-1 -translate-y-1/2 rounded-full bg-accent lg:block ${
                          isActive ? "opacity-100" : "opacity-0"
                        }`}
                        aria-hidden
                      />
                      <span className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-base-200/40 transition group-hover:bg-base-200/80">
                        <Icon className="h-[1.35rem] w-[1.35rem] shrink-0" strokeWidth={isActive ? 2.25 : 2} />
                        {item.hasBadge && (
                          <span className="absolute right-0.5 top-0.5 h-2 w-2 rounded-full bg-error shadow-sm ring-2 ring-base-100" />
                        )}
                      </span>
                      <span className="truncate text-[15px]">{item.label}</span>
                    </Link>
                  </li>
                );
              })}

              <li className="relative">
                <div className="dropdown dropdown-end dropdown-top w-full">
                  <div
                    tabIndex={0}
                    role="button"
                    className={`relative flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-200 ${
                      moreActive
                        ? "bg-accent/12 font-semibold text-accent shadow-sm ring-1 ring-accent/15"
                        : "text-base-content/70 hover:bg-base-200/55 hover:text-base-content"
                    }`}
                  >
                    <span
                      className={`absolute left-0 top-1/2 hidden h-8 w-1 -translate-y-1/2 rounded-full bg-accent lg:block ${
                        moreActive ? "opacity-100" : "opacity-0"
                      }`}
                    />
                    <span className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-base-200/40">
                      <LuEllipsis className="h-[1.35rem] w-[1.35rem]" strokeWidth={moreActive ? 2.25 : 2} />
                    </span>
                    <span className="truncate text-[15px]">Daha fazla</span>
                  </div>
                  <ul
                    tabIndex={0}
                    className="dropdown-content z-[90] mb-2 min-w-[15rem] overflow-hidden rounded-2xl border border-base-300/50 bg-base-100/98 p-0 shadow-[0_12px_40px_-8px_rgba(0,0,0,0.25)] ring-1 ring-black/5 backdrop-blur-xl dark:bg-base-200/95 dark:ring-white/10"
                  >
                    <li className="pointer-events-none border-b border-base-300/40 bg-gradient-to-r from-accent/10 via-base-200/20 to-transparent px-3 py-2.5 dark:from-accent/15 dark:via-base-300/30">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-base-content/50">
                        Koleksiyon
                      </p>
                      <p className="mt-0.5 text-xs text-base-content/45">Kayıtlı ve gizlediğin gönderiler</p>
                    </li>
                    <li className="p-1.5">
                      <ul className="flex flex-col gap-0.5">
                        {DESKTOP_MORE_NAV_ITEMS.map((sub) => {
                          const SubIcon = sub.icon;
                          const subActive = pathname === sub.path;
                          return (
                            <li key={sub.id}>
                              <Link
                                to={sub.path}
                                className={`group flex items-center justify-between gap-2 rounded-xl px-2.5 py-2.5 transition-colors ${
                                  subActive
                                    ? "bg-accent/12 font-semibold text-accent ring-1 ring-accent/20"
                                    : "text-base-content/80 hover:bg-base-200/70 hover:text-base-content"
                                }`}
                              >
                                <span className="flex min-w-0 items-center gap-3">
                                  <span
                                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors ${
                                      subActive
                                        ? "bg-accent/15 text-accent"
                                        : "bg-base-200/60 text-base-content/70 group-hover:bg-base-300/50 group-hover:text-base-content"
                                    }`}
                                  >
                                    <SubIcon className="h-[1.15rem] w-[1.15rem] shrink-0" strokeWidth={2} />
                                  </span>
                                  <span className="truncate text-sm">{sub.label}</span>
                                </span>
                                <LuChevronRight
                                  className={`h-4 w-4 shrink-0 transition-all ${
                                    subActive
                                      ? "text-accent"
                                      : "text-base-content/20 group-hover:translate-x-0.5 group-hover:text-base-content/45"
                                  }`}
                                />
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    </li>
                  </ul>
                </div>
              </li>
            </ul>
          </nav>

          {/* Alt: çıkış */}
          <div className="mt-auto border-t border-base-300/40 pt-4">
            <button
              type="button"
              onClick={onLogoutClick}
              className="btn btn-ghost btn-sm h-11 w-full justify-start gap-3 rounded-xl border border-transparent font-medium text-base-content/75 hover:border-base-300/50 hover:bg-error/5 hover:text-error"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-base-200/50">
                <LuLogOut className="h-[1.2rem] w-[1.2rem]" />
              </span>
              Çıkış yap
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default DesktopSidebar;
