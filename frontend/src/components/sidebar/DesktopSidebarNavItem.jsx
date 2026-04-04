import { Link } from "react-router-dom";
import { mainNavIndicatorClasses, mainNavIconShellClass, mainNavRowClasses } from "./desktopSidebarClasses";

export default function DesktopSidebarNavItem({ to, icon: Icon, label, isActive, hasBadge }) {
  return (
    <li>
      <Link to={to} className={mainNavRowClasses(isActive)}>
        <span className={mainNavIndicatorClasses(isActive)} aria-hidden />
        <span className={mainNavIconShellClass}>
          <Icon className="h-[1.35rem] w-[1.35rem] shrink-0" strokeWidth={isActive ? 2.25 : 2} />
          {hasBadge ? (
            <span className="absolute right-0.5 top-0.5 h-2 w-2 rounded-full bg-error shadow-sm ring-2 ring-base-100" />
          ) : null}
        </span>
        <span className="truncate text-[15px]">{label}</span>
      </Link>
    </li>
  );
}
