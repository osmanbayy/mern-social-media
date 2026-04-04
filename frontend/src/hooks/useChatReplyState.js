import { useCallback, useRef, useState } from "react";

export function useChatReplyState() {
  const [replyingTo, setReplyingTo] = useState(null);
  const replyingToRef = useRef(null);

  const setReplyTarget = useCallback((m) => {
    replyingToRef.current = m;
    setReplyingTo(m);
  }, []);

  const clearReplyTarget = useCallback(() => {
    replyingToRef.current = null;
    setReplyingTo(null);
  }, []);

  return { replyingTo, setReplyTarget, clearReplyTarget, replyingToRef };
}
