import { Link } from "react-router-dom";
import { FaHeart, FaRegComment } from "react-icons/fa";
import CommentOptions from "./CommentOptions";
import MentionText from "./common/MentionText";
import useMention from "../hooks/useMention";
import MentionDropdown from "./common/MentionDropdown";
import { useRef } from "react";

const CommentItem = ({
  commentItem,
  authUser,
  post,
  postOwner,
  isMyComment,
  isPostOwner,
  isLiked,
  isEditing,
  isDeleting,
  isReplying,
  editingComment,
  replyText,
  onLike,
  onReply,
  onEdit,
  onStartEdit,
  onDelete,
  onSubmitEdit,
  onSubmitReply,
  onCancelEdit,
  onCancelReply,
  onReplyTextChange,
  replyTextareaRef,
  theme,
  defaultProfilePicture,
  editCommentMutation,
  replyToCommentMutation,
}) => {
  // Reply mention hook - create a ref if not provided
  const internalReplyRef = useRef(null);
  const actualReplyRef = replyTextareaRef || internalReplyRef;
  
  const replyMentionHook = useMention(
    replyText,
    onReplyTextChange,
    typeof actualReplyRef === 'function' ? null : actualReplyRef
  );

  return (
    <div className="py-3">
      <div className="flex gap-3 p-4 hover:bg-base-200/30 transition-all duration-200 rounded-xl fade-in">
        <Link
          to={`/profile/${commentItem.user.username}`}
          className="avatar flex-shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="w-10 h-10 rounded-full ring-2 ring-base-300 hover:ring-primary transition-all duration-300">
            <img
              src={commentItem.user.profileImage || defaultProfilePicture}
              alt={commentItem.user.fullname || "Kullanıcı"}
              className="w-full h-full rounded-full object-cover"
            />
          </div>
        </Link>
        <div className="flex flex-col flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <Link
                to={`/profile/${commentItem.user.username}`}
                className="font-semibold text-sm hover:text-primary transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                {commentItem.user.fullname || "Kullanıcı"}
              </Link>
              <span className="text-base-content/50 text-xs">
                @{commentItem.user.username}
              </span>
            </div>
            <CommentOptions
              comment={commentItem}
              postOwner={postOwner}
              isMyComment={isMyComment}
              isPostOwner={isPostOwner}
              isDeleting={isDeleting}
              isEditing={isEditing}
              onEdit={onStartEdit}
              onDelete={onDelete}
              theme={theme}
            />
          </div>
          
          {isEditing ? (
            <form 
              onSubmit={onSubmitEdit}
              className="flex flex-col gap-2"
            >
              <textarea
                className="textarea textarea-bordered w-full min-h-[80px] max-h-32 resize-none rounded-xl text-sm bg-base-200/50 border-base-300 focus:border-primary/50"
                value={editingComment?.text || ""}
                onChange={(e) => {
                  const updatedComment = { ...editingComment, text: e.target.value };
                  onEdit(updatedComment);
                }}
                rows={3}
                autoFocus
              />
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={onCancelEdit}
                  className="btn btn-ghost btn-sm"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={!editingComment?.text?.trim() || editCommentMutation.isPending}
                  className="btn btn-primary btn-sm"
                >
                  {editCommentMutation.isPending ? "Kaydediliyor..." : "Kaydet"}
                </button>
              </div>
            </form>
          ) : (
            <>
              <p className="text-base-content text-sm leading-relaxed mb-2">
                <MentionText text={commentItem.text} />
              </p>
              
              {/* Comment Actions */}
              <div className="flex items-center gap-4 mt-2">
                <button
                  onClick={onLike}
                  className={`flex items-center gap-1.5 text-sm transition-colors ${
                    isLiked ? "text-red-500" : "text-base-content/60 hover:text-red-500"
                  }`}
                >
                  <FaHeart className={isLiked ? "fill-current" : ""} />
                  <span>{commentItem.likes?.length || 0}</span>
                </button>
                <button
                  onClick={onReply}
                  className="flex items-center gap-1.5 text-sm text-base-content/60 hover:text-primary transition-colors"
                >
                  <FaRegComment />
                  <span>Yanıtla</span>
                </button>
              </div>

              {/* Reply Input */}
              {isReplying && (
                <form 
                  onSubmit={onSubmitReply}
                  className="mt-3 flex gap-2"
                >
                  <div className="flex-1 relative">
                    <textarea
                      ref={(el) => {
                        if (typeof actualReplyRef === 'function') {
                          actualReplyRef(el);
                        } else if (actualReplyRef) {
                          actualReplyRef.current = el;
                        }
                      }}
                      className="textarea textarea-bordered w-full min-h-[60px] max-h-24 resize-none rounded-xl text-sm bg-base-200/50 border-base-300 focus:border-primary/50"
                      placeholder={`@${commentItem.user.username} yanıtla...`}
                      value={replyText}
                      onChange={(e) => onReplyTextChange(e.target.value)}
                      rows={2}
                      autoFocus
                    />
                    <MentionDropdown
                      show={replyMentionHook.showMentionDropdown}
                      position={replyMentionHook.mentionPosition}
                      searchQuery={replyMentionHook.mentionQuery}
                      onSelectUser={replyMentionHook.handleSelectUser}
                      onClose={replyMentionHook.closeMentionDropdown}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <button
                      type="submit"
                      disabled={!replyText.trim() || replyToCommentMutation.isPending}
                      className="btn btn-primary btn-sm"
                    >
                      {replyToCommentMutation.isPending ? "..." : "Gönder"}
                    </button>
                    <button
                      type="button"
                      onClick={onCancelReply}
                      className="btn btn-ghost btn-sm"
                    >
                      İptal
                    </button>
                  </div>
                </form>
              )}

              {/* Replies */}
              {commentItem.replies && commentItem.replies.length > 0 && (
                <div className="mt-3 ml-4 pl-4 border-l-2 border-base-300/30 space-y-3">
                  {commentItem.replies.map((reply) => {
                    if (!reply.user) return null;
                    const isReplyLiked = reply.likes?.some(
                      (id) => id?._id === authUser?._id || id === authUser?._id
                    ) || false;
                    
                    return (
                      <div key={reply._id} className="flex gap-2">
                        <Link
                          to={`/profile/${reply.user.username}`}
                          className="avatar flex-shrink-0"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="w-8 h-8 rounded-full ring-2 ring-base-300">
                            <img
                              src={reply.user.profileImage || defaultProfilePicture}
                              alt={reply.user.fullname || "Kullanıcı"}
                              className="w-full h-full rounded-full object-cover"
                            />
                          </div>
                        </Link>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Link
                              to={`/profile/${reply.user.username}`}
                              className="font-semibold text-xs hover:text-primary transition-colors"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {reply.user.fullname || "Kullanıcı"}
                            </Link>
                            <span className="text-base-content/50 text-xs">
                              @{reply.user.username}
                            </span>
                          </div>
                          <p className="text-base-content text-xs leading-relaxed">
                            <MentionText text={reply.text} />
                          </p>
                          <div className="flex items-center gap-3 mt-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                // Like reply functionality can be added here
                              }}
                              className={`flex items-center gap-1 text-xs transition-colors ${
                                isReplyLiked ? "text-red-500" : "text-base-content/60 hover:text-red-500"
                              }`}
                            >
                              <FaHeart className={isReplyLiked ? "fill-current" : ""} />
                              <span>{reply.likes?.length || 0}</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommentItem;
