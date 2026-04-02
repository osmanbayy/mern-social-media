import { useState } from "react";
import { FaArrowLeft } from "react-icons/fa6";
import {
  LuUser,
  LuBell,
  LuShield,
  LuAccessibility,
  LuPalette,
  LuChevronRight,
  LuMenu,
  LuX,
  LuBan,
  LuSettings2,
} from "react-icons/lu";
import { HiQuestionMarkCircle } from "react-icons/hi2";
import AccountInformation from "../components/settingsComponents/AccountInformation";
import DisplayAndTheme from "../components/settingsComponents/DisplayAndTheme";
import BlockedAccounts from "../components/settingsComponents/BlockedAccounts";
import SettingsPlaceholder from "../components/settingsComponents/SettingsPlaceholder";
import { useNavigate } from "react-router-dom";

const MENU = [
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

const Settings = () => {
  const [selectedSetting, setSelectedSetting] = useState("Hesap Detayları");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const active = MENU.find((m) => m.id === selectedSetting) || MENU[0];

  const renderContent = () => {
    switch (selectedSetting) {
      case "Hesap Detayları":
        return <AccountInformation />;
      case "Bildirim Ayarları":
        return (
          <SettingsPlaceholder
            title="Bildirim ayarları yakında"
            description="Hangi bildirimleri alacağını buradan yönetebileceksin."
          />
        );
      case "Gizlilik ve Güvenlik":
        return (
          <SettingsPlaceholder
            title="Gizlilik ve güvenlik yakında"
            description="İki adımlı doğrulama ve gizlilik seçenekleri üzerinde çalışıyoruz."
          />
        );
      case "Engellenen Hesaplar":
        return <BlockedAccounts />;
      case "Erişilebilirlik":
        return (
          <SettingsPlaceholder
            title="Erişilebilirlik yakında"
            description="Yazı boyutu, hareket azaltma ve daha fazlası eklenecek."
          />
        );
      case "Yardım Merkezi":
        return (
          <SettingsPlaceholder
            title="Yardım merkezi yakında"
            description="Sık sorulan sorular ve destek burada olacak."
          />
        );
      case "Görünüm ve Tema":
        return <DisplayAndTheme />;
      default:
        return null;
    }
  };

  const NavButton = ({ item, onSelect, className = "" }) => {
    const Icon = item.icon;
    const isActive = selectedSetting === item.id;
    return (
      <button
        type="button"
        onClick={() => onSelect(item.id)}
        className={`group flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition-all duration-200 ${className} ${
          isActive
            ? "bg-accent/12 font-semibold text-accent shadow-sm ring-1 ring-accent/20"
            : "text-base-content/75 hover:bg-base-200/60 hover:text-base-content"
        }`}
      >
        <span
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors ${
            isActive ? "bg-accent/15 text-accent" : "bg-base-200/70 text-base-content/65 group-hover:bg-base-300/60"
          }`}
        >
          <Icon className="h-[1.25rem] w-[1.25rem]" />
        </span>
        <span className="min-w-0 flex-1 truncate text-[15px]">{item.label}</span>
        <LuChevronRight
          className={`h-4 w-4 shrink-0 transition-transform ${
            isActive ? "text-accent" : "text-base-content/25 group-hover:translate-x-0.5 group-hover:text-base-content/45"
          }`}
        />
      </button>
    );
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-gradient-to-b from-base-200/35 via-base-100 to-base-100 dark:from-base-300/15 md:flex-row">
      {/* Masaüstü: ayar menüsü — ana sütunun yarısı (app sidebar’ın yanında eşit panel) */}
      <aside className="hidden min-h-0 min-w-0 border-r border-base-300/45 bg-base-100/90 backdrop-blur-xl md:flex md:w-1/2 md:flex-col">
        <div className="sticky top-0 z-10 flex flex-col border-b border-base-300/40 bg-base-100/95 px-4 py-5 backdrop-blur-md">
          <div className="mb-4 flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="btn btn-circle btn-ghost btn-sm shrink-0"
              aria-label="Geri"
            >
              <FaArrowLeft className="h-5 w-5" />
            </button>
            <div className="flex min-w-0 items-center gap-2.5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/12 text-accent ring-1 ring-accent/15">
                <LuSettings2 className="h-5 w-5" strokeWidth={2.25} />
              </div>
              <div className="min-w-0">
                <p className="text-lg font-bold leading-tight tracking-tight text-base-content">Ayarlar</p>
                <p className="truncate text-xs text-base-content/50">Hesabını yönet</p>
              </div>
            </div>
          </div>
        </div>
        <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto p-3 pb-8" aria-label="Ayarlar menüsü">
          {MENU.map((item) => (
            <NavButton key={item.id} item={item} onSelect={setSelectedSetting} />
          ))}
        </nav>
      </aside>

      {/* Mobil üst bar */}
      <div className="fixed left-0 right-0 top-0 z-50 border-b border-base-300/45 bg-base-100/90 shadow-sm backdrop-blur-xl md:hidden">
        <div className="flex items-center justify-between gap-3 px-3 py-3">
          <div className="flex min-w-0 items-center gap-2">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="btn btn-circle btn-ghost btn-sm shrink-0"
              aria-label="Geri"
            >
              <FaArrowLeft className="h-5 w-5" />
            </button>
            <div className="min-w-0">
              <p className="truncate font-bold text-base-content">Ayarlar</p>
              <p className="truncate text-xs text-base-content/50">{active.label}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen((v) => !v)}
            className="btn btn-circle btn-ghost btn-sm"
            aria-label={isMobileMenuOpen ? "Menüyü kapat" : "Menü"}
          >
            {isMobileMenuOpen ? <LuX className="h-6 w-6" /> : <LuMenu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <>
          <button
            type="button"
            aria-label="Kapat"
            className="fixed inset-0 z-40 bg-neutral-900/45 backdrop-blur-[2px] dark:bg-black/55 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="fixed bottom-0 left-0 top-0 z-50 flex w-[min(20rem,88vw)] flex-col border-r border-base-300/50 bg-base-100 shadow-2xl md:hidden">
            <div className="flex items-center justify-between border-b border-base-300/40 px-4 py-4">
              <p className="font-bold text-base-content">Bölümler</p>
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(false)}
                className="btn btn-circle btn-ghost btn-sm"
                aria-label="Kapat"
              >
                <LuX className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
              {MENU.map((item) => (
                <NavButton
                  key={item.id}
                  item={item}
                  onSelect={(id) => {
                    setSelectedSetting(id);
                    setIsMobileMenuOpen(false);
                  }}
                />
              ))}
            </nav>
          </div>
        </>
      )}

      {/* İçerik — menü ile aynı genişlik (50 / 50) */}
      <div className="flex min-h-screen w-full min-w-0 flex-col pt-[4.25rem] md:w-1/2 md:min-w-0 md:pt-0">
        <div className="w-full flex-1 px-4 py-6 md:px-6 md:py-10 lg:px-8">
          <header className="mb-8 border-b border-base-300/35 pb-6">
            <p className="mb-1 text-[11px] font-bold uppercase tracking-wider text-base-content/40">Ayarlar</p>
            <h1 className="text-2xl font-bold tracking-tight text-base-content md:text-3xl">{active.label}</h1>
            <p className="mt-2 text-sm text-base-content/55">{active.description}</p>
          </header>
          <div className="fade-in min-w-0">{renderContent()}</div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
