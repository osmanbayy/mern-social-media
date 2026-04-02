import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import {
  LuPencil,
  LuCopy,
  LuQuote,
  LuForward,
  LuTrash2,
} from "react-icons/lu";

/**
 * @param {{
 *   open: boolean;
 *   x: number;
 *   y: number;
 *   onClose: () => void;
 *   onEdit?: () => void;
 *   onCopy: () => void;
 *   onQuote: () => void;
 *   onForward: () => void;
 *   canEdit: boolean;
 *   canDelete?: boolean;
 *   onDelete?: () => void;
 *   reactionEmojis?: string[];
 *   onReaction?: (emoji: string) => void;
 * }} props
 */
export default function MessageContextMenu({
  open,
  x,
  y,
  onClose,
  onEdit,
  onCopy,
  onQuote,
  onForward,
  canEdit,
  canDelete,
  onDelete,
  reactionEmojis,
  onReaction,
}) {
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    const onDown = (e) => {
      if (ref.current?.contains(e.target)) return;
      onClose();
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("mousedown", onDown);
    window.addEventListener("touchstart", onDown);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("touchstart", onDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  const vw = typeof window !== "undefined" ? window.innerWidth : 400;
  const vh = typeof window !== "undefined" ? window.innerHeight : 600;
  const showReactions = Array.isArray(reactionEmojis) && reactionEmojis.length > 0 && typeof onReaction === "function";
  const menuW = showReactions ? Math.min(320, vw - 16) : 200;
  const menuH = showReactions ? 300 : canDelete && onDelete ? 260 : 220;
  const left = Math.min(Math.max(8, x), vw - menuW - 8);
  const top = Math.min(Math.max(8, y), vh - menuH - 8);

  return createPortal(
    <div
      ref={ref}
      role="menu"
      className="fixed z-[250] min-w-[11.5rem] rounded-2xl border border-base-300/60 bg-base-100/98 py-1.5 shadow-2xl backdrop-blur-md"
      style={{ left, top, width: showReactions ? menuW : undefined }}
      onClick={(e) => e.stopPropagation()}
    >
      {showReactions && (
        <div
          className="flex flex-wrap items-center justify-center gap-1 border-b border-base-300/50 px-2 pb-2 pt-1"
          role="group"
          aria-label="Tepki seç"
        >
          {reactionEmojis.map((emo) => (
            <button
              key={emo}
              type="button"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-2xl leading-none transition-colors hover:bg-base-200/90 active:scale-95"
              onClick={() => {
                onReaction(emo);
                onClose();
              }}
            >
              {emo}
            </button>
          ))}
        </div>
      )}
      {canEdit && onEdit && (
        <button
          type="button"
          role="menuitem"
          className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm font-medium text-base-content hover:bg-base-200/80"
          onClick={() => {
            onEdit();
            onClose();
          }}
        >
          <LuPencil className="h-4 w-4 shrink-0 opacity-70" />
          Düzenle
        </button>
      )}
      <button
        type="button"
        role="menuitem"
        className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm font-medium text-base-content hover:bg-base-200/80"
        onClick={() => {
          onCopy();
          onClose();
        }}
      >
        <LuCopy className="h-4 w-4 shrink-0 opacity-70" />
        Kopyala
      </button>
      <button
        type="button"
        role="menuitem"
        className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm font-medium text-base-content hover:bg-base-200/80"
        onClick={() => {
          onQuote();
          onClose();
        }}
      >
        <LuQuote className="h-4 w-4 shrink-0 opacity-70" />
        Alıntıla
      </button>
      <button
        type="button"
        role="menuitem"
        className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm font-medium text-base-content hover:bg-base-200/80"
        onClick={() => {
          onForward();
          onClose();
        }}
      >
        <LuForward className="h-4 w-4 shrink-0 opacity-70" />
        İlet
      </button>
      {canDelete && onDelete && (
        <button
          type="button"
          role="menuitem"
          className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm font-medium text-error hover:bg-error/10"
          onClick={() => {
            onDelete();
            onClose();
          }}
        >
          <LuTrash2 className="h-4 w-4 shrink-0 opacity-90" />
          Sil
        </button>
      )}
    </div>,
    document.body
  );
}
