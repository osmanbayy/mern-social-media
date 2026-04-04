import {
  LuAccessibility,
  LuBan,
  LuBell,
  LuPalette,
  LuShield,
  LuUser,
} from "react-icons/lu";
import { HiQuestionMarkCircle } from "react-icons/hi2";

export const SETTINGS_MENU_ITEMS = [
  {
    id: "Hesap Detayları",
    label: "Hesap detayları",
    description: "Profil bilgilerin ve hesap durumun",
    icon: LuUser,
  },
  {
    id: "Bildirim Ayarları",
    label: "Bildirimler",
    description: "Bildirim tercihlerin",
    icon: LuBell,
  },
  {
    id: "Gizlilik ve Güvenlik",
    label: "Gizlilik ve güvenlik",
    description: "Hesap güvenliği ve veri",
    icon: LuShield,
  },
  {
    id: "Engellenen Hesaplar",
    label: "Engellenen hesaplar",
    description: "Engellediğin kullanıcılar",
    icon: LuBan,
  },
  {
    id: "Erişilebilirlik",
    label: "Erişilebilirlik",
    description: "Görüntü ve etkileşim seçenekleri",
    icon: LuAccessibility,
  },
  {
    id: "Yardım Merkezi",
    label: "Yardım merkezi",
    description: "SSS ve destek",
    icon: HiQuestionMarkCircle,
  },
  {
    id: "Görünüm ve Tema",
    label: "Görünüm ve tema",
    description: "Tema ve ekran tercihleri",
    icon: LuPalette,
  },
];
