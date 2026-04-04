import MentionText from "./common/MentionText";
import CommentOptions from "./CommentOptions";
import CommentActionsBar from "./comments/CommentActionsBar";
import CommentAuthorLine from "./comments/CommentAuthorLine";
import CommentEditForm from "./comments/CommentEditForm";
import CommentRepliesList from "./comments/CommentRepliesList";
import CommentReplyForm from "./comments/CommentReplyForm";
import CommentUserAvatar from "./comments/CommentUserAvatar";
import { useCommentReplyMention } from "../hooks/useCommentReplyMention";

const stopPropagation = (e) => e.stopPropagation();

const CommentItem = ({
  commentItem,
  authUser,
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
  const { setReplyTextareaRef, replyMention } = useCommentReplyMention(
    replyText,
    onReplyTextChange,
    replyTextareaRef
  );

  const handleEditTextChange = (text) => {
    onEdit({ ...editingComment, text });
  };

  const likeCount = commentItem.likes?.length || 0;

  return (
    <div className="py-3">
      <div className="fade-in flex gap-3 rounded-xl p-4 transition-all duration-200 hover:bg-base-200/30">
        <CommentUserAvatar
          user={commentItem.user}
          defaultProfilePicture={defaultProfilePicture}
          size="md"
          onLinkClick={stopPropagation}
        />
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="mb-1 flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <CommentAuthorLine
                user={commentItem.user}
                nameSize="md"
                onLinkClick={stopPropagation}
              />
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
            <CommentEditForm
              editingComment={editingComment}
              onEditChange={handleEditTextChange}
              onSubmit={onSubmitEdit}
              onCancel={onCancelEdit}
              isSaving={editCommentMutation.isPending}
              canSave={Boolean(editingComment?.text?.trim())}
            />
          ) : (
            <>
              <p className="mb-2 text-sm leading-relaxed text-base-content">
                <MentionText text={commentItem.text} />
              </p>

              <CommentActionsBar
                likeCount={likeCount}
                isLiked={isLiked}
                onLike={onLike}
                onReply={onReply}
              />

              {isReplying && (
                <CommentReplyForm
                  replyText={replyText}
                  placeholderUsername={commentItem.user.username}
                  setReplyTextareaRef={setReplyTextareaRef}
                  replyMention={replyMention}
                  onSubmit={onSubmitReply}
                  onCancel={onCancelReply}
                  isSending={replyToCommentMutation.isPending}
                  canSend={Boolean(replyText.trim())}
                />
              )}

              <CommentRepliesList
                replies={commentItem.replies}
                authUser={authUser}
                defaultProfilePicture={defaultProfilePicture}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommentItem;
