/** Ana menü satırı — aktif / pasif */
export function mainNavRowClasses(isActive) {
  return `group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-200 ${
    isActive
      ? "bg-accent/12 font-semibold text-accent shadow-sm ring-1 ring-accent/15"
      : "text-base-content/70 hover:bg-base-200/55 hover:text-base-content"
  }`;
}

export function mainNavIndicatorClasses(isActive) {
  return `absolute left-0 top-1/2 hidden h-8 w-1 -translate-y-1/2 rounded-full bg-accent lg:block ${
    isActive ? "opacity-100" : "opacity-0"
  }`;
}

export const mainNavIconShellClass =
  "relative flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-base-200/40 transition group-hover:bg-base-200/80";

/** "Daha fazla" tetikleyicisi — ikon kabında group-hover yok */
export const moreMenuTriggerIconShellClass =
  "relative flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-base-200/40";
