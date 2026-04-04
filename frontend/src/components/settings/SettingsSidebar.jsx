import { FaArrowLeft } from "react-icons/fa6";
import { LuSettings2 } from "react-icons/lu";
import { SETTINGS_MENU_ITEMS } from "./settingsMenuConfig";
import SettingsNavButton from "./SettingsNavButton";

export default function SettingsSidebar({ selectedId, onSelectItem, onBack }) {
  return (
    <aside className="hidden min-h-0 min-w-0 border-r border-base-300/45 bg-base-100/90 backdrop-blur-xl md:flex md:w-1/2 md:flex-col">
      <div className="sticky top-0 z-10 flex flex-col border-b border-base-300/40 bg-base-100/95 px-4 py-5 backdrop-blur-md">
        <div className="mb-4 flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
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
        {SETTINGS_MENU_ITEMS.map((item) => (
          <SettingsNavButton
            key={item.id}
            item={item}
            isActive={selectedId === item.id}
            onSelectItem={onSelectItem}
          />
        ))}
      </nav>
    </aside>
  );
}
