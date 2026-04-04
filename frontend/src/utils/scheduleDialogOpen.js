/**
 * Calls `element.showModal()` after the node exists (e.g. `<dialog>` rendered on next tick).
 */
export function scheduleDialogOpen(elementId, { intervalMs = 50, maxAttempts = 30 } = {}) {
  let attempts = 0;

  const tick = () => {
    const el = document.getElementById(elementId);
    if (el && typeof el.showModal === "function") {
      el.showModal();
      return;
    }
    if (++attempts < maxAttempts) {
      setTimeout(tick, intervalMs);
    }
  };

  tick();
}
