import { FaArrowLeft } from "react-icons/fa6";
import { LuMenu, LuX } from "react-icons/lu";

export default function SettingsMobileBar({
  activeLabel,
  menuOpen,
  onBack,
  onToggleMenu,
}) {
  return (
    <div className="fixed left-0 right-0 top-0 z-50 border-b border-base-300/45 bg-base-100/90 shadow-sm backdrop-blur-xl md:hidden">
      <div className="flex items-center justify-between gap-3 px-3 py-3">
        <div className="flex min-w-0 items-center gap-2">
          <button
            type="button"
            onClick={onBack}
            className="btn btn-circle btn-ghost btn-sm shrink-0"
            aria-label="Geri"
          >
            <FaArrowLeft className="h-5 w-5" />
          </button>
          <div className="min-w-0">
            <p className="truncate font-bold text-base-content">Ayarlar</p>
            <p className="truncate text-xs text-base-content/50">{activeLabel}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onToggleMenu}
          className="btn btn-circle btn-ghost btn-sm"
          aria-label={menuOpen ? "Menüyü kapat" : "Menü"}
        >
          {menuOpen ? <LuX className="h-6 w-6" /> : <LuMenu className="h-6 w-6" />}
        </button>
      </div>
    </div>
  );
}
