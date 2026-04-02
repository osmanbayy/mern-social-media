import { useChatAppearance } from "../../contexts/ChatAppearanceContext";
import {
  BUBBLE_PRESET_LABELS,
  CHAT_BG_LABELS,
  BUBBLE_SHAPE_LABELS,
  MESSAGE_DENSITY_LABELS,
  MESSAGE_FONT_LABELS,
  HEADER_STYLE_LABELS,
  DAY_PILL_LABELS,
  contrastTextForBg,
} from "../../constants/chatAppearance";

function SectionTitle({ children }) {
  return <p className="text-[11px] font-bold uppercase tracking-wider text-base-content/40">{children}</p>;
}

/**
 * Sohbet arka planı + balon renkleri. Ayarlar ve sohbet modalında ortak.
 */
export default function ChatAppearancePanel({ className = "" }) {
  const { appearance, setAppearance, resetAppearance } = useChatAppearance();

  const onPresetChange = (e) => {
    const preset = e.target.value;
    if (preset === "custom") {
      setAppearance({
        preset: "custom",
        customMineText: contrastTextForBg(appearance.customMine),
        customTheirsText: contrastTextForBg(appearance.customTheirs),
      });
      return;
    }
    setAppearance({ preset });
  };

  const onChatBgChange = (e) => {
    setAppearance({ chatBg: e.target.value });
  };

  const onCustomMine = (e) => {
    const v = e.target.value;
    setAppearance({
      customMine: v,
      customMineText: contrastTextForBg(v),
    });
  };

  const onCustomTheirs = (e) => {
    const v = e.target.value;
    setAppearance({
      customTheirs: v,
      customTheirsText: contrastTextForBg(v),
    });
  };

  return (
    <div className={`space-y-8 ${className}`}>
      <div className="space-y-4">
        <SectionTitle>Arka plan</SectionTitle>
        <div className="space-y-2">
          <label className="text-sm font-medium text-base-content" htmlFor="chat-bg-select">
            Sohbet arka planı
          </label>
          <p className="text-xs text-base-content/50">Sadece mesaj alanının rengi ve gradyanı.</p>
          <select
            id="chat-bg-select"
            className="select select-bordered w-full max-w-md rounded-xl"
            value={appearance.chatBg}
            onChange={onChatBgChange}
          >
            {Object.entries(CHAT_BG_LABELS).map(([id, label]) => (
              <option key={id} value={id}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-4">
        <SectionTitle>Mesaj balonları</SectionTitle>
        <div className="space-y-2">
          <label className="text-sm font-medium text-base-content" htmlFor="bubble-preset-select">
            Renk teması
          </label>
          <p className="text-xs text-base-content/50">
            Varsayılan, uygulama temasındaki ana rengi kullanır. Diğerleri sabit paletlerdir.
          </p>
          <select
            id="bubble-preset-select"
            className="select select-bordered w-full max-w-md rounded-xl"
            value={appearance.preset}
            onChange={onPresetChange}
          >
            {Object.entries(BUBBLE_PRESET_LABELS).map(([id, label]) => (
              <option key={id} value={id}>
                {label}
              </option>
            ))}
          </select>
        </div>

        {appearance.preset === "custom" && (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <span className="text-xs font-medium text-base-content/80">Gönderdiğim mesajlar</span>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  className="h-11 w-14 cursor-pointer rounded-lg border border-base-300/60 bg-base-100 p-1"
                  value={appearance.customMine}
                  onChange={onCustomMine}
                  aria-label="Gönderdiğim mesaj balon rengi"
                />
                <input
                  type="text"
                  className="input input-bordered input-sm flex-1 rounded-xl font-mono text-xs"
                  value={appearance.customMine}
                  onChange={onCustomMine}
                  spellCheck={false}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <span className="text-xs font-medium text-base-content/80">Aldığım mesajlar</span>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  className="h-11 w-14 cursor-pointer rounded-lg border border-base-300/60 bg-base-100 p-1"
                  value={appearance.customTheirs}
                  onChange={onCustomTheirs}
                  aria-label="Aldığım mesaj balon rengi"
                />
                <input
                  type="text"
                  className="input input-bordered input-sm flex-1 rounded-xl font-mono text-xs"
                  value={appearance.customTheirs}
                  onChange={onCustomTheirs}
                  spellCheck={false}
                />
              </div>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <label className="text-sm font-medium text-base-content" htmlFor="bubble-shape-select">
            Balon köşeleri
          </label>
          <select
            id="bubble-shape-select"
            className="select select-bordered w-full max-w-md rounded-xl"
            value={appearance.bubbleShape}
            onChange={(e) => setAppearance({ bubbleShape: e.target.value })}
          >
            {Object.entries(BUBBLE_SHAPE_LABELS).map(([id, label]) => (
              <option key={id} value={id}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-4">
        <SectionTitle>Düzen ve okunabilirlik</SectionTitle>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-base-content" htmlFor="density-select">
              Mesaj aralığı
            </label>
            <select
              id="density-select"
              className="select select-bordered w-full rounded-xl"
              value={appearance.messageDensity}
              onChange={(e) => setAppearance({ messageDensity: e.target.value })}
            >
              {Object.entries(MESSAGE_DENSITY_LABELS).map(([id, label]) => (
                <option key={id} value={id}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-base-content" htmlFor="font-select">
              Mesaj yazı boyutu
            </label>
            <select
              id="font-select"
              className="select select-bordered w-full rounded-xl"
              value={appearance.messageFontSize}
              onChange={(e) => setAppearance({ messageFontSize: e.target.value })}
            >
              {Object.entries(MESSAGE_FONT_LABELS).map(([id, label]) => (
                <option key={id} value={id}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-base-content" htmlFor="header-select">
              Üst çubuk (sohbet başlığı)
            </label>
            <select
              id="header-select"
              className="select select-bordered w-full rounded-xl"
              value={appearance.headerStyle}
              onChange={(e) => setAppearance({ headerStyle: e.target.value })}
            >
              {Object.entries(HEADER_STYLE_LABELS).map(([id, label]) => (
                <option key={id} value={id}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-base-content" htmlFor="day-pill-select">
              Gün ayırıcı (Bugün / Dün)
            </label>
            <select
              id="day-pill-select"
              className="select select-bordered w-full rounded-xl"
              value={appearance.dayPillStyle}
              onChange={(e) => setAppearance({ dayPillStyle: e.target.value })}
            >
              {Object.entries(DAY_PILL_LABELS).map(([id, label]) => (
                <option key={id} value={id}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 border-t border-base-300/30 pt-6">
        <button type="button" className="btn btn-outline btn-sm rounded-xl" onClick={resetAppearance}>
          Sohbet görünümünü sıfırla
        </button>
        <p className="text-[11px] text-base-content/45">Tercihler bu cihazda saklanır (localStorage).</p>
      </div>
    </div>
  );
}
