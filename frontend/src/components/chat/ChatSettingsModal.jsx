import { LuX } from "react-icons/lu";
import ChatAppearancePanel from "./ChatAppearancePanel";

export default function ChatSettingsModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <button
        type="button"
        className="absolute inset-0 bg-neutral-900/50 backdrop-blur-sm dark:bg-black/60"
        aria-label="Kapat"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="chat-settings-title"
        className="relative z-10 max-h-[min(90dvh,40rem)] w-full max-w-lg overflow-y-auto rounded-2xl border border-base-300/50 bg-base-100/95 p-5 shadow-2xl backdrop-blur-xl sm:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 id="chat-settings-title" className="text-lg font-bold text-base-content">
              Sohbet ayarları
            </h2>
            <p className="mt-1 text-sm text-base-content/55">
              Arka plan ve mesaj balonlarını buradan özelleştirebilirsin.
            </p>
          </div>
          <button
            type="button"
            className="btn btn-circle btn-ghost btn-sm shrink-0"
            aria-label="Kapat"
            onClick={onClose}
          >
            <LuX className="h-5 w-5" />
          </button>
        </div>
        <ChatAppearancePanel />
      </div>
    </div>
  );
}
