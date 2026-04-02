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
import { LuSendHorizontal, LuCheck, LuCheckCheck } from "react-icons/lu";
import toast from "react-hot-toast";
import MessageSharePreview from "../../components/messages/MessageSharePreview";

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
    <div className="flex h-[100dvh] max-h-[100dvh] min-h-0 w-full flex-col bg-base-100">
      {/* Header */}
      <header className="sticky top-0 z-30 shrink-0 border-b border-base-300/60 bg-base-100/90 shadow-sm backdrop-blur-lg backdrop-saturate-150">
        <div className="flex w-full items-center gap-1 px-1 py-2 sm:px-2 sm:py-2.5">
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
            className="flex min-w-0 flex-1 items-center gap-3 rounded-2xl px-2 py-1.5 text-left transition-colors hover:bg-base-200/70"
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
        </div>
      </header>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="scrollbar-hide min-h-0 flex-1 overflow-y-auto bg-gradient-to-b from-base-200/25 via-base-100 to-base-100 px-1 py-4 sm:px-2"
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
          <div className="flex w-full flex-col gap-1 pb-2">
            {timeline.map((row) => {
              if (row.kind === "day") {
                return (
                  <div
                    key={row.id}
                    className="flex justify-center py-4 first:pt-0"
                  >
                    <span className="rounded-full bg-base-300/40 px-3 py-1 text-[11px] font-medium uppercase tracking-wide text-base-content/55">
                      {formatDayLabel(row.date)}
                    </span>
                  </div>
                );
              }

              const m = row.m;
              const i = row.index;
              const mine = senderId(m) === myId;
              const prev = messages[i - 1];
              const next = messages[i + 1];
              const sameSenderAsPrev = prev && senderId(prev) === senderId(m);
              const sameSenderAsNext = next && senderId(next) === senderId(m);

              const clusterTop = !sameSenderAsPrev;
              const clusterBottom = !sameSenderAsNext;

              const bubbleRadius = mine
                ? clusterTop && clusterBottom
                  ? "rounded-2xl rounded-br-md"
                  : clusterTop
                  ? "rounded-2xl rounded-br-sm"
                  : clusterBottom
                  ? "rounded-2xl rounded-br-md"
                  : "rounded-2xl rounded-br-sm"
                : clusterTop && clusterBottom
                ? "rounded-2xl rounded-bl-md"
                : clusterTop
                ? "rounded-2xl rounded-bl-sm"
                : clusterBottom
                ? "rounded-2xl rounded-bl-md"
                : "rounded-2xl rounded-bl-sm";

              return (
                <div
                  key={m._id}
                  className={`flex gap-2 ${mine ? "justify-end" : "justify-start"} ${
                    clusterTop ? "mt-2" : "mt-0.5"
                  }`}
                >
                  {!mine && (
                    <div className="w-8 shrink-0 self-end pb-1">
                      {clusterTop ? (
                        <img
                          src={otherUser?.profileImage || defaultProfilePicture}
                          alt=""
                          className="h-8 w-8 rounded-full object-cover ring-1 ring-base-300/60"
                        />
                      ) : (
                        <span className="block w-8" aria-hidden />
                      )}
                    </div>
                  )}

                  <div
                    className={`flex flex-col ${mine ? "items-end" : "items-start"} ${
                      m.share?.kind
                        ? "w-full max-w-[min(96%,min(26rem,100vw))] sm:max-w-[min(96%,28rem)]"
                        : "max-w-[min(85%,28rem)]"
                    }`}
                  >
                    <div
                      className={`relative text-[15px] leading-relaxed shadow-sm ${bubbleRadius} ${
                        m.share?.kind ? "px-2 py-2 sm:px-2.5 sm:py-2.5" : "px-3.5 py-2.5"
                      } ${
                        mine
                          ? "bg-primary text-primary-content"
                          : "border border-base-300/40 bg-base-100 text-base-content"
                      }`}
                    >
                      {m.share?.kind ? (
                        <MessageSharePreview share={m.share} mine={mine} />
                      ) : null}
                      {visibleMessageText(m.text) ? (
                        <p
                          className={`whitespace-pre-wrap break-words ${m.share?.kind ? "mt-2" : ""}`}
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
                              <LuCheckCheck className="size-3.5 text-primary" />
                            ) : (
                              <LuCheck className="size-3.5 text-base-content/45" />
                            )}
                          </span>
                        )}
                      </span>
                    )}
                  </div>

                  {mine && <div className="w-8 shrink-0" aria-hidden />}
                </div>
              );
            })}
          </div>
        )}
        <div ref={bottomRef} className="h-px w-full shrink-0" />
      </div>

      {/* Composer */}
      <div className="shrink-0 border-t border-base-300/60 bg-base-100/95 px-1 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur-md sm:px-2">
        <form
          className="flex w-full items-end gap-2"
          onSubmit={handleSubmit}
        >
          <label className="relative min-h-[48px] flex-1">
            <textarea
              ref={textareaRef}
              className="textarea w-full resize-none border border-base-300/70 bg-base-200/40 py-3 pl-4 pr-3 text-sm leading-normal text-base-content placeholder:text-base-content/40 focus:border-primary/40 focus:bg-base-100 focus:outline-none focus:ring-2 focus:ring-primary/15 rounded-2xl min-h-[48px] max-h-[120px]"
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
