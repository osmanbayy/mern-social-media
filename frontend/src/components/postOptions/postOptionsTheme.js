const MENU_BASE =
  "dropdown-content menu z-[100] min-w-60 rounded-xl border border-base-300/50 bg-base-100/95 p-2 font-semibold shadow-2xl backdrop-blur-xl transition-all duration-200 ease-out";

export function postOptionsMenuClassName(theme) {
  const ring =
    theme === "dark"
      ? "shadow-black/40 ring-1 ring-white/10"
      : "shadow-black/20 ring-1 ring-black/5";
  return `${MENU_BASE} ${ring}`;
}

export function postOptionsMenuStyle(theme) {
  return {
    boxShadow:
      theme === "dark"
        ? "0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 10px 10px -5px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(255, 255, 255, 0.1)"
        : "0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 10px 10px -5px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(0, 0, 0, 0.05)",
    animation: "dropdownFadeIn 0.2s ease-out",
  };
}

export const POST_OPTIONS_ITEM_HOVER =
  "hover:bg-base-200/50 transition-colors duration-150 rounded-lg";
