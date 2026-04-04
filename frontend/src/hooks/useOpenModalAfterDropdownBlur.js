import { useCallback } from "react";

export function useOpenModalAfterDropdownBlur(triggerRef) {
  return useCallback(
    (setOpen) => {
      triggerRef.current?.blur?.();
      if (typeof document !== "undefined" && document.activeElement?.blur) {
        document.activeElement.blur();
      }
      window.setTimeout(() => setOpen(true), 100);
    },
    [triggerRef]
  );
}
