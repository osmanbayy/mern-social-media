import { LuX } from "react-icons/lu";
import { SETTINGS_MENU_ITEMS } from "./settingsMenuConfig";
import SettingsNavButton from "./SettingsNavButton";

export default function SettingsMobileDrawer({ open, selectedId, onSelectSection, onClose }) {
  if (!open) return null;

  return (
    <>
      <button
        type="button"
        aria-label="Kapat"
        className="fixed inset-0 z-40 bg-neutral-900/45 backdrop-blur-[2px] dark:bg-black/55 md:hidden"
        onClick={onClose}
      />
      <div className="fixed bottom-0 left-0 top-0 z-50 flex w-[min(20rem,88vw)] flex-col border-r border-base-300/50 bg-base-100 shadow-2xl md:hidden">
        <div className="flex items-center justify-between border-b border-base-300/40 px-4 py-4">
          <p className="font-bold text-base-content">Bölümler</p>
          <button
            type="button"
            onClick={onClose}
            className="btn btn-circle btn-ghost btn-sm"
            aria-label="Kapat"
          >
            <LuX className="h-5 w-5" />
          </button>
        </div>
        <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
          {SETTINGS_MENU_ITEMS.map((item) => (
            <SettingsNavButton
              key={item.id}
              item={item}
              isActive={selectedId === item.id}
              onSelectItem={(id) => {
                onSelectSection(id);
                onClose();
              }}
            />
          ))}
        </nav>
      </div>
    </>
  );
}
