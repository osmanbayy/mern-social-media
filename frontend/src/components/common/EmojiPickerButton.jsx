import { BsEmojiSmileFill } from "react-icons/bs";
import { useRef, useEffect, useLayoutEffect, useState } from "react";
import { createPortal } from "react-dom";
import EmojiMartPicker from "./EmojiMartPicker";

function resolveTheme(theme) {
  if (typeof theme === "string") return theme;
  if (theme && typeof theme === "object" && "theme" in theme) return theme.theme;
  return "light";
}

function computeFixedPosition(buttonEl, pickerEl) {
  const btn = buttonEl.getBoundingClientRect();
  const pw = pickerEl?.offsetWidth ?? 480;
  const ph = pickerEl?.offsetHeight ?? 420;
  const margin = 8;
  let left = btn.left;
  let top = btn.bottom + margin;

  if (left + pw > window.innerWidth - margin) {
    left = Math.max(margin, window.innerWidth - pw - margin);
  }
  if (left < margin) left = margin;

  if (top + ph > window.innerHeight - margin) {
    top = Math.max(margin, btn.top - ph - margin);
  }

  return { top, left };
}

const EmojiPickerButton = ({
  theme,
  onEmojiClick,
  showPicker,
  setShowPicker,
  buttonClassName,
  iconClassName,
  pickerClassName,
}) => {
  const emojiButtonRef = useRef(null);
  const emojiPickerRef = useRef(null);
  const [popoverStyle, setPopoverStyle] = useState({ top: 0, left: 0 });
  const appTheme = resolveTheme(theme);

  useLayoutEffect(() => {
    if (!showPicker || !emojiButtonRef.current) return;

    const update = () => {
      if (!emojiButtonRef.current) return;
      setPopoverStyle(
        computeFixedPosition(emojiButtonRef.current, emojiPickerRef.current)
      );
    };

    update();
    const id1 = requestAnimationFrame(() => {
      requestAnimationFrame(update);
    });

    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);

    return () => {
      cancelAnimationFrame(id1);
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
    };
  }, [showPicker]);

  useEffect(() => {
    if (!showPicker || !emojiPickerRef.current) return;
    const el = emojiPickerRef.current;
    const update = () => {
      if (!emojiButtonRef.current) return;
      setPopoverStyle(
        computeFixedPosition(emojiButtonRef.current, emojiPickerRef.current)
      );
    };
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [showPicker]);

  useEffect(() => {
    if (!showPicker) return;

    const handleClickOutside = (e) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(e.target) &&
        emojiButtonRef.current &&
        !emojiButtonRef.current.contains(e.target)
      ) {
        setShowPicker(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [showPicker, setShowPicker]);

  const defaultIcon =
    appTheme === "dark" ? "fill-amber-400/95" : "fill-sky-500";

  const popover =
    showPicker &&
    createPortal(
      <>
        <div
          className="fixed inset-0 z-[10050] bg-black/25 md:hidden"
          onClick={() => setShowPicker(false)}
          aria-hidden
        />
        <div
          ref={emojiPickerRef}
          className={`fixed z-[10051] max-h-[min(420px,calc(100vh-2rem))] overflow-hidden rounded-2xl border border-base-300/50 bg-base-100 shadow-2xl animate-dropdownFadeIn ${pickerClassName ?? ""}`}
          style={{
            top: popoverStyle.top,
            left: popoverStyle.left,
            maxWidth: "min(480px, calc(100vw - 2rem))",
            width: "min(480px, calc(100vw - 2rem))",
          }}
        >
          <EmojiMartPicker theme={appTheme} onEmojiSelect={onEmojiClick} />
        </div>
      </>,
      document.body
    );

  return (
    <div className="relative">
      <button
        type="button"
        ref={emojiButtonRef}
        className={
          buttonClassName ??
          "flex h-10 w-10 cursor-pointer items-center justify-center rounded-full p-2 transition-colors hover:bg-primary/10"
        }
        onClick={() => setShowPicker(!showPicker)}
        aria-label="Emoji seç"
      >
        <BsEmojiSmileFill
          className={`h-5 w-5 ${iconClassName ?? defaultIcon}`}
        />
      </button>
      {popover}
    </div>
  );
};

export default EmojiPickerButton;
