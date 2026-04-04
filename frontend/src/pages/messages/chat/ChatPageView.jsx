import { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useSocket } from "../../../contexts/SocketContext";
import { useChatAppearance } from "../../../contexts/ChatAppearanceContext";
import ChatSettingsModal from "../../../components/chat/ChatSettingsModal";
import MessageContextMenu from "../../../components/messages/MessageContextMenu";
import ForwardMessageModal from "../../../components/messages/ForwardMessageModal";
import {
  CHAT_DENSITY_MAP,
  CHAT_FONT_MAP,
  DAY_PILL_CLASSES,
  HEADER_STYLE_CLASSES,
} from "../../../constants/chatAppearance";
import { getMessageDocId, MESSAGE_REACTION_EMOJIS } from "../../../utils/messageChat";
import { copyChatMessageToClipboard } from "../../../utils/chatClipboard";
import {
  chatSenderId,
  chatVisibleMessageText,
} from "../../../utils/chatMessageModel";
import { useChatThread } from "../../../hooks/useChatThread";
import { useChatStickToBottomScroll } from "../../../hooks/useChatStickToBottomScroll";
import { useChatQuoteNavigation } from "../../../hooks/useChatQuoteNavigation";
import { useChatReplyState } from "../../../hooks/useChatReplyState";
import { usePendingChatAttachments } from "../../../hooks/usePendingChatAttachments";
import { useChatMutations } from "../../../hooks/useChatMutations";
import { useChatPageEffects } from "../../../hooks/useChatPageEffects";
import LoadingSpinner from "../../../components/common/LoadingSpinner";
import ChatPageHeader from "../../../components/chat/ChatPageHeader";
import ChatMessagesPanel from "../../../components/chat/ChatMessagesPanel";
import ChatComposer from "../../../components/chat/ChatComposer";

const ChatPageView = () => {
  const { socket } = useSocket();
  const [text, setText] = useState("");
  const { replyingTo, setReplyTarget, clearReplyTarget, replyingToRef } =
    useChatReplyState();
  const [editingMessage, setEditingMessage] = useState(null);
  const [actionMenu, setActionMenu] = useState(null);
  const [forwardOpen, setForwardOpen] = useState(false);
  const [forwardTargetMessage, setForwardTargetMessage] = useState(null);
  const [chatSettingsOpen, setChatSettingsOpen] = useState(false);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedMessageIds, setSelectedMessageIds] = useState([]);
  const [peerTyping, setPeerTyping] = useState(false);
  const longPressTimerRef = useRef(null);
  const typingStopTimerRef = useRef(null);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);

  const {
    conversationId,
    composePeerId,
    navigate,
    isCompose,
    myId,
    loadingConversations,
    conversations,
    conv,
    needPeerFetch,
    loadingPeerSummary,
    otherUser,
    peerId,
    loadingMessages,
    messages,
    timeline,
  } = useChatThread();

  const {
    scrollRef,
    messagesContentRef,
    scrollToBottom,
    showScrollToBottom,
    setShowScrollToBottom,
  } = useChatStickToBottomScroll({
    conversationId,
    composePeerId,
    isCompose,
    isLoading: loadingMessages,
    messageCount: messages.length,
  });

  const { highlightedMessageId, handleQuoteNavigate } =
    useChatQuoteNavigation(scrollRef);

  const {
    pendingAttachments,
    removePendingAttachment,
    handleChatFiles,
    clearPendingAttachments,
    maxPendingAttachments,
  } = usePendingChatAttachments();

  const exitSelectionMode = useCallback(() => {
    setSelectionMode(false);
    setSelectedMessageIds([]);
  }, []);

  const toggleMessageSelect = useCallback((id) => {
    if (!id) return;
    setSelectedMessageIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }, []);

  const clearLongPress = useCallback(() => {
    if (longPressTimerRef.current != null) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  }, []);

  const {
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
  } = useChatMutations({
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
  });

  useChatPageEffects({
    socket,
    conversationId,
    isCompose,
    loadingMessages,
    messages,
    myId,
    peerId,
    setPeerTyping,
  });

  const { appearance, resolvedBubbles, chatBgClass } = useChatAppearance();
  const density = CHAT_DENSITY_MAP[appearance.messageDensity] || CHAT_DENSITY_MAP.default;
  const messageFontClass =
    CHAT_FONT_MAP[appearance.messageFontSize] || CHAT_FONT_MAP.md;
  const headerBarClass =
    HEADER_STYLE_CLASSES[appearance.headerStyle] || HEADER_STYLE_CLASSES.default;
  const dayPillClass =
    DAY_PILL_CLASSES[appearance.dayPillStyle] || DAY_PILL_CLASSES.default;

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        setActionMenu(null);
        clearReplyTarget();
        exitSelectionMode();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [clearReplyTarget, exitSelectionMode]);

  const handleBulkDelete = useCallback(() => {
    if (selectedMessageIds.length === 0) return;
    if (
      !window.confirm(
        `${selectedMessageIds.length} mesaj kalıcı olarak silinecek. Devam edilsin mi?`
      )
    ) {
      return;
    }
    removeMessagesBulk(selectedMessageIds);
  }, [selectedMessageIds, removeMessagesBulk]);

  const handleSubmit = (e) => {
    e?.preventDefault?.();
    if (editingMessage) {
      if (!text.trim() || isEditPending) return;
      saveEdit();
      return;
    }
    if (!peerId || isPending) return;
    const readyAttachments = pendingAttachments
      .filter((x) => x.status === "ready")
      .map((x) => ({
        url: x.url,
        mimeType: x.mimeType,
        originalName: x.originalName,
        size: x.size,
        kind: x.kind,
      }));
    if (pendingAttachments.some((x) => x.status === "uploading")) {
      toast.error("Dosyalar hâlâ yükleniyor.");
      return;
    }
    if (!text.trim() && readyAttachments.length === 0) return;
    const replyToId =
      getMessageDocId(replyingTo) ?? getMessageDocId(replyingToRef.current);
    send({
      text: text.trim(),
      replyToId,
      attachments: readyAttachments,
    });
    clearReplyTarget();
  };

  const pendingHasUploading = pendingAttachments.some((x) => x.status === "uploading");
  const pendingReadyCount = pendingAttachments.filter((x) => x.status === "ready").length;

  const canSubmit = editingMessage
    ? Boolean(text.trim()) && !isEditPending
    : Boolean(
        (text.trim() || pendingReadyCount > 0) &&
          peerId &&
          !pendingHasUploading
      ) && !isPending;

  const startEdit = (m) => {
    if (m.share?.kind) return;
    const t = chatVisibleMessageText(m.text);
    if (!t) return;
    setEditingMessage(m);
    setText(t);
    clearReplyTarget();
    setTimeout(() => textareaRef.current?.focus(), 0);
  };

  const cancelEdit = () => {
    setEditingMessage(null);
    setText("");
  };

  if (!conversationId && !composePeerId) {
    return null;
  }

  if (loadingConversations) {
    return (
      <div className="flex h-[100dvh] max-h-[100dvh] items-center justify-center bg-base-100">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (isCompose && needPeerFetch && loadingPeerSummary) {
    return (
      <div className="flex h-[100dvh] max-h-[100dvh] items-center justify-center bg-base-100">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!isCompose && conversations && !conv) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="text-base-content/70">Sohbet bulunamadı.</p>
        <button
          type="button"
          className="btn btn-primary btn-sm rounded-full px-6"
          onClick={() => navigate("/messages", { replace: true })}
        >
          Mesajlara dön
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-[100dvh] max-h-[100dvh] min-h-0 w-full min-w-0 flex-col overflow-x-hidden bg-base-100">
      <ChatPageHeader
        selectionMode={selectionMode}
        exitSelectionMode={exitSelectionMode}
        navigate={navigate}
        selectedMessageIds={selectedMessageIds}
        isBulkDeleting={isBulkDeleting}
        onBulkDelete={handleBulkDelete}
        otherUser={otherUser}
        headerBarClass={headerBarClass}
        conversationId={conversationId}
        isCompose={isCompose}
        isClearing={isClearing}
        onClearChat={() => {
          if (
            !window.confirm(
              "Bu sohbetteki tüm mesajlar kalıcı olarak silinecek. Emin misiniz?"
            )
          ) {
            return;
          }
          clearChat();
        }}
        onOpenChatSettings={() => setChatSettingsOpen(true)}
        onEnterSelectionMode={() => {
          setSelectionMode(true);
          setSelectedMessageIds([]);
        }}
      />

      <ChatSettingsModal
        isOpen={chatSettingsOpen}
        onClose={() => setChatSettingsOpen(false)}
      />

      <MessageContextMenu
        open={actionMenu != null}
        x={actionMenu?.x ?? 0}
        y={actionMenu?.y ?? 0}
        onClose={() => setActionMenu(null)}
        canEdit={
          !!(
            actionMenu &&
            chatSenderId(actionMenu.message) === myId &&
            !actionMenu.message.share?.kind &&
            chatVisibleMessageText(actionMenu.message.text)
          )
        }
        onEdit={() => actionMenu && startEdit(actionMenu.message)}
        onCopy={() => actionMenu && copyChatMessageToClipboard(actionMenu.message)}
        onQuote={() => {
          if (actionMenu) {
            setReplyTarget(actionMenu.message);
            setEditingMessage(null);
            textareaRef.current?.focus();
          }
        }}
        onForward={() => {
          if (actionMenu) {
            setForwardTargetMessage(actionMenu.message);
            setForwardOpen(true);
          }
        }}
        canDelete={
          !!(
            actionMenu &&
            conversationId &&
            !isCompose &&
            chatSenderId(actionMenu.message) === myId
          )
        }
        onDelete={() => {
          if (!actionMenu?.message?._id) return;
          if (!window.confirm("Bu mesaj silinsin mi?")) return;
          removeMessage(actionMenu.message._id);
        }}
        reactionEmojis={conversationId && !isCompose ? MESSAGE_REACTION_EMOJIS : undefined}
        onReaction={(emoji) => {
          if (!actionMenu?.message?._id) return;
          sendReaction({ messageId: actionMenu.message._id, emoji });
        }}
      />

      <ForwardMessageModal
        isOpen={forwardOpen}
        onClose={() => {
          setForwardOpen(false);
          setForwardTargetMessage(null);
        }}
        message={forwardTargetMessage}
        excludeUserId={peerId}
      />

      <ChatMessagesPanel
        scrollRef={scrollRef}
        messagesContentRef={messagesContentRef}
        density={density}
        chatBgClass={chatBgClass}
        isLoading={loadingMessages}
        messages={messages}
        timeline={timeline}
        appearance={appearance}
        resolvedBubbles={resolvedBubbles}
        messageFontClass={messageFontClass}
        dayPillClass={dayPillClass}
        myId={myId}
        isCompose={isCompose}
        conversationId={conversationId}
        selectionMode={selectionMode}
        selectedMessageIds={selectedMessageIds}
        highlightedMessageId={highlightedMessageId}
        showScrollToBottom={showScrollToBottom}
        setShowScrollToBottom={setShowScrollToBottom}
        scrollToBottom={scrollToBottom}
        onToggleSelect={toggleMessageSelect}
        onQuoteNavigate={handleQuoteNavigate}
        clearLongPress={clearLongPress}
        longPressTimerRef={longPressTimerRef}
        setActionMenu={setActionMenu}
        setReplyTarget={setReplyTarget}
        setEditingMessage={setEditingMessage}
        textareaRef={textareaRef}
      />

      <ChatComposer
        peerTyping={peerTyping}
        editingMessage={editingMessage}
        cancelEdit={cancelEdit}
        pendingAttachments={pendingAttachments}
        removePendingAttachment={removePendingAttachment}
        handleChatFiles={handleChatFiles}
        maxPendingAttachments={maxPendingAttachments}
        replyingTo={replyingTo}
        clearReplyTarget={clearReplyTarget}
        myId={myId}
        text={text}
        setText={setText}
        onSubmit={handleSubmit}
        canSubmit={canSubmit}
        isPending={isPending}
        isEditPending={isEditPending}
        fileInputRef={fileInputRef}
        textareaRef={textareaRef}
        socket={socket}
        conversationId={conversationId}
        typingStopTimerRef={typingStopTimerRef}
      />
    </div>
  );
};

export default ChatPageView;
