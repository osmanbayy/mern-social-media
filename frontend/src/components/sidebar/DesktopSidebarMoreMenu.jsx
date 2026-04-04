import { Link } from "react-router-dom";
import { LuEllipsis, LuChevronRight } from "react-icons/lu";
import { DESKTOP_MORE_NAV_ITEMS } from "../../constants/navItems";
import { isMoreNavSectionActive } from "../../utils/desktopSidebarNav";
import { mainNavIndicatorClasses, mainNavRowClasses, moreMenuTriggerIconShellClass } from "./desktopSidebarClasses";

export default function DesktopSidebarMoreMenu({ pathname }) {
  const moreActive = isMoreNavSectionActive(pathname);

  return (
    <li className="relative">
      <div className="dropdown dropdown-end dropdown-top w-full">
        <div tabIndex={0} role="button" className={mainNavRowClasses(moreActive)}>
          <span className={mainNavIndicatorClasses(moreActive)} />
          <span className={moreMenuTriggerIconShellClass}>
            <LuEllipsis className="h-[1.35rem] w-[1.35rem]" strokeWidth={moreActive ? 2.25 : 2} />
          </span>
          <span className="truncate text-[15px]">Daha fazla</span>
        </div>
        <ul
          tabIndex={0}
          className="dropdown-content z-[90] mb-2 min-w-[15rem] overflow-hidden rounded-2xl border border-base-300/50 bg-base-100/98 p-0 shadow-[0_12px_40px_-8px_rgba(0,0,0,0.25)] ring-1 ring-black/5 backdrop-blur-xl dark:bg-base-200/95 dark:ring-white/10"
        >
          <li className="pointer-events-none border-b border-base-300/40 bg-gradient-to-r from-accent/10 via-base-200/20 to-transparent px-3 py-2.5 dark:from-accent/15 dark:via-base-300/30">
            <p className="text-[11px] font-bold uppercase tracking-wider text-base-content/50">Koleksiyon</p>
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
  );
}
