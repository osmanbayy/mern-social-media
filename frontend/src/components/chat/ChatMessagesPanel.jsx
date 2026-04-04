import { LuChevronsDown, LuSendHorizontal } from "react-icons/lu";
import LoadingSpinner from "../common/LoadingSpinner";
import { getBubbleRadius } from "../../constants/chatAppearance";
import { chatSenderId } from "../../utils/chatMessageModel";
import ChatDayDivider from "./ChatDayDivider";
import ChatMessageRow from "./ChatMessageRow";

export default function ChatMessagesPanel({
  scrollRef,
  messagesContentRef,
  density,
  chatBgClass,
  isLoading,
  messages,
  timeline,
  appearance,
  resolvedBubbles,
  messageFontClass,
  dayPillClass,
  myId,
  isCompose,
  conversationId,
  selectionMode,
  selectedMessageIds,
  highlightedMessageId,
  showScrollToBottom,
  setShowScrollToBottom,
  scrollToBottom,
  onToggleSelect,
  onQuoteNavigate,
  clearLongPress,
  longPressTimerRef,
  setActionMenu,
  setReplyTarget,
  setEditingMessage,
  textareaRef,
}) {
  return (
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
          <div
            ref={messagesContentRef}
            className={`flex w-full min-w-0 max-w-full flex-col ${density.rowGap} pb-2`}
          >
            {timeline.map((row) => {
              if (row.kind === "day") {
                return (
                  <ChatDayDivider key={row.id} date={row.date} className={dayPillClass} />
                );
              }

              const m = row.m;
              const i = row.index;
              const mine = chatSenderId(m) === myId;
              const prev = messages[i - 1];
              const next = messages[i + 1];
              const sameSenderAsPrev = prev && chatSenderId(prev) === chatSenderId(m);
              const sameSenderAsNext = next && chatSenderId(next) === chatSenderId(m);
              const clusterTop = !sameSenderAsPrev;
              const clusterBottom = !sameSenderAsNext;

              const bubbleRadius = getBubbleRadius(
                appearance.bubbleShape,
                mine,
                clusterTop,
                clusterBottom
              );

              return (
                <ChatMessageRow
                  key={m._id}
                  message={m}
                  index={i}
                  messages={messages}
                  myId={myId}
                  density={density}
                  resolvedBubbles={resolvedBubbles}
                  messageFontClass={messageFontClass}
                  bubbleRadius={bubbleRadius}
                  selectionMode={selectionMode}
                  selectedMessageIds={selectedMessageIds}
                  highlightedMessageId={highlightedMessageId}
                  isCompose={isCompose}
                  conversationId={conversationId}
                  onToggleSelect={onToggleSelect}
                  onReply={() => {
                    setReplyTarget(m);
                    setEditingMessage(null);
                    textareaRef.current?.focus();
                  }}
                  onQuoteNavigate={onQuoteNavigate}
                  clearLongPress={clearLongPress}
                  longPressTimerRef={longPressTimerRef}
                  setActionMenu={setActionMenu}
                />
              );
            })}
          </div>
        )}
        <div className="h-px w-full shrink-0" aria-hidden />
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
  );
}
