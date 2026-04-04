import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  sendMessage,
  editMessage,
  toggleMessageReaction,
  deleteMessage,
  deleteMessagesBulk,
  clearConversationMessages,
} from "../api/messages";
import {
  invalidateConversationsAndMessageRequests,
  invalidateMessagesAndConversations,
  invalidateMessagesConversationsAndMessageRequests,
  invalidateMessagesForConversation,
} from "../utils/queryInvalidation";
import { appendMessageToMessagesCache, replaceMessageInMessagesCache } from "../utils/chatQueryCache";

/**
 * Sohbet gönderimi, düzenleme, tepki ve silme mutasyonları + gönderim göndericisi.
 */
export function useChatMutations({
  socket,
  navigate,
  isCompose,
  conversationId,
  peerId,
  text,
  editingMessage,
  setEditingMessage,
  setText,
  clearReplyTarget,
  replyingToRef,
  textareaRef,
  exitSelectionMode,
  clearPendingAttachments,
}) {
  const queryClient = useQueryClient();

  const { mutate: send, isPending } = useMutation({
    mutationFn: ({ text: t, replyToId, attachments }) =>
      sendMessage(peerId, {
        text: t,
        ...(replyToId ? { replyTo: String(replyToId) } : {}),
        ...(Array.isArray(attachments) && attachments.length ? { attachments } : {}),
      }),
    onSuccess: (data) => {
      setText("");
      clearPendingAttachments();
      clearReplyTarget();
      if (socket && conversationId) {
        socket.emit("chat:typing_stop", { conversationId });
      }
      if (data?.pending || data?.request) {
        invalidateConversationsAndMessageRequests(queryClient);
        toast.success(
          "Mesaj isteği gönderildi. Karşı taraf kabul edince sohbet açılır."
        );
        textareaRef.current?.focus();
        return;
      }
      const newCid = data?.conversationId;
      if (isCompose && newCid) {
        if (socket) {
          socket.emit("chat:typing_stop", { conversationId: newCid });
        }
        navigate(`/messages/chat/${newCid}`, { replace: true });
        invalidateConversationsAndMessageRequests(queryClient);
        toast.success("Mesaj gönderildi");
        textareaRef.current?.focus();
        return;
      }
      const { conversationId: _cid, ...msg } = data;
      if (msg?._id && conversationId) {
        appendMessageToMessagesCache(queryClient, conversationId, msg);
      }
      invalidateMessagesConversationsAndMessageRequests(queryClient, conversationId);
      textareaRef.current?.focus();
    },
    onError: (e) => toast.error(e.message),
  });

  const { mutate: saveEdit, isPending: isEditPending } = useMutation({
    mutationFn: () => {
      if (!editingMessage?._id || !conversationId) {
        return Promise.reject(new Error("Düzenleme geçersiz."));
      }
      return editMessage(conversationId, editingMessage._id, { text });
    },
    onSuccess: (data) => {
      setEditingMessage(null);
      setText("");
      if (data?._id && conversationId) {
        replaceMessageInMessagesCache(queryClient, conversationId, data);
      }
      invalidateMessagesAndConversations(queryClient, conversationId);
      textareaRef.current?.focus();
      toast.success("Mesaj güncellendi");
    },
    onError: (e) => toast.error(e.message),
  });

  const { mutate: sendReaction } = useMutation({
    mutationFn: ({ messageId, emoji }) => {
      if (!conversationId) {
        return Promise.reject(new Error("Sohbet yok."));
      }
      return toggleMessageReaction(conversationId, messageId, emoji);
    },
    onSuccess: () => {
      invalidateMessagesForConversation(queryClient, conversationId);
    },
    onError: (e) => toast.error(e.message),
  });

  const { mutate: removeMessage } = useMutation({
    mutationFn: (messageId) => {
      if (!conversationId) return Promise.reject(new Error("Sohbet yok."));
      return deleteMessage(conversationId, messageId);
    },
    onSuccess: () => {
      invalidateMessagesAndConversations(queryClient, conversationId);
      toast.success("Mesaj silindi");
    },
    onError: (e) => toast.error(e.message),
  });

  const { mutate: removeMessagesBulk, isPending: isBulkDeleting } = useMutation({
    mutationFn: (ids) => {
      if (!conversationId) return Promise.reject(new Error("Sohbet yok."));
      return deleteMessagesBulk(conversationId, ids);
    },
    onSuccess: (_, ids) => {
      exitSelectionMode();
      invalidateMessagesAndConversations(queryClient, conversationId);
      toast.success(`${ids.length} mesaj silindi`);
    },
    onError: (e) => toast.error(e.message),
  });

  const { mutate: clearChat, isPending: isClearing } = useMutation({
    mutationFn: () => {
      if (!conversationId) return Promise.reject(new Error("Sohbet yok."));
      return clearConversationMessages(conversationId);
    },
    onSuccess: () => {
      invalidateMessagesAndConversations(queryClient, conversationId);
      toast.success("Sohbet temizlendi");
    },
    onError: (e) => toast.error(e.message),
  });

  return {
    send,
    saveEdit,
    sendReaction,
    removeMessage,
    removeMessagesBulk,
    clearChat,
    isPending,
    isEditPending,
    isBulkDeleting,
    isClearing,
  };
}
