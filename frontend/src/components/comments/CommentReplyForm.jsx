import MentionDropdown from "../common/MentionDropdown";
import { commentReplyTextareaClass } from "./commentItemClasses";

export default function CommentReplyForm({
  replyText,
  placeholderUsername,
  setReplyTextareaRef,
  replyMention,
  onSubmit,
  onCancel,
  isSending,
  canSend,
}) {
  return (
    <form onSubmit={onSubmit} className="mt-3 flex gap-2">
      <div className="relative flex-1">
        <textarea
          ref={setReplyTextareaRef}
          className={commentReplyTextareaClass}
          placeholder={`@${placeholderUsername} yanıtla...`}
          value={replyText}
          onChange={replyMention.handleTextChange}
          rows={2}
          autoFocus
        />
        <MentionDropdown
          show={replyMention.showMentionDropdown}
          position={replyMention.mentionPosition}
          searchQuery={replyMention.mentionQuery}
          onSelectUser={replyMention.handleSelectUser}
          onClose={replyMention.closeMentionDropdown}
        />
      </div>
      <div className="flex flex-col gap-1">
        <button
          type="submit"
          disabled={!canSend || isSending}
          className="btn btn-primary btn-sm"
        >
          {isSending ? "..." : "Gönder"}
        </button>
        <button type="button" onClick={onCancel} className="btn btn-ghost btn-sm">
          İptal
        </button>
      </div>
    </form>
  );
}
