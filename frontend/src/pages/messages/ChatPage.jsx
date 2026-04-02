import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  getConversations,
  getMessages,
  sendMessage,
  markConversationRead,
} from "../../api/messages";
import { getUserByIdSummary } from "../../api/users";
import { useAuth } from "../../contexts/AuthContext";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import defaultProfilePicture from "../../assets/avatar-placeholder.png";
import { FaArrowLeft } from "react-icons/fa6";
import { LuSendHorizontal, LuCheck, LuCheckCheck, LuEllipsisVertical } from "react-icons/lu";
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
  const [chatSettingsOpen, setChatSettingsOpen] = useState(false);
  const { appearance, resolvedBubbles, chatBgClass } = useChatAppearance();
  const density = CHAT_DENSITY_MAP[appearance.messageDensity] || CHAT_DENSITY_MAP.default;
  const messageFontClass = CHAT_FONT_MAP[appearance.messageFontSize] || CHAT_FONT_MAP.md;
  const headerBarClass =
    HEADER_STYLE_CLASSES[appearance.headerStyle] || HEADER_STYLE_CLASSES.default;
  const dayPillClass = DAY_PILL_CLASSES[appearance.dayPillStyle] || DAY_PILL_CLASSES.default;
  const bottomRef = useRef(null);
  const scrollRef = useRef(null);
  const textareaRef = useRef(null);

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

  const { mutate: send, isPending } = useMutation({
    mutationFn: () => sendMessage(peerId, { text }),
    onSuccess: (data) => {
      setText("");
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
    if (!text.trim() || !peerId || isPending) return;
    send();
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
              <p className="truncate text-xs text-base-content/50">
                @{otherUser?.username}
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

      {/* Messages */}
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
                <div
                  key={m._id}
                  className={`flex w-full min-w-0 max-w-full ${mine ? "justify-end" : "justify-start"} ${
                    clusterTop ? density.clusterTop : density.clusterRest
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
                    {clusterBottom && (
                      <span
                        className={`mt-1 flex items-center gap-1 px-1 text-[10px] tabular-nums text-base-content/35 ${
                          mine ? "justify-end text-right" : "text-left"
                        }`}
                      >
                        {formatMsgTime(m.createdAt)}
                        {mine && (
                          <span
                            className="inline-flex shrink-0"
                            title={messageIsRead(m) ? "Görüldü" : "İletildi"}
                            aria-label={messageIsRead(m) ? "Görüldü" : "İletildi"}
                          >
                            {messageIsRead(m) ? (
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
                            ) : (
                              <LuCheck className="size-3.5 text-base-content/45" />
                            )}
                          </span>
                        )}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
        <div ref={bottomRef} className="h-px w-full shrink-0" />
      </div>

      {/* Composer */}
      <div className="min-w-0 shrink-0 border-t border-base-300/60 bg-base-100/95 px-2 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur-md sm:px-3">
        <form
          className="flex w-full min-w-0 max-w-full items-end gap-2"
          onSubmit={handleSubmit}
        >
          <label className="relative min-h-[48px] min-w-0 flex-1">
            <textarea
              ref={textareaRef}
              className="textarea w-full min-w-0 max-w-full resize-none border border-base-300/70 bg-base-200/40 py-3 pl-4 pr-3 text-sm leading-normal text-base-content placeholder:text-base-content/40 focus:border-primary/40 focus:bg-base-100 focus:outline-none focus:ring-2 focus:ring-primary/15 rounded-2xl min-h-[48px] max-h-[120px] [overflow-wrap:anywhere]"
              placeholder="Mesaj yazın…"
              rows={1}
              value={text}
              onChange={(e) => setText(e.target.value)}
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
            disabled={!text.trim() || !peerId || isPending}
            aria-label="Gönder"
          >
            {isPending ? (
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
