import { LuSettings, LuBookmark, LuEyeOff } from "react-icons/lu";

export const MOBILE_MENU_ITEMS = [
  {
    id: "settings",
    path: "/settings",
    icon: LuSettings,
    label: "Ayarlar",
    description: "Hesap ve uygulama ayarları",
    color: "primary",
    delay: "delay-100",
  },
  {
    id: "saved",
    path: "/saved-posts",
    icon: LuBookmark,
    label: "Kaydedilenler",
    description: "Kaydettiğiniz gönderiler",
    color: "amber-500",
    delay: "delay-150",
  },
  {
    id: "hidden",
    path: "/hidden-posts",
    icon: LuEyeOff,
    label: "Gizlenenler",
    description: "Gizlediğiniz gönderiler",
    color: "purple-500",
    delay: "delay-200",
  },
];
