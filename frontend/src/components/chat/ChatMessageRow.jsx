import {
  LuCheck,
  LuCheckCheck,
} from "react-icons/lu";
import MessageSharePreview from "../messages/MessageSharePreview";
import SwipeableMessageRow from "../messages/SwipeableMessageRow";
import MessageAttachments from "../messages/MessageAttachments";
import {
  getMessageDocId,
  getQuotedMessageId,
  getReplyPreviewText,
  messageHasQuotedReply,
} from "../../utils/messageChat";
import {
  chatMessageDeliveryPhase,
  chatSenderId,
  chatVisibleMessageText,
} from "../../utils/chatMessageModel";
import { formatChatMessageTime } from "../../utils/chatFormatting";
import ChatMessageReactions from "./ChatMessageReactions";

export default function ChatMessageRow({
  message: m,
  index: i,
  messages,
  myId,
  density,
  resolvedBubbles,
  messageFontClass,
  bubbleRadius,
  selectionMode,
  selectedMessageIds,
  highlightedMessageId,
  isCompose,
  conversationId,
  onToggleSelect,
  onReply,
  onQuoteNavigate,
  clearLongPress,
  longPressTimerRef,
  setActionMenu,
}) {
  const rowId = getMessageDocId(m);
  const mine = chatSenderId(m) === myId;
  const bubbleResolved = mine ? resolvedBubbles.mine : resolvedBubbles.theirs;
  const prev = messages[i - 1];
  const next = messages[i + 1];
  const sameSenderAsPrev = prev && chatSenderId(prev) === chatSenderId(m);
  const sameSenderAsNext = next && chatSenderId(next) === chatSenderId(m);
  const clusterTop = !sameSenderAsPrev;
  const clusterBottom = !sameSenderAsNext;

  return (
    <SwipeableMessageRow
      disabled={isCompose || !conversationId || selectionMode}
      onReply={onReply}
    >
      <div
        id={rowId ? `chat-msg-${rowId}` : undefined}
        className={`flex w-full min-w-0 max-w-full items-start ${
          mine ? "justify-end" : "justify-start"
        } ${clusterTop ? density.clusterTop : density.clusterRest} ${
          highlightedMessageId && rowId && highlightedMessageId === rowId
            ? "scroll-mt-20 rounded-2xl ring-2 ring-primary/50"
            : ""
        }`}
      >
        {selectionMode && mine && rowId ? (
          <div className="flex shrink-0 items-start pt-2 pr-2">
            <input
              type="checkbox"
              className="checkbox checkbox-sm checkbox-primary"
              checked={selectedMessageIds.includes(rowId)}
              onChange={() => onToggleSelect(rowId)}
              onClick={(e) => e.stopPropagation()}
              aria-label="Mesajı seç"
            />
          </div>
        ) : null}
        <div
          className={`flex min-w-0 max-w-full flex-col ${mine ? "items-end" : "items-start"} ${
            m.share?.kind
              ? "w-full max-w-[min(96%,min(26rem,calc(100vw-1.5rem)))] sm:max-w-[min(96%,28rem)]"
              : "w-full max-w-[min(28rem,85%,calc(100vw-1.5rem))]"
          }`}
        >
          <div
            role="group"
            onClick={(e) => {
              if (!selectionMode || !mine || !rowId) return;
              if (e.target.closest("a, button, video, input")) return;
              onToggleSelect(rowId);
            }}
            onContextMenu={(e) => {
              if (selectionMode) {
                e.preventDefault();
                return;
              }
              e.preventDefault();
              setActionMenu({ message: m, x: e.clientX, y: e.clientY });
            }}
            onTouchStart={(e) => {
              if (selectionMode) return;
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
                    onClick={(e) => onQuoteNavigate(e, m)}
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
              {Array.isArray(m.attachments) && m.attachments.length > 0 ? (
                <MessageAttachments attachments={m.attachments} mine={mine} />
              ) : null}
              {chatVisibleMessageText(m.text) ? (
                <p
                  className={`max-w-full whitespace-pre-wrap break-words [overflow-wrap:anywhere] [word-break:break-word] ${
                    m.share?.kind ||
                    (Array.isArray(m.attachments) && m.attachments.length > 0)
                      ? "mt-2"
                      : ""
                  }`}
                >
                  {m.text}
                </p>
              ) : null}
            </div>
            <ChatMessageReactions reactions={m.reactions} mine={mine} />
          </div>
          {clusterBottom && (
            <span
              className={`mt-1 flex flex-wrap items-center gap-x-1 gap-y-0 px-1 text-[10px] tabular-nums text-base-content/35 ${
                mine ? "justify-end text-right" : "text-left"
              }`}
            >
              {formatChatMessageTime(m.createdAt)}
              {m.editedAt && (
                <span className="text-[9px] font-normal normal-case opacity-80">
                  düzenlendi
                </span>
              )}
              {mine &&
                (() => {
                  const phase = chatMessageDeliveryPhase(m);
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
}
