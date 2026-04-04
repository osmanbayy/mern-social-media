import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { CHAT_NEAR_BOTTOM_PX } from "../constants/chatUi";

/**
 * Sohbet mesaj listesinde alta yapışık kalma + görsel yüklenince yeniden alta kaydırma.
 */
export function useChatStickToBottomScroll({
  conversationId,
  composePeerId,
  isCompose,
  isLoading,
  messageCount,
}) {
  const scrollRef = useRef(null);
  const messagesContentRef = useRef(null);
  const stickToBottomRef = useRef(true);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);

  const scrollToBottomInstant = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, []);

  const scrollToBottom = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    stickToBottomRef.current = true;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, []);

  useLayoutEffect(() => {
    stickToBottomRef.current = true;
  }, [conversationId, composePeerId]);

  useLayoutEffect(() => {
    if (!conversationId || isCompose || isLoading) return;
    if (!stickToBottomRef.current) return;
    scrollToBottomInstant();
    requestAnimationFrame(() => {
      scrollToBottomInstant();
    });
  }, [conversationId, isCompose, isLoading, messageCount, scrollToBottomInstant]);

  useEffect(() => {
    const contentEl = messagesContentRef.current;
    if (!contentEl) return undefined;
    const ro = new ResizeObserver(() => {
      if (!stickToBottomRef.current) return;
      scrollToBottomInstant();
    });
    ro.observe(contentEl);
    return () => ro.disconnect();
  }, [conversationId, isLoading, messageCount, scrollToBottomInstant]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return undefined;
    const onScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = el;
      const distFromBottom = scrollHeight - scrollTop - clientHeight;
      setShowScrollToBottom(distFromBottom > CHAT_NEAR_BOTTOM_PX);
      stickToBottomRef.current = distFromBottom <= CHAT_NEAR_BOTTOM_PX;
    };
    onScroll();
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [conversationId, messageCount]);

  return {
    scrollRef,
    messagesContentRef,
    scrollToBottom,
    scrollToBottomInstant,
    showScrollToBottom,
    setShowScrollToBottom,
  };
}
