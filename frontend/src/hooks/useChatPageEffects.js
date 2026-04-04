import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ackMessagesDelivered, markConversationRead } from "../api/messages";
import { invalidateConversations } from "../utils/queryInvalidation";
import { getMessageDocId } from "../utils/messageChat";
import { chatMessageIsDelivered, chatSenderId } from "../utils/chatMessageModel";

/**
 * Sohbet sayfası yan etkileri: okundu, iletildi onayı, konuşma listesi yenileme, yazıyor sinyali.
 */
export function useChatPageEffects({
  socket,
  conversationId,
  isCompose,
  loadingMessages,
  messages,
  myId,
  peerId,
  setPeerTyping,
}) {
  const queryClient = useQueryClient();
  const deliveredAckSentRef = useRef(new Set());
  const peerTypingClearRef = useRef(null);

  useEffect(() => {
    deliveredAckSentRef.current = new Set();
  }, [conversationId]);

  useEffect(() => {
    if (!conversationId || isCompose || loadingMessages) return;
    markConversationRead(conversationId).catch(() => {});
  }, [conversationId, isCompose, loadingMessages, messages.length]);

  useEffect(() => {
    if (!conversationId || !myId || !messages.length) return;
    const ids = messages
      .filter((msg) => chatSenderId(msg) !== myId && !chatMessageIsDelivered(msg))
      .map((msg) => getMessageDocId(msg))
      .filter(Boolean)
      .filter((id) => !deliveredAckSentRef.current.has(id));
    if (ids.length === 0) return;
    ids.forEach((id) => deliveredAckSentRef.current.add(id));
    ackMessagesDelivered(conversationId, ids).catch(() => {
      ids.forEach((id) => deliveredAckSentRef.current.delete(id));
    });
  }, [conversationId, myId, messages]);

  useEffect(() => {
    if (!conversationId || isCompose) return undefined;
    const t = window.setInterval(() => {
      invalidateConversations(queryClient);
    }, 28000);
    return () => window.clearInterval(t);
  }, [conversationId, isCompose, queryClient]);

  useEffect(() => {
    if (!socket || !conversationId || !peerId) return undefined;
    const onTyping = (p) => {
      if (String(p?.conversationId) !== String(conversationId)) return;
      if (String(p?.userId) !== String(peerId)) return;
      setPeerTyping(true);
      if (peerTypingClearRef.current != null) {
        window.clearTimeout(peerTypingClearRef.current);
      }
      peerTypingClearRef.current = window.setTimeout(() => setPeerTyping(false), 2800);
    };
    const onStop = (p) => {
      if (String(p?.conversationId) !== String(conversationId)) return;
      if (String(p?.userId) !== String(peerId)) return;
      setPeerTyping(false);
    };
    socket.on("chat:typing", onTyping);
    socket.on("chat:typing_stop", onStop);
    return () => {
      socket.off("chat:typing", onTyping);
      socket.off("chat:typing_stop", onStop);
    };
  }, [socket, conversationId, peerId, setPeerTyping]);
}
