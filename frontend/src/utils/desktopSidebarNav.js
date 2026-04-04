/**
 * Masaüstü sol menü aktif durumu (DesktopSidebar).
 * @param {{ id: string, path?: string }} item — getNavItems çıktısı
 */
export function isMainNavItemActive(item, pathname, username) {
  if (item.id === "home") return pathname === "/";
  if (item.id === "messages") return pathname.startsWith("/messages");
  if (item.id === "notifications") return pathname === "/notifications";
  if (item.id === "profile" && username) {
    return pathname.startsWith(`/profile/${username}`);
  }
  if (item.id === "settings") return pathname === "/settings";
  return false;
}

export function isMoreNavSectionActive(pathname) {
  return pathname === "/saved-posts" || pathname === "/hidden-posts";
}
