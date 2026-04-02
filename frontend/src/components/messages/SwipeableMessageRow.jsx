import { useCallback, useRef, useState } from "react";
import { LuReply } from "react-icons/lu";

const THRESHOLD = 52;
const MAX = 68;

/**
 * Sağa kaydırınca yanıt (alıntı) tetikler — WhatsApp benzeri.
 */
export default function SwipeableMessageRow({ children, onReply, disabled }) {
  const [offset, setOffset] = useState(0);
  const offsetRef = useRef(0);
  const startRef = useRef({ x: 0, y: 0, ok: false });

  const reset = useCallback(() => {
    offsetRef.current = 0;
    setOffset(0);
    startRef.current.ok = false;
  }, []);

  const finish = useCallback(() => {
    if (startRef.current.ok && offsetRef.current >= THRESHOLD) {
      onReply?.();
    }
    reset();
  }, [onReply, reset]);

  if (disabled) {
    return children;
  }

  return (
    <div className="relative min-w-0 w-full overflow-hidden">
      <div
        className="pointer-events-none absolute left-1 top-1/2 z-0 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-primary/20 text-primary shadow-sm"
        style={{ opacity: Math.min(1, offset / THRESHOLD) }}
        aria-hidden
      >
        <LuReply className="h-4 w-4" />
      </div>
      <div
        role="presentation"
        style={{ transform: `translateX(${offset}px)` }}
        className="relative z-10 min-w-0 touch-pan-y will-change-transform"
        onPointerDown={(e) => {
          if (e.pointerType === "mouse" && e.button !== 0) return;
          startRef.current = {
            x: e.clientX,
            y: e.clientY,
            ok: true,
          };
          try {
            e.currentTarget.setPointerCapture(e.pointerId);
          } catch {
            /* ignore */
          }
        }}
        onPointerMove={(e) => {
          if (!startRef.current.ok) return;
          const dx = e.clientX - startRef.current.x;
          const dy = e.clientY - startRef.current.y;
          if (dx > 6 && dx > Math.abs(dy) * 0.55) {
            const next = Math.min(MAX, dx * 0.48);
            offsetRef.current = next;
            setOffset(next);
          }
        }}
        onPointerUp={finish}
        onPointerCancel={reset}
      >
        {children}
      </div>
    </div>
  );
}
