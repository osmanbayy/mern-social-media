import { useChatAppearance } from "../../contexts/ChatAppearanceContext";
import {
  BUBBLE_PRESET_LABELS,
  CHAT_BG_LABELS,
  BUBBLE_SHAPE_LABELS,
  MESSAGE_DENSITY_LABELS,
  MESSAGE_FONT_LABELS,
  HEADER_STYLE_LABELS,
  DAY_PILL_LABELS,
} from "../../constants/chatAppearance";
import { useChatAppearancePanelHandlers } from "../../hooks/useChatAppearancePanelHandlers";
import SectionTitle from "./appearance/SectionTitle";
import LabeledSelect from "./appearance/LabeledSelect";
import CustomBubbleColorFields from "./appearance/CustomBubbleColorFields";

/**
 * Sohbet arka planı + balon renkleri. Ayarlar ve sohbet modalında ortak.
 */
export default function ChatAppearancePanel({ className = "" }) {
  const { appearance, setAppearance, resetAppearance } = useChatAppearance();
  const {
    onPresetChange,
    onChatBgChange,
    onCustomMine,
    onCustomTheirs,
    onAppearanceFieldChange,
  } = useChatAppearancePanelHandlers(appearance, setAppearance);

  return (
    <div className={`space-y-8 ${className}`}>
      <div className="space-y-4">
        <SectionTitle>Arka plan</SectionTitle>
        <LabeledSelect
          id="chat-bg-select"
          label="Sohbet arka planı"
          hint="Sadece mesaj alanının rengi ve gradyanı."
          value={appearance.chatBg}
          onChange={onChatBgChange}
          options={CHAT_BG_LABELS}
          narrow
        />
      </div>

      <div className="space-y-4">
        <SectionTitle>Mesaj balonları</SectionTitle>
        <LabeledSelect
          id="bubble-preset-select"
          label="Renk teması"
          hint="Varsayılan, uygulama temasındaki ana rengi kullanır. Diğerleri sabit paletlerdir."
          value={appearance.preset}
          onChange={onPresetChange}
          options={BUBBLE_PRESET_LABELS}
          narrow
        />

        {appearance.preset === "custom" && (
          <CustomBubbleColorFields
            appearance={appearance}
            onCustomMine={onCustomMine}
            onCustomTheirs={onCustomTheirs}
          />
        )}

        <LabeledSelect
          id="bubble-shape-select"
          fieldName="bubbleShape"
          label="Balon köşeleri"
          value={appearance.bubbleShape}
          onChange={onAppearanceFieldChange}
          options={BUBBLE_SHAPE_LABELS}
          narrow
        />
      </div>

      <div className="space-y-4">
        <SectionTitle>Düzen ve okunabilirlik</SectionTitle>
        <div className="grid gap-4 sm:grid-cols-2">
          <LabeledSelect
            id="density-select"
            fieldName="messageDensity"
            label="Mesaj aralığı"
            value={appearance.messageDensity}
            onChange={onAppearanceFieldChange}
            options={MESSAGE_DENSITY_LABELS}
          />
          <LabeledSelect
            id="font-select"
            fieldName="messageFontSize"
            label="Mesaj yazı boyutu"
            value={appearance.messageFontSize}
            onChange={onAppearanceFieldChange}
            options={MESSAGE_FONT_LABELS}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <LabeledSelect
            id="header-select"
            fieldName="headerStyle"
            label="Üst çubuk (sohbet başlığı)"
            value={appearance.headerStyle}
            onChange={onAppearanceFieldChange}
            options={HEADER_STYLE_LABELS}
          />
          <LabeledSelect
            id="day-pill-select"
            fieldName="dayPillStyle"
            label="Gün ayırıcı (Bugün / Dün)"
            value={appearance.dayPillStyle}
            onChange={onAppearanceFieldChange}
            options={DAY_PILL_LABELS}
          />
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
