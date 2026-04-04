import defaultProfilePicture from "../../assets/avatar-placeholder.png";
import MentionDropdown from "../common/MentionDropdown";

export default function PostDetailCommentComposer({
  authUser,
  comment,
  commentTextareaRef,
  showMentionDropdown,
  mentionPosition,
  mentionQuery,
  handleTextChange,
  handleSelectUser,
  closeMentionDropdown,
  onSubmit,
  isCommenting,
}) {
  return (
    <div className="sticky bottom-0 border-t border-base-300/50 bg-base-100/95 p-5 shadow-lg backdrop-blur-xl">
      <form onSubmit={onSubmit} className="flex items-end gap-3">
        <div className="avatar flex-shrink-0">
          <div className="h-10 w-10 rounded-full ring-2 ring-base-300">
            <img
              src={authUser?.profileImage || defaultProfilePicture}
              alt={authUser?.fullname}
              className="h-full w-full rounded-full object-cover"
            />
          </div>
        </div>
        <div className="relative flex flex-1 flex-col gap-2">
          <textarea
            ref={commentTextareaRef}
            className="textarea textarea-bordered max-h-32 min-h-[80px] w-full resize-none rounded-2xl border-base-300 bg-base-200/50 text-sm placeholder:text-base-content/40 transition-all focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
            placeholder="Yorumunu yaz..."
            value={comment}
            onChange={handleTextChange}
            rows={3}
          />
          <MentionDropdown
            show={showMentionDropdown}
            position={mentionPosition}
            searchQuery={mentionQuery}
            onSelectUser={handleSelectUser}
            onClose={closeMentionDropdown}
          />
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={!comment.trim() || isCommenting}
              className="btn btn-primary btn-sm rounded-full px-6 shadow-md transition-transform duration-200 hover:scale-105 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isCommenting ? (
                <>
                  <span className="loading loading-spinner loading-sm" />
                  <span className="ml-2">Gönderiliyor...</span>
                </>
              ) : (
                "Yorum Yap"
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
