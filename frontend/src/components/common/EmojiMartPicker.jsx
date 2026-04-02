import data from "@emoji-mart/data";
import i18n from "@emoji-mart/data/i18n/tr.json";
import Picker from "@emoji-mart/react";

/**
 * Emoji Mart — arama, kategoriler, Türkçe arayüz.
 * Eski API ile uyum: onEmojiSelect({ emoji: string })
 */
export default function EmojiMartPicker({ theme, onEmojiSelect, className = "" }) {
  const martTheme = theme === "dark" ? "dark" : "light";

  return (
    <div
      className={`emoji-mart-host w-full max-w-[min(100vw-2rem,480px)] overflow-hidden rounded-xl ${className}`}
    >
      <Picker
        data={data}
        i18n={i18n}
        theme={martTheme}
        dynamicWidth
        onEmojiSelect={(emoji) => {
          if (emoji?.native) {
            onEmojiSelect({ emoji: emoji.native });
          }
        }}
        previewPosition="none"
        skinTonePosition="search"
        perLine={10}
        maxFrequentRows={2}
        emojiSize={24}
        emojiButtonSize={42}
        searchPosition="sticky"
        navPosition="top"
      />
    </div>
  );
}
