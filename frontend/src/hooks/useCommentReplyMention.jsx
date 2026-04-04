import { useCallback, useRef } from "react";
import useMention from "./useMention";

export function useCommentReplyMention(replyText, onReplyTextChange, externalRef) {
  const internalRef = useRef(null);

  const setReplyTextareaRef = useCallback(
    (el) => {
      internalRef.current = el;
      if (typeof externalRef === "function") {
        externalRef(el);
      } else if (externalRef && typeof externalRef === "object") {
        externalRef.current = el;
      }
    },
    [externalRef]
  );

  const replyMention = useMention(replyText, onReplyTextChange, internalRef);

  return {
    setReplyTextareaRef,
    replyMention,
  };
}
