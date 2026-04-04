import {
  LuFileText,
  LuPaperclip,
  LuSendHorizontal,
  LuX,
} from "react-icons/lu";
import { getReplyPreviewText } from "../../utils/messageChat";
import { chatSenderId } from "../../utils/chatMessageModel";

export default function ChatComposer({
  peerTyping,
  editingMessage,
  cancelEdit,
  pendingAttachments,
  removePendingAttachment,
  handleChatFiles,
  maxPendingAttachments,
  replyingTo,
  clearReplyTarget,
  myId,
  text,
  setText,
  onSubmit,
  canSubmit,
  isPending,
  isEditPending,
  fileInputRef,
  textareaRef,
  socket,
  conversationId,
  typingStopTimerRef,
}) {
  return (
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
      {pendingAttachments.length > 0 && !editingMessage && (
        <div className="mb-2 flex flex-wrap gap-2 px-0.5">
          {pendingAttachments.map((item) => {
            const isImg =
              item.mimeType.startsWith("image/") ||
              (item.status === "ready" &&
                item.kind === "image" &&
                !item.mimeType.startsWith("video/"));
            const isVid = item.mimeType.startsWith("video/");
            const showThumb = isImg || isVid;
            const previewSrc =
              item.status === "uploading"
                ? item.localPreviewUrl
                : item.status === "ready"
                  ? item.url
                  : null;

            return (
              <div
                key={item.clientId}
                className="group relative flex flex-col overflow-hidden rounded-2xl border border-base-300/60 bg-base-200/40 shadow-sm"
              >
                {item.status === "uploading" && showThumb && previewSrc ? (
                  <div
                    className={`relative overflow-hidden ${
                      isVid ? "h-28 w-44 sm:h-32 sm:w-48" : "h-28 w-28 sm:h-32 sm:w-32"
                    }`}
                  >
                    {isVid ? (
                      <video
                        src={previewSrc}
                        className="h-full w-full object-cover"
                        muted
                        playsInline
                        preload="metadata"
                      />
                    ) : (
                      <img src={previewSrc} alt="" className="h-full w-full object-cover" />
                    )}
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-base-100/55 backdrop-blur-[2px]">
                      <span className="loading loading-spinner loading-md text-primary" />
                      <span className="text-[11px] font-semibold text-base-content/80">
                        Yükleniyor…
                      </span>
                    </div>
                  </div>
                ) : item.status === "uploading" ? (
                  <div className="flex h-28 w-36 flex-col items-center justify-center gap-2 px-3 sm:h-32">
                    <LuFileText className="h-10 w-10 text-base-content/35" />
                    <span className="loading loading-spinner loading-sm text-primary" />
                    <span className="text-center text-[11px] font-medium text-base-content/70">
                      Yükleniyor…
                    </span>
                  </div>
                ) : item.status === "ready" && showThumb && previewSrc ? (
                  <div
                    className={`relative overflow-hidden ${
                      isVid ? "h-28 w-44 sm:h-32 sm:w-48" : "h-28 w-28 sm:h-32 sm:w-32"
                    }`}
                  >
                    {isVid ? (
                      <video
                        src={previewSrc}
                        className="h-full w-full object-cover"
                        muted
                        playsInline
                        preload="metadata"
                      />
                    ) : (
                      <img src={previewSrc} alt="" className="h-full w-full object-cover" />
                    )}
                    <div className="pointer-events-none absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent px-2 py-1.5">
                      <p className="truncate text-[10px] font-medium text-white/95">
                        {item.originalName || "Medya"}
                      </p>
                    </div>
                  </div>
                ) : item.status === "ready" ? (
                  <div className="flex h-24 max-w-[12rem] items-center gap-2 px-3 py-2">
                    <LuFileText className="h-8 w-8 shrink-0 text-primary/80" />
                    <p className="min-w-0 flex-1 truncate text-xs font-medium text-base-content">
                      {item.originalName || "Dosya"}
                    </p>
                  </div>
                ) : null}

                <button
                  type="button"
                  className="btn btn-ghost btn-xs btn-circle absolute right-1 top-1 z-10 h-7 w-7 min-h-0 border border-base-300/50 bg-base-100/90 p-0 opacity-90 shadow-sm backdrop-blur-sm hover:bg-error/20 hover:text-error"
                  aria-label="Kaldır"
                  onClick={() => removePendingAttachment(item.clientId)}
                >
                  <LuX className="h-3.5 w-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      )}
      {replyingTo && !editingMessage && (
        <div className="mb-2 flex items-start gap-2 rounded-xl border border-primary/25 bg-primary/8 px-3 py-2">
          <div className="min-w-0 flex-1 border-l-2 border-primary pl-2">
            <p className="text-[11px] font-bold text-primary">
              {chatSenderId(replyingTo) === myId
                ? "Sen"
                : replyingTo.sender?.fullname || replyingTo.sender?.username || "…"}
            </p>
            <p className="line-clamp-2 text-xs text-base-content/65">
              {getReplyPreviewText(replyingTo)}
            </p>
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
        onSubmit={onSubmit}
      >
        {!editingMessage && (
          <>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              accept="image/*,video/*,.pdf,.zip,.txt,text/plain,application/pdf,application/zip"
              onChange={handleChatFiles}
            />
            <button
              type="button"
              className="btn btn-ghost btn-circle h-12 w-12 shrink-0"
              aria-label="Dosya veya fotoğraf ekle"
              disabled={isPending || pendingAttachments.length >= maxPendingAttachments}
              onClick={() => fileInputRef.current?.click()}
            >
              <LuPaperclip className="h-5 w-5" />
            </button>
          </>
        )}
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
                onSubmit(e);
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
  );
}
