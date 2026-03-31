import { LuSettings, LuBookmark, LuEyeOff, LuMessageSquare } from "react-icons/lu";

export const MOBILE_MENU_ITEMS = [
  {
    id: "messages",
    path: "/messages",
    icon: LuMessageSquare,
    label: "Mesajlar",
    description: "Özel mesajlar ve istekler",
    color: "sky-500",
    delay: "delay-75",
  },
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
