import { LuBell, LuUser, LuBookmark, LuSettings, LuHouse, LuEyeOff } from "react-icons/lu";

export const BASE_NAV_ITEMS = [
  { id: "home", path: "/", icon: LuHouse, label: "Anasayfa" },
  { id: "notifications", path: "/notifications", icon: LuBell, label: "Bildirimler" },
  { id: "savedPosts", path: "/saved-posts", icon: LuBookmark, label: "Kaydedilenler" },
  { id: "hiddenPosts", path: "/hidden-posts", icon: LuEyeOff, label: "Gizlenenler" },
  { id: "profile", icon: LuUser, label: "Profil" },
  { id: "settings", path: "/settings", icon: LuSettings, label: "Ayarlar" },
];

export const getNavItems = (authUser, isNotRead) => {
  return BASE_NAV_ITEMS.map((item) => {
    const navItem = { ...item };
    
    // Profile path needs username
    if (item.id === "profile") {
      navItem.path = `/profile/${authUser?.username}`;
    }
    
    // Notifications needs badge
    if (item.id === "notifications") {
      navItem.hasBadge = isNotRead;
    }
    
    return navItem;
  });
};
