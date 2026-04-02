import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  getConversations,
  getMessages,
  sendMessage,
  editMessage,
  markConversationRead,
  ackMessagesDelivered,
  toggleMessageReaction,
} from "../../api/messages";
import { getUserByIdSummary } from "../../api/users";
import { useAuth } from "../../contexts/AuthContext";
import { useSocket } from "../../contexts/SocketContext";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import defaultProfilePicture from "../../assets/avatar-placeholder.png";
import { FaArrowLeft } from "react-icons/fa6";
import {
  LuSendHorizontal,
  LuCheck,
  LuCheckCheck,
  LuEllipsisVertical,
  LuChevronsDown,
} from "react-icons/lu";
import toast from "react-hot-toast";
import MessageSharePreview from "../../components/messages/MessageSharePreview";
import {
  CHAT_DENSITY_MAP,
  CHAT_FONT_MAP,
  DAY_PILL_CLASSES,
  HEADER_STYLE_CLASSES,
  getBubbleRadius,
} from "../../constants/chatAppearance";
import { useChatAppearance } from "../../contexts/ChatAppearanceContext";
import ChatSettingsModal from "../../components/chat/ChatSettingsModal";
import SwipeableMessageRow from "../../components/messages/SwipeableMessageRow";
import MessageContextMenu from "../../components/messages/MessageContextMenu";
import ForwardMessageModal from "../../components/messages/ForwardMessageModal";
import {
  getMessageDocId,
  getQuotedMessageId,
  getReplyPreviewText,
  messageHasQuotedReply,
  scrollChildIntoContainerCenter,
  MESSAGE_REACTION_EMOJIS,
} from "../../utils/messageChat";

const formatMsgTime = (iso) => {
  if (!iso) return "";
  return new Date(iso).toLocaleTimeString("tr-TR", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatDayLabel = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return "Bugün";
  if (d.toDateString() === yesterday.toDateString()) return "Dün";
  return d.toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: d.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
  });
};

const senderId = (m) =>
  (typeof m.sender === "object" && m.sender?._id) || m.sender?.toString?.() || String(m.sender);

/** API `read` + şema `readReceipt` (geriye uyum) */
const messageIsRead = (m) => m.read === true || m.readReceipt === true;

const messageIsDelivered = (m) =>
  m.delivered === true || (m.deliveredAt != null && m.deliveredAt !== "");

/** Gönderilen → iletildi → okundu (sadece kendi mesajlarımız) */
const messageDeliveryPhase = (m) => {
  if (messageIsRead(m)) return "read";
  if (messageIsDelivered(m)) return "delivered";
  return "sent";
};

const formatLastSeen = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "az önce";
  if (mins < 60) return `${mins} dk önce`;
  const h = Math.floor(mins / 60);
  if (h < 24) return `${h} sa. önce`;
  return d.toLocaleString("tr-TR", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
};

/** Sunucunun paylaşım-only mesajlarda kullandığı görünmez işaret (Word Joiner) */
const visibleMessageText = (t) => {
  if (t == null) return "";
  return String(t).replace(/\u2060/g, "").trim();
};

const ChatPage = () => {
  const { conversationId, userId: composePeerId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const { authUser } = useAuth();
  const [text, setText] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
  /** State bir sonraki render’da güncellenir; gönderimde anında okumak için ref */
  const replyingToRef = useRef(null);
  const setReplyTarget = useCallback((m) => {
    replyingToRef.current = m;
    setReplyingTo(m);
  }, []);
  const clearReplyTarget = useCallback(() => {
    replyingToRef.current = null;
    setReplyingTo(null);
  }, []);

  const [editingMessage, setEditingMessage] = useState(null);
  const [actionMenu, setActionMenu] = useState(null);
  const [forwardOpen, setForwardOpen] = useState(false);
  const [forwardTargetMessage, setForwardTargetMessage] = useState(null);
  const [chatSettingsOpen, setChatSettingsOpen] = useState(false);
  const [highlightedMessageId, setHighlightedMessageId] = useState(null);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const [peerTyping, setPeerTyping] = useState(false);
  const longPressTimerRef = useRef(null);
  const typingStopTimerRef = useRef(null);
  const peerTypingClearRef = useRef(null);
  const deliveredAckSentRef = useRef(new Set());
  const { socket } = useSocket();

  const { appearance, resolvedBubbles, chatBgClass } = useChatAppearance();
  const density = CHAT_DENSITY_MAP[appearance.messageDensity] || CHAT_DENSITY_MAP.default;
  const messageFontClass = CHAT_FONT_MAP[appearance.messageFontSize] || CHAT_FONT_MAP.md;
  const headerBarClass =
    HEADER_STYLE_CLASSES[appearance.headerStyle] || HEADER_STYLE_CLASSES.default;
  const dayPillClass = DAY_PILL_CLASSES[appearance.dayPillStyle] || DAY_PILL_CLASSES.default;
  const bottomRef = useRef(null);
  const scrollRef = useRef(null);
  const textareaRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, []);

  const handleQuoteNavigate = useCallback((e, msg) => {
    e.preventDefault();
    e.stopPropagation();
    const qid = getQuotedMessageId(msg);
    if (!qid) return;
    const normalized = String(qid).trim();
    const container = scrollRef.current;
    const el = document.getElementById(`chat-msg-${normalized}`);
    if (!el || !container?.contains(el)) {
      toast.error("Bu mesaj listede görünmüyor (daha eski mesajlar yüklenmediyse görünmez).");
      return;
    }
    requestAnimationFrame(() => {
      scrollChildIntoContainerCenter(container, el);
    });
    setHighlightedMessageId(normalized);
    window.setTimeout(() => setHighlightedMessageId(null), 2200);
  }, []);

  const clearLongPress = () => {
    if (longPressTimerRef.current != null) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  const copyMessageToClipboard = async (m) => {
    try {
      if (m.share?.kind === "post") {
        const pid = m.share.post?._id ?? m.share.post;
        if (pid) {
          await navigator.clipboard.writeText(`${window.location.origin}/post/${pid}`);
          toast.success("Gönderi linki kopyalandı");
          return;
        }
      }
      if (m.share?.kind === "profile") {
        const u = m.share.profileUser;
        const un = typeof u === "object" && u?.username ? u.username : null;
        if (un) {
          await navigator.clipboard.writeText(`${window.location.origin}/profile/${un}`);
          toast.success("Profil linki kopyalandı");
          return;
        }
      }
      if (visibleMessageText(m.text)) {
        await navigator.clipboard.writeText(visibleMessageText(m.text));
        toast.success("Kopyalandı");
      }
    } catch {
      toast.error("Kopyalanamadı");
    }
  };

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        setActionMenu(null);
        clearReplyTarget();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [clearReplyTarget]);

  const isCompose = Boolean(composePeerId);
  const myId = authUser?._id?.toString();

  const peerFromNav = location.state?.messagePeer;

  const { data: conversations, isLoading: loadingConversations } = useQuery({
    queryKey: ["conversations"],
    queryFn: getConversations,
  });

  const conv = !isCompose
    ? conversations?.find((c) => String(c._id) === String(conversationId))
    : undefined;

  const needPeerFetch =
    !!isCompose &&
    !!composePeerId &&
    (!peerFromNav || String(peerFromNav._id) !== String(composePeerId));

  const {
    data: peerSummary,
    isLoading: loadingPeerSummary,
  } = useQuery({
    queryKey: ["userByIdSummary", composePeerId],
    queryFn: () => getUserByIdSummary(composePeerId),
    enabled: needPeerFetch,
    retry: 1,
  });

  useEffect(() => {
    if (!isCompose || !composePeerId || !conversations?.length) return;
    const target = String(composePeerId);
    const existing = conversations.find((c) => {
      if (c.otherUser?._id && String(c.otherUser._id) === target) return true;
      return c.participants?.some((p) => String(p) === target);
    });
    if (existing) {
      navigate(`/messages/chat/${existing._id}`, { replace: true });
    }
  }, [isCompose, composePeerId, conversations, navigate]);

  const peerPlaceholder = useMemo(() => {
    if (!isCompose || !composePeerId) return null;
    return {
      _id: composePeerId,
      username: "…",
      fullname: "Kullanıcı",
      profileImage: null,
      online: false,
      lastSeen: null,
    };
  }, [isCompose, composePeerId]);

  const otherUser =
    conv?.otherUser ??
    (peerFromNav && String(peerFromNav._id) === String(composePeerId)
      ? peerFromNav
      : null) ??
    peerSummary ??
    peerPlaceholder;

  /** Sohbet katılımcılarından karşı tarafın id'si (API'de otherUser._id eksik olsa bile gönderim çalışır) */
  const peerId = useMemo(() => {
    if (isCompose && composePeerId) return composePeerId;
    if (!conv?.participants?.length || !authUser?._id) return null;
    const self = authUser._id.toString();
    const other = conv.participants.find((p) => p.toString() !== self);
    return other != null ? other.toString() : null;
  }, [isCompose, composePeerId, conv, authUser]);

  const { data: messagesData, isLoading } = useQuery({
    queryKey: ["messages", conversationId],
    queryFn: () => getMessages(conversationId, 1),
    enabled: !!conversationId && !isCompose,
  });

  const messages = messagesData?.messages || [];

  const timeline = useMemo(() => {
    const rows = [];
    let lastDay = null;
    for (let i = 0; i < messages.length; i++) {
      const m = messages[i];
      const day = m.createdAt ? new Date(m.createdAt).toDateString() : null;
      if (day && day !== lastDay) {
        rows.push({ kind: "day", id: `day-${day}-${i}`, date: m.createdAt });
        lastDay = day;
      }
      rows.push({ kind: "msg", m, index: i });
    }
    return rows;
  }, [messages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages?.length, conversationId, composePeerId]);

  useEffect(() => {
    if (!conversationId || isCompose || isLoading) return;
    markConversationRead(conversationId).catch(() => {});
  }, [conversationId, isCompose, isLoading, messages.length]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return undefined;
    const onScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = el;
      const distFromBottom = scrollHeight - scrollTop - clientHeight;
      setShowScrollToBottom(distFromBottom > 180);
    };
    onScroll();
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [conversationId, messages.length]);

  useEffect(() => {
    deliveredAckSentRef.current = new Set();
  }, [conversationId]);

  /** Karşı tarafın mesajları için iletildi (cihazda alındı) */
  useEffect(() => {
    if (!conversationId || !myId || !messages.length) return;
    const ids = messages
      .filter((msg) => senderId(msg) !== myId && !messageIsDelivered(msg))
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
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
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
  }, [socket, conversationId, peerId]);

  const { mutate: send, isPending } = useMutation({
    mutationFn: ({ text: t, replyToId }) =>
      sendMessage(peerId, {
        text: t,
        ...(replyToId ? { replyTo: String(replyToId) } : {}),
      }),
    onSuccess: (data) => {
      setText("");
      clearReplyTarget();
      if (socket && conversationId) {
        socket.emit("chat:typing_stop", { conversationId });
      }
      if (data?.pending || data?.request) {
        queryClient.invalidateQueries({ queryKey: ["conversations"] });
        queryClient.invalidateQueries({ queryKey: ["messageRequests"] });
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
        queryClient.invalidateQueries({ queryKey: ["conversations"] });
        queryClient.invalidateQueries({ queryKey: ["messageRequests"] });
        toast.success("Mesaj gönderildi");
        textareaRef.current?.focus();
        return;
      }
      const { conversationId: _cid, ...msg } = data;
      if (msg?._id && conversationId) {
        queryClient.setQueryData(["messages", conversationId], (old) => {
          const base = old || {
            messages: [],
            page: 1,
            totalPages: 1,
            total: 0,
          };
          const list = base.messages || [];
          if (list.some((m) => String(m._id) === String(msg._id))) {
            return base;
          }
          return {
            ...base,
            messages: [...list, msg],
            total: (base.total ?? list.length) + 1,
          };
        });
      }
      queryClient.invalidateQueries({ queryKey: ["messages", conversationId] });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      queryClient.invalidateQueries({ queryKey: ["messageRequests"] });
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
        queryClient.setQueryData(["messages", conversationId], (old) => {
          const base = old || { messages: [], page: 1, totalPages: 1, total: 0 };
          const list = base.messages || [];
          const next = list.map((msg) =>
            String(msg._id) === String(data._id) ? { ...msg, ...data } : msg
          );
          return { ...base, messages: next };
        });
      }
      queryClient.invalidateQueries({ queryKey: ["messages", conversationId] });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
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
      queryClient.invalidateQueries({ queryKey: ["messages", conversationId] });
    },
    onError: (e) => toast.error(e.message),
  });

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

  const handleSubmit = (e) => {
    e?.preventDefault?.();
    if (editingMessage) {
      if (!text.trim() || isEditPending) return;
      saveEdit();
      return;
    }
    if (!text.trim() || !peerId || isPending) return;
    const replyToId =
      getMessageDocId(replyingTo) ?? getMessageDocId(replyingToRef.current);
    send({ text: text.trim(), replyToId });
    /** İlk mesajın onSuccess’i gelmeden ikinci gönderimde eski alıntı id’si gitmesin */
    clearReplyTarget();
  };

  const canSubmit = editingMessage
    ? Boolean(text.trim()) && !isEditPending
    : Boolean(text.trim() && peerId) && !isPending;

  const startEdit = (m) => {
    if (m.share?.kind) return;
    const t = visibleMessageText(m.text);
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

  return (
    <div className="flex h-[100dvh] max-h-[100dvh] min-h-0 w-full min-w-0 flex-col overflow-x-hidden bg-base-100">
      {/* Header */}
      <header className={headerBarClass}>
        <div className="flex w-full min-w-0 max-w-full items-center gap-1 px-1 py-2 sm:px-2 sm:py-2.5">
          <button
            type="button"
            className="btn btn-ghost btn-sm btn-circle shrink-0"
            aria-label="Geri"
            onClick={() => navigate("/messages", { replace: true })}
          >
            <FaArrowLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            className="flex min-w-0 max-w-full flex-1 items-center gap-3 rounded-2xl px-2 py-1.5 text-left transition-colors hover:bg-base-200/70"
            onClick={() => otherUser && navigate(`/profile/${otherUser.username}`)}
          >
            <div className="relative shrink-0">
              <div className="avatar">
                <div className="w-11 h-11 rounded-full ring-2 ring-base-300/80 ring-offset-2 ring-offset-base-100">
                  <img
                    src={otherUser?.profileImage || defaultProfilePicture}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold leading-tight text-base-content">
                {otherUser?.fullname || otherUser?.username || "…"}
              </p>
              <p className="truncate text-xs text-base-content/50">@{otherUser?.username}</p>
              <p className="truncate text-[11px] font-medium leading-tight text-primary/90">
                {otherUser?.online
                  ? "Çevrimiçi"
                  : otherUser?.lastSeen
                    ? `Son görülme: ${formatLastSeen(otherUser.lastSeen)}`
                    : "Çevrimdışı"}
              </p>
            </div>
          </button>
          <div className="dropdown dropdown-end shrink-0">
            <button
              type="button"
              tabIndex={0}
              className="btn btn-ghost btn-sm btn-circle"
              aria-label="Sohbet menüsü"
              aria-haspopup="menu"
            >
              <LuEllipsisVertical className="h-5 w-5" />
            </button>
            <ul
              tabIndex={0}
              className="dropdown-content menu z-40 mt-1 w-52 rounded-2xl border border-base-300/50 bg-base-100 p-2 shadow-lg"
              role="menu"
            >
              <li>
                <button
                  type="button"
                  className="rounded-xl text-left font-medium"
                  role="menuitem"
                  onClick={() => setChatSettingsOpen(true)}
                >
                  Sohbet ayarları
                </button>
              </li>
            </ul>
          </div>
        </div>
      </header>

      <ChatSettingsModal isOpen={chatSettingsOpen} onClose={() => setChatSettingsOpen(false)} />

      <MessageContextMenu
        open={actionMenu != null}
        x={actionMenu?.x ?? 0}
        y={actionMenu?.y ?? 0}
        onClose={() => setActionMenu(null)}
        canEdit={
          !!(
            actionMenu &&
            senderId(actionMenu.message) === myId &&
            !actionMenu.message.share?.kind &&
            visibleMessageText(actionMenu.message.text)
          )
        }
        onEdit={() => actionMenu && startEdit(actionMenu.message)}
        onCopy={() => actionMenu && copyMessageToClipboard(actionMenu.message)}
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

      {/* Messages */}
      <div className="relative flex min-h-0 min-w-0 flex-1 flex-col">
        <div
          ref={scrollRef}
          className={`scrollbar-hide min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden ${density.scrollPadding} ${chatBgClass}`}
        >
        {isLoading && (
          <div className="flex justify-center py-16">
            <LoadingSpinner />
          </div>
        )}

        {!isLoading && messages.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-2 py-20 text-center">
            <div className="rounded-full bg-base-200/80 p-4">
              <LuSendHorizontal className="h-8 w-8 text-base-content/30" />
            </div>
            <p className="text-sm font-medium text-base-content/70">Henüz mesaj yok</p>
            <p className="max-w-xs text-xs text-base-content/45">
              İlk mesajınızı aşağıdan göndererek sohbete başlayın.
            </p>
          </div>
        )}

        {!isLoading && messages.length > 0 && (
          <div className={`flex w-full min-w-0 max-w-full flex-col ${density.rowGap} pb-2`}>
            {timeline.map((row) => {
              if (row.kind === "day") {
                return (
                  <div
                    key={row.id}
                    className="flex justify-center py-4 first:pt-0"
                  >
                    <span className={dayPillClass}>{formatDayLabel(row.date)}</span>
                  </div>
                );
              }

              const m = row.m;
              const i = row.index;
              const rowId = getMessageDocId(m);
              const mine = senderId(m) === myId;
              const bubbleResolved = mine ? resolvedBubbles.mine : resolvedBubbles.theirs;
              const prev = messages[i - 1];
              const next = messages[i + 1];
              const sameSenderAsPrev = prev && senderId(prev) === senderId(m);
              const sameSenderAsNext = next && senderId(next) === senderId(m);

              const clusterTop = !sameSenderAsPrev;
              const clusterBottom = !sameSenderAsNext;

              const bubbleRadius = getBubbleRadius(
                appearance.bubbleShape,
                mine,
                clusterTop,
                clusterBottom
              );

              return (
                <SwipeableMessageRow
                  key={m._id}
                  disabled={isCompose || !conversationId}
                  onReply={() => {
                    setReplyTarget(m);
                    setEditingMessage(null);
                    textareaRef.current?.focus();
                  }}
                >
                  <div
                    id={rowId ? `chat-msg-${rowId}` : undefined}
                    className={`flex w-full min-w-0 max-w-full ${mine ? "justify-end" : "justify-start"} ${
                      clusterTop ? density.clusterTop : density.clusterRest
                    } ${
                      highlightedMessageId && rowId && highlightedMessageId === rowId
                        ? "scroll-mt-20 rounded-2xl ring-2 ring-primary/50"
                        : ""
                    }`}
                  >
                    <div
                      className={`flex min-w-0 max-w-full flex-col ${mine ? "items-end" : "items-start"} ${
                        m.share?.kind
                          ? "w-full max-w-[min(96%,min(26rem,calc(100vw-1.5rem)))] sm:max-w-[min(96%,28rem)]"
                          : "w-full max-w-[min(28rem,85%,calc(100vw-1.5rem))]"
                      }`}
                    >
                      <div
                        role="group"
                        onContextMenu={(e) => {
                          e.preventDefault();
                          setActionMenu({ message: m, x: e.clientX, y: e.clientY });
                        }}
                        onTouchStart={(e) => {
                          clearLongPress();
                          longPressTimerRef.current = window.setTimeout(() => {
                            const touch = e.touches[0];
                            if (touch) {
                              setActionMenu({
                                message: m,
                                x: touch.clientX,
                                y: touch.clientY,
                              });
                            }
                          }, 520);
                        }}
                        onTouchEnd={clearLongPress}
                        onTouchCancel={clearLongPress}
                        onTouchMove={clearLongPress}
                      >
                        <div
                          className={`relative min-w-0 max-w-full shadow-sm ${messageFontClass} ${bubbleRadius} ${
                            m.share?.kind ? "px-2 py-2 sm:px-2.5 sm:py-2.5" : "px-3.5 py-2.5"
                          } ${
                            bubbleResolved.mode === "theme"
                              ? mine
                                ? "bg-primary text-primary-content"
                                : "border border-base-300/40 bg-base-100 text-base-content"
                              : mine
                                ? ""
                                : "border border-black/5 dark:border-white/10"
                          }`}
                          style={
                            bubbleResolved.mode === "inline"
                              ? {
                                  backgroundColor: bubbleResolved.bg,
                                  color: bubbleResolved.color,
                                }
                              : undefined
                          }
                        >
                          {messageHasQuotedReply(m) &&
                            (getQuotedMessageId(m) ? (
                              <button
                                type="button"
                                className={`mb-2 w-full rounded-lg border-l-[3px] pl-2.5 text-left transition hover:bg-black/5 active:scale-[0.99] dark:hover:bg-white/10 ${
                                  mine
                                    ? bubbleResolved.mode === "theme"
                                      ? "border-primary-content/45"
                                      : "border-current/35"
                                    : "border-primary/55"
                                }`}
                                onClick={(e) => handleQuoteNavigate(e, m)}
                              >
                                <p
                                  className={`text-[11px] font-semibold ${
                                    mine ? "opacity-95" : "text-base-content/85"
                                  }`}
                                >
                                  {m.replyTo?.sender?.fullname ||
                                    m.replyTo?.sender?.username ||
                                    m.replySnapshot?.senderLabel ||
                                    "…"}
                                </p>
                                <p
                                  className={`line-clamp-2 text-[12px] ${
                                    mine ? "opacity-85" : "text-base-content/65"
                                  }`}
                                >
                                  {m.replyTo
                                    ? getReplyPreviewText(m.replyTo)
                                    : (m.replySnapshot?.preview || "").trim() || "Mesaj"}
                                </p>
                              </button>
                            ) : (
                              <div
                                className={`mb-2 border-l-[3px] pl-2.5 ${
                                  mine
                                    ? bubbleResolved.mode === "theme"
                                      ? "border-primary-content/45"
                                      : "border-current/35"
                                    : "border-primary/55"
                                }`}
                              >
                                <p
                                  className={`text-[11px] font-semibold ${
                                    mine ? "opacity-95" : "text-base-content/85"
                                  }`}
                                >
                                  {m.replyTo?.sender?.fullname ||
                                    m.replyTo?.sender?.username ||
                                    m.replySnapshot?.senderLabel ||
                                    "…"}
                                </p>
                                <p
                                  className={`line-clamp-2 text-[12px] ${
                                    mine ? "opacity-85" : "text-base-content/65"
                                  }`}
                                >
                                  {m.replyTo
                                    ? getReplyPreviewText(m.replyTo)
                                    : (m.replySnapshot?.preview || "").trim() || "Mesaj"}
                                </p>
                              </div>
                            ))}
                          {m.share?.kind ? (
                            <MessageSharePreview share={m.share} mine={mine} />
                          ) : null}
                          {visibleMessageText(m.text) ? (
                            <p
                              className={`max-w-full whitespace-pre-wrap break-words [overflow-wrap:anywhere] [word-break:break-word] ${m.share?.kind ? "mt-2" : ""}`}
                            >
                              {m.text}
                            </p>
                          ) : null}
                        </div>
                        {Array.isArray(m.reactions) && m.reactions.length > 0 ? (
                          <div
                            className={`mt-1 flex max-w-full flex-wrap items-center gap-1 px-0.5 ${
                              mine ? "justify-end" : "justify-start"
                            }`}
                          >
                            {(() => {
                              const map = new Map();
                              for (const r of m.reactions) {
                                const e = r.emoji;
                                map.set(e, (map.get(e) || 0) + 1);
                              }
                              return [...map.entries()].map(([emoji, count]) => (
                                <span
                                  key={emoji}
                                  className="inline-flex items-baseline gap-0.5 text-lg leading-none"
                                  title={count > 1 ? `${count} tepki` : undefined}
                                >
                                  <span aria-hidden>{emoji}</span>
                                  {count > 1 ? (
                                    <span className="text-[10px] font-medium tabular-nums text-base-content/50">
                                      {count}
                                    </span>
                                  ) : null}
                                </span>
                              ));
                            })()}
                          </div>
                        ) : null}
                      </div>
                      {clusterBottom && (
                        <span
                          className={`mt-1 flex flex-wrap items-center gap-x-1 gap-y-0 px-1 text-[10px] tabular-nums text-base-content/35 ${
                            mine ? "justify-end text-right" : "text-left"
                          }`}
                        >
                          {formatMsgTime(m.createdAt)}
                          {m.editedAt && (
                            <span className="text-[9px] font-normal normal-case opacity-80">
                              düzenlendi
                            </span>
                          )}
                          {mine &&
                            (() => {
                              const phase = messageDeliveryPhase(m);
                              const label =
                                phase === "read"
                                  ? "Okundu"
                                  : phase === "delivered"
                                    ? "İletildi"
                                    : "Gönderildi";
                              return (
                                <>
                                  <span
                                    className="inline-flex shrink-0 items-center gap-0.5"
                                    title={label}
                                    aria-label={label}
                                  >
                                    {phase === "read" ? (
                                      <LuCheckCheck
                                        className={`size-3.5 ${
                                          resolvedBubbles.mine.mode === "theme" ? "text-primary" : ""
                                        }`}
                                        style={
                                          resolvedBubbles.mine.mode === "inline"
                                            ? { color: resolvedBubbles.mine.color, opacity: 0.88 }
                                            : undefined
                                        }
                                      />
                                    ) : null}
                                    {phase === "delivered" ? (
                                      <LuCheckCheck className="size-3.5 text-base-content/50" />
                                    ) : null}
                                    {phase === "sent" ? (
                                      <LuCheck className="size-3.5 text-base-content/45" />
                                    ) : null}
                                  </span>
                                  <span className="max-w-[4.5rem] text-[9px] font-semibold uppercase leading-tight tracking-wide text-base-content/45">
                                    {label}
                                  </span>
                                </>
                              );
                            })()}
                        </span>
                      )}
                    </div>
                  </div>
                </SwipeableMessageRow>
              );
            })}
          </div>
        )}
        <div ref={bottomRef} className="h-px w-full shrink-0" />
        </div>
        {showScrollToBottom && (
          <button
            type="button"
            className="btn btn-circle btn-primary btn-sm absolute bottom-4 right-2 z-20 h-8 w-8 min-h-0 border-0 p-0 shadow-md sm:bottom-5 sm:right-4"
            onClick={() => {
              scrollToBottom();
              setShowScrollToBottom(false);
            }}
            aria-label="En alta in"
          >
            <LuChevronsDown className="h-3.5 w-3.5" strokeWidth={2.25} />
          </button>
        )}
      </div>

      {/* Composer */}
      <div className="min-w-0 shrink-0 border-t border-base-300/60 bg-base-100/95 px-2 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur-md sm:px-3">
        {peerTyping && !editingMessage && (
          <div className="mb-2 flex items-center gap-2 px-1">
            <span className="loading loading-dots loading-xs text-primary" />
            <span className="text-xs font-medium text-base-content/65">Yazıyor…</span>
          </div>
        )}
        {editingMessage && (
          <div className="mb-2 flex items-center justify-between gap-2 rounded-xl border border-accent/25 bg-accent/10 px-3 py-2">
            <p className="min-w-0 text-sm font-medium text-base-content">Mesajı düzenliyorsun</p>
            <button type="button" className="btn btn-ghost btn-xs shrink-0" onClick={cancelEdit}>
              İptal
            </button>
          </div>
        )}
        {replyingTo && !editingMessage && (
          <div className="mb-2 flex items-start gap-2 rounded-xl border border-primary/25 bg-primary/8 px-3 py-2">
            <div className="min-w-0 flex-1 border-l-2 border-primary pl-2">
              <p className="text-[11px] font-bold text-primary">
                {senderId(replyingTo) === myId
                  ? "Sen"
                  : replyingTo.sender?.fullname || replyingTo.sender?.username || "…"}
              </p>
              <p className="line-clamp-2 text-xs text-base-content/65">{getReplyPreviewText(replyingTo)}</p>
            </div>
            <button
              type="button"
              className="btn btn-ghost btn-xs btn-circle shrink-0"
              aria-label="Yanıtı kaldır"
              onClick={clearReplyTarget}
            >
              ×
            </button>
          </div>
        )}
        <form
          className="flex w-full min-w-0 max-w-full items-end gap-2"
          onSubmit={handleSubmit}
        >
          <label className="relative min-h-[48px] min-w-0 flex-1">
            <textarea
              ref={textareaRef}
              className="textarea w-full min-w-0 max-w-full resize-none border border-base-300/70 bg-base-200/40 py-3 pl-4 pr-3 text-sm leading-normal text-base-content placeholder:text-base-content/40 focus:border-primary/40 focus:bg-base-100 focus:outline-none focus:ring-2 focus:ring-primary/15 rounded-2xl min-h-[48px] max-h-[120px] [overflow-wrap:anywhere]"
              placeholder={editingMessage ? "Düzenlenen mesaj…" : "Mesaj yazın…"}
              rows={1}
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                if (socket && conversationId && !editingMessage) {
                  socket.emit("chat:typing", { conversationId });
                  if (typingStopTimerRef.current != null) {
                    window.clearTimeout(typingStopTimerRef.current);
                  }
                  typingStopTimerRef.current = window.setTimeout(() => {
                    socket.emit("chat:typing_stop", { conversationId });
                  }, 2200);
                }
              }}
              onBlur={() => {
                if (socket && conversationId) {
                  socket.emit("chat:typing_stop", { conversationId });
                }
              }}
              onInput={(e) => {
                const el = e.target;
                el.style.height = "auto";
                el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />
          </label>
          <button
            type="submit"
            className="btn btn-primary btn-circle h-12 w-12 shrink-0 shadow-md shadow-primary/20 disabled:opacity-40"
            disabled={!canSubmit}
            aria-label={editingMessage ? "Kaydet" : "Gönder"}
          >
            {isPending || isEditPending ? (
              <span className="loading loading-spinner loading-sm" />
            ) : (
              <LuSendHorizontal className="h-5 w-5" />
            )}
          </button>
        </form>
        <p className="mt-1.5 text-center text-[10px] text-base-content/35">
          Enter ile gönder · Shift+Enter ile satır
        </p>
      </div>
    </div>
  );
};

export default ChatPage;
