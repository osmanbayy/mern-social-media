export const CHAT_APPEARANCE_STORAGE_KEY = "chatAppearance";

/** @typedef {'default'|'soft'|'ocean'|'midnight'|'rose'|'sunset'|'forest'|'candy'|'slate'|'custom'} ChatBubblePreset */
/** @typedef {'default'|'plain'|'calm'|'muted'|'warm'|'lavender'|'paper'|'deep'|'emerald'|'aurora'|'dusk'} ChatBackgroundId */
/** @typedef {'default'|'smooth'|'minimal'} BubbleShapeId */
/** @typedef {'compact'|'default'|'relaxed'} MessageDensityId */
/** @typedef {'sm'|'md'|'lg'} MessageFontSizeId */
/** @typedef {'default'|'glass'|'flat'} ChatHeaderStyleId */
/** @typedef {'default'|'soft'|'outline'} DayPillStyleId */

export const DEFAULT_CHAT_APPEARANCE = {
  /** @type {ChatBubblePreset} */
  preset: "default",
  /** @type {ChatBackgroundId} */
  chatBg: "default",
  customMine: "#570df8",
  customTheirs: "#f3f4f6",
  customMineText: "#ffffff",
  customTheirsText: "#1f2937",
  /** @type {BubbleShapeId} */
  bubbleShape: "default",
  /** @type {MessageDensityId} */
  messageDensity: "default",
  /** @type {MessageFontSizeId} */
  messageFontSize: "md",
  /** @type {ChatHeaderStyleId} */
  headerStyle: "default",
  /** @type {DayPillStyleId} */
  dayPillStyle: "default",
};

export const BUBBLE_PRESET_LABELS = {
  default: "Varsayılan (uygulama teması)",
  soft: "Yumuşak",
  ocean: "Okyanus",
  midnight: "Gece",
  rose: "Gül",
  sunset: "Gün batımı",
  forest: "Orman",
  candy: "Şeker pembesi",
  slate: "Antrasit",
  custom: "Özel renkler",
};

export const CHAT_BG_LABELS = {
  default: "Varsayılan (hafif gradyan)",
  plain: "Düz",
  calm: "Sakin",
  muted: "Soluk",
  warm: "Sıcak (şeftali)",
  lavender: "Lavanta",
  paper: "Kağıt",
  deep: "Derinlik",
  emerald: "Zümrüt",
  aurora: "Aurora",
  dusk: "Alacakaranlık",
};

export const BUBBLE_SHAPE_LABELS = {
  default: "Varsayılan (iMessage tarzı)",
  smooth: "Daha yuvarlak",
  minimal: "Köşeli",
};

export const MESSAGE_DENSITY_LABELS = {
  compact: "Sıkı",
  default: "Normal",
  relaxed: "Rahat",
};

export const MESSAGE_FONT_LABELS = {
  sm: "Küçük",
  md: "Normal",
  lg: "Büyük",
};

export const HEADER_STYLE_LABELS = {
  default: "Varsayılan",
  glass: "Cam (daha şeffaf)",
  flat: "Düz (gölgesiz)",
};

export const DAY_PILL_LABELS = {
  default: "Varsayılan",
  soft: "Yumuşak",
  outline: "Çerçeveli",
};

/** Preset colors (non-default, non-custom) */
export const PRESET_COLORS = {
  soft: {
    mineBg: "#8367e8",
    mineText: "#ffffff",
    theirsBg: "#f4f4f5",
    theirsText: "#18181b",
  },
  ocean: {
    mineBg: "#0d9488",
    mineText: "#ffffff",
    theirsBg: "#e0f2fe",
    theirsText: "#0f172a",
  },
  midnight: {
    mineBg: "#475569",
    mineText: "#f8fafc",
    theirsBg: "#cbd5e1",
    theirsText: "#0f172a",
  },
  rose: {
    mineBg: "#e11d48",
    mineText: "#ffffff",
    theirsBg: "#ffe4e6",
    theirsText: "#881337",
  },
  sunset: {
    mineBg: "#ea580c",
    mineText: "#ffffff",
    theirsBg: "#ffedd5",
    theirsText: "#7c2d12",
  },
  forest: {
    mineBg: "#15803d",
    mineText: "#ffffff",
    theirsBg: "#dcfce7",
    theirsText: "#14532d",
  },
  candy: {
    mineBg: "#db2777",
    mineText: "#ffffff",
    theirsBg: "#fce7f3",
    theirsText: "#831843",
  },
  slate: {
    mineBg: "#1e293b",
    mineText: "#f1f5f9",
    theirsBg: "#e2e8f0",
    theirsText: "#0f172a",
  },
};

export const CHAT_BG_CLASSES = {
  default: "bg-gradient-to-b from-base-200/25 via-base-100 to-base-100",
  plain: "bg-base-100",
  calm: "bg-gradient-to-b from-sky-200/10 via-base-100 to-base-100 dark:from-sky-500/10",
  muted: "bg-gradient-to-b from-base-300/20 to-base-200/30",
  warm: "bg-gradient-to-b from-orange-200/15 via-base-100 to-base-100 dark:from-orange-900/20",
  lavender: "bg-gradient-to-b from-violet-200/15 via-base-100 to-base-100 dark:from-violet-900/20",
  paper: "bg-[#faf8f5] dark:bg-base-100",
  deep: "bg-gradient-to-b from-base-300/50 via-base-200/30 to-base-100",
  emerald: "bg-gradient-to-b from-emerald-200/12 via-base-100 to-base-100 dark:from-emerald-900/15",
  aurora:
    "bg-gradient-to-br from-violet-200/20 via-sky-100/15 to-base-100 dark:from-violet-900/20 dark:via-sky-950/20",
  dusk: "bg-gradient-to-b from-indigo-500/10 via-base-200/20 to-base-100 dark:from-indigo-900/30",
};

export const CHAT_DENSITY_MAP = {
  compact: {
    rowGap: "gap-0.5",
    clusterTop: "mt-1",
    clusterRest: "mt-px",
    scrollPadding: "px-3 py-3 sm:px-4",
  },
  default: {
    rowGap: "gap-1",
    clusterTop: "mt-2",
    clusterRest: "mt-0.5",
    scrollPadding: "px-3 py-4 sm:px-4",
  },
  relaxed: {
    rowGap: "gap-1.5",
    clusterTop: "mt-3",
    clusterRest: "mt-1",
    scrollPadding: "px-3 py-5 sm:px-4 sm:py-6",
  },
};

export const CHAT_FONT_MAP = {
  sm: "text-sm leading-snug",
  md: "text-[15px] leading-relaxed",
  lg: "text-base leading-relaxed",
};

export const HEADER_STYLE_CLASSES = {
  default:
    "sticky top-0 z-30 shrink-0 border-b border-base-300/60 bg-base-100/90 shadow-sm backdrop-blur-lg backdrop-saturate-150",
  glass:
    "sticky top-0 z-30 shrink-0 border-b border-base-300/40 bg-base-100/70 shadow-md backdrop-blur-2xl backdrop-saturate-150",
  flat: "sticky top-0 z-30 shrink-0 border-b border-base-300/50 bg-base-100 shadow-none backdrop-blur-none",
};

export const DAY_PILL_CLASSES = {
  default: "rounded-full bg-base-300/40 px-3 py-1 text-[11px] font-medium uppercase tracking-wide text-base-content/55",
  soft: "rounded-full bg-base-200/80 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-base-content/60 shadow-sm",
  outline:
    "rounded-full border border-base-300/70 bg-base-100/80 px-3 py-1 text-[11px] font-medium uppercase tracking-wide text-base-content/65",
};

/**
 * Balon köşe sınıfları (küme üst/alt).
 * @param {BubbleShapeId} shape
 * @param {boolean} mine
 * @param {boolean} clusterTop
 * @param {boolean} clusterBottom
 */
export function getBubbleRadius(shape, mine, clusterTop, clusterBottom) {
  if (shape === "smooth") {
    return mine
      ? clusterTop && clusterBottom
        ? "rounded-3xl rounded-br-xl"
        : clusterTop
        ? "rounded-3xl rounded-br-sm"
        : clusterBottom
        ? "rounded-3xl rounded-br-xl"
        : "rounded-3xl rounded-br-sm"
      : clusterTop && clusterBottom
      ? "rounded-3xl rounded-bl-xl"
      : clusterTop
      ? "rounded-3xl rounded-bl-sm"
      : clusterBottom
      ? "rounded-3xl rounded-bl-xl"
      : "rounded-3xl rounded-bl-sm";
  }
  if (shape === "minimal") {
    return mine
      ? clusterTop && clusterBottom
        ? "rounded-xl rounded-br-md"
        : clusterTop
        ? "rounded-xl rounded-br-sm"
        : clusterBottom
        ? "rounded-xl rounded-br-md"
        : "rounded-xl rounded-br-sm"
      : clusterTop && clusterBottom
      ? "rounded-xl rounded-bl-md"
      : clusterTop
      ? "rounded-xl rounded-bl-sm"
      : clusterBottom
      ? "rounded-xl rounded-bl-md"
      : "rounded-xl rounded-bl-sm";
  }
  return mine
    ? clusterTop && clusterBottom
      ? "rounded-2xl rounded-br-md"
      : clusterTop
      ? "rounded-2xl rounded-br-sm"
      : clusterBottom
      ? "rounded-2xl rounded-br-md"
      : "rounded-2xl rounded-br-sm"
    : clusterTop && clusterBottom
    ? "rounded-2xl rounded-bl-md"
    : clusterTop
    ? "rounded-2xl rounded-bl-sm"
    : clusterBottom
    ? "rounded-2xl rounded-bl-md"
    : "rounded-2xl rounded-bl-sm";
}

function hexToRgb(hex) {
  if (!hex || typeof hex !== "string") return null;
  const h = hex.replace("#", "").trim();
  if (h.length === 3) {
    const r = parseInt(h[0] + h[0], 16);
    const g = parseInt(h[1] + h[1], 16);
    const b = parseInt(h[2] + h[2], 16);
    return Number.isFinite(r) ? [r, g, b] : null;
  }
  if (h.length !== 6) return null;
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return Number.isFinite(r) ? [r, g, b] : null;
}

/** Readable text on arbitrary hex background */
export function contrastTextForBg(hex) {
  const rgb = hexToRgb(hex);
  if (!rgb) return "#ffffff";
  const [r, g, b] = rgb;
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 150 ? "#111827" : "#ffffff";
}

const PRESET_IDS = [
  "default",
  "soft",
  "ocean",
  "midnight",
  "rose",
  "sunset",
  "forest",
  "candy",
  "slate",
  "custom",
];

const CHAT_BG_IDS = [
  "default",
  "plain",
  "calm",
  "muted",
  "warm",
  "lavender",
  "paper",
  "deep",
  "emerald",
  "aurora",
  "dusk",
];

const BUBBLE_SHAPE_IDS = ["default", "smooth", "minimal"];
const DENSITY_IDS = ["compact", "default", "relaxed"];
const FONT_IDS = ["sm", "md", "lg"];
const HEADER_IDS = ["default", "glass", "flat"];
const DAY_PILL_IDS = ["default", "soft", "outline"];

export function parseChatAppearance(raw) {
  if (raw == null || typeof raw !== "object") return { ...DEFAULT_CHAT_APPEARANCE };
  const preset = PRESET_IDS.includes(raw.preset) ? raw.preset : DEFAULT_CHAT_APPEARANCE.preset;
  const chatBg = CHAT_BG_IDS.includes(raw.chatBg) ? raw.chatBg : DEFAULT_CHAT_APPEARANCE.chatBg;
  const bubbleShape = BUBBLE_SHAPE_IDS.includes(raw.bubbleShape)
    ? raw.bubbleShape
    : DEFAULT_CHAT_APPEARANCE.bubbleShape;
  const messageDensity = DENSITY_IDS.includes(raw.messageDensity)
    ? raw.messageDensity
    : DEFAULT_CHAT_APPEARANCE.messageDensity;
  const messageFontSize = FONT_IDS.includes(raw.messageFontSize)
    ? raw.messageFontSize
    : DEFAULT_CHAT_APPEARANCE.messageFontSize;
  const headerStyle = HEADER_IDS.includes(raw.headerStyle) ? raw.headerStyle : DEFAULT_CHAT_APPEARANCE.headerStyle;
  const dayPillStyle = DAY_PILL_IDS.includes(raw.dayPillStyle)
    ? raw.dayPillStyle
    : DEFAULT_CHAT_APPEARANCE.dayPillStyle;

  return {
    preset,
    chatBg,
    customMine: typeof raw.customMine === "string" ? raw.customMine : DEFAULT_CHAT_APPEARANCE.customMine,
    customTheirs: typeof raw.customTheirs === "string" ? raw.customTheirs : DEFAULT_CHAT_APPEARANCE.customTheirs,
    customMineText: typeof raw.customMineText === "string" ? raw.customMineText : DEFAULT_CHAT_APPEARANCE.customMineText,
    customTheirsText:
      typeof raw.customTheirsText === "string" ? raw.customTheirsText : DEFAULT_CHAT_APPEARANCE.customTheirsText,
    bubbleShape,
    messageDensity,
    messageFontSize,
    headerStyle,
    dayPillStyle,
  };
}

export function loadChatAppearanceFromStorage() {
  if (typeof window === "undefined") return { ...DEFAULT_CHAT_APPEARANCE };
  try {
    const s = localStorage.getItem(CHAT_APPEARANCE_STORAGE_KEY);
    if (!s) return { ...DEFAULT_CHAT_APPEARANCE };
    const parsed = JSON.parse(s);
    return parseChatAppearance(parsed);
  } catch {
    return { ...DEFAULT_CHAT_APPEARANCE };
  }
}

/**
 * Resolved bubble styles for message rows.
 * @param {ReturnType<typeof parseChatAppearance>} state
 */
export function resolveBubbleAppearance(state) {
  if (state.preset === "default") {
    return {
      mine: { mode: "theme" },
      theirs: { mode: "theme" },
    };
  }
  if (state.preset === "custom") {
    const mineBg = state.customMine;
    const theirsBg = state.customTheirs;
    return {
      mine: {
        mode: "inline",
        bg: mineBg,
        color: state.customMineText || contrastTextForBg(mineBg),
      },
      theirs: {
        mode: "inline",
        bg: theirsBg,
        color: state.customTheirsText || contrastTextForBg(theirsBg),
      },
    };
  }
  const p = PRESET_COLORS[state.preset];
  if (!p) {
    return {
      mine: { mode: "theme" },
      theirs: { mode: "theme" },
    };
  }
  return {
    mine: { mode: "inline", bg: p.mineBg, color: p.mineText },
    theirs: { mode: "inline", bg: p.theirsBg, color: p.theirsText },
  };
}
