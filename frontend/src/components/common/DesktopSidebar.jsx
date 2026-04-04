import { useLocation } from "react-router-dom";
import { getNavItems } from "../../constants/navItems";
import { useTheme } from "../../contexts/ThemeContext";
import { isMainNavItemActive } from "../../utils/desktopSidebarNav";
import DesktopSidebarLogo from "../sidebar/DesktopSidebarLogo";
import DesktopSidebarProfileCard from "../sidebar/DesktopSidebarProfileCard";
import DesktopSidebarNavItem from "../sidebar/DesktopSidebarNavItem";
import DesktopSidebarMoreMenu from "../sidebar/DesktopSidebarMoreMenu";
import DesktopSidebarLogoutButton from "../sidebar/DesktopSidebarLogoutButton";

const SIDEBAR_WIDTH_CLASS = "md:w-56 lg:w-60 xl:w-[15.5rem]";

const DesktopSidebar = ({ authUser, isNotRead, onLogoutClick }) => {
  const { theme } = useTheme();
  const isDark = (theme || "").toLowerCase() === "dark";
  const { pathname } = useLocation();
  const username = authUser?.username;

  const navItems = getNavItems(authUser, isNotRead);

  return (
    <aside className={`hidden shrink-0 md:flex ${SIDEBAR_WIDTH_CLASS}`}>
      <div className="sticky top-0 z-20 flex h-screen w-full flex-col border-r border-base-300/45 bg-gradient-to-b from-base-100 via-base-100 to-base-200/35 backdrop-blur-xl dark:to-base-300/25">
        <div className="flex flex-1 flex-col px-3 pb-4 pt-5">
          <DesktopSidebarLogo />

          <DesktopSidebarProfileCard authUser={authUser} isDark={isDark} />

          <nav className="flex flex-col gap-1" aria-label="Ana menü">
            <ul className="flex flex-col gap-0.5">
              {navItems.map((item) => (
                <DesktopSidebarNavItem
                  key={item.id}
                  to={item.path}
                  icon={item.icon}
                  label={item.label}
                  isActive={isMainNavItemActive(item, pathname, username)}
                  hasBadge={item.hasBadge}
                />
              ))}
              <DesktopSidebarMoreMenu pathname={pathname} />
            </ul>
          </nav>

          <DesktopSidebarLogoutButton onLogoutClick={onLogoutClick} />
        </div>
      </div>
    </aside>
  );
};

export default DesktopSidebar;
