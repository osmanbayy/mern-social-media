import { useCallback, useState } from "react";
import toast from "react-hot-toast";
import { getQuotedMessageId, scrollChildIntoContainerCenter } from "../utils/messageChat";

/**
 * Alıntıya tıklanınca ilgili mesaja kaydır ve kısa süre vurgula.
 */
export function useChatQuoteNavigation(scrollRef) {
  const [highlightedMessageId, setHighlightedMessageId] = useState(null);

  const handleQuoteNavigate = useCallback(
    (e, msg) => {
      e.preventDefault();
      e.stopPropagation();
      const qid = getQuotedMessageId(msg);
      if (!qid) return;
      const normalized = String(qid).trim();
      const container = scrollRef.current;
      const el = document.getElementById(`chat-msg-${normalized}`);
      if (!el || !container?.contains(el)) {
        toast.error(
          "Bu mesaj listede görünmüyor (daha eski mesajlar yüklenmediyse görünmez)."
        );
        return;
      }
      requestAnimationFrame(() => {
        scrollChildIntoContainerCenter(container, el);
      });
      setHighlightedMessageId(normalized);
      window.setTimeout(() => setHighlightedMessageId(null), 2200);
    },
    [scrollRef]
  );

  return { highlightedMessageId, handleQuoteNavigate };
}
