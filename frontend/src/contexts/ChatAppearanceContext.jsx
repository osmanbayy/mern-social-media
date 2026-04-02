import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  CHAT_APPEARANCE_STORAGE_KEY,
  DEFAULT_CHAT_APPEARANCE,
  loadChatAppearanceFromStorage,
  parseChatAppearance,
  resolveBubbleAppearance,
  CHAT_BG_CLASSES,
} from "../constants/chatAppearance";

const ChatAppearanceContext = createContext(null);

export function useChatAppearance() {
  const ctx = useContext(ChatAppearanceContext);
  if (!ctx) {
    throw new Error("useChatAppearance must be used within ChatAppearanceProvider");
  }
  return ctx;
}

export function ChatAppearanceProvider({ children }) {
  const [appearance, setAppearanceState] = useState(() => loadChatAppearanceFromStorage());

  const persist = useCallback((next) => {
    setAppearanceState(next);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(CHAT_APPEARANCE_STORAGE_KEY, JSON.stringify(next));
      } catch {
        /* ignore quota */
      }
    }
  }, []);

  const setAppearance = useCallback((partial) => {
    setAppearanceState((prev) => {
      const merged = parseChatAppearance({ ...prev, ...partial });
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(CHAT_APPEARANCE_STORAGE_KEY, JSON.stringify(merged));
        } catch {
          /* ignore */
        }
      }
      return merged;
    });
  }, []);

  const resetAppearance = useCallback(() => {
    persist({ ...DEFAULT_CHAT_APPEARANCE });
  }, [persist]);

  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === CHAT_APPEARANCE_STORAGE_KEY && e.newValue != null) {
        try {
          setAppearanceState(parseChatAppearance(JSON.parse(e.newValue)));
        } catch {
          /* ignore */
        }
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const resolved = useMemo(() => resolveBubbleAppearance(appearance), [appearance]);
  const chatBgClass = CHAT_BG_CLASSES[appearance.chatBg] || CHAT_BG_CLASSES.default;

  const value = useMemo(
    () => ({
      appearance,
      setAppearance,
      resetAppearance,
      resolvedBubbles: resolved,
      chatBgClass,
    }),
    [appearance, setAppearance, resetAppearance, resolved, chatBgClass]
  );

  return <ChatAppearanceContext.Provider value={value}>{children}</ChatAppearanceContext.Provider>;
}
