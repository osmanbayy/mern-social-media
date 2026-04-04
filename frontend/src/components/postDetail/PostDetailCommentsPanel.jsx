import CommentItem from "../CommentItem";
import { POST_DETAIL_COMMENTS_MAX_HEIGHT } from "../../constants/postDetailLayout";
import { isCommentLikedByUser } from "../../utils/postDetailUtils";
import defaultProfilePicture from "../../assets/avatar-placeholder.png";

function CommentsEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-20 text-center">
      <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 shadow-lg">
        <span className="text-5xl">💬</span>
      </div>
      <p className="mb-2 text-lg font-semibold text-base-content/80">Henüz yorum yok</p>
      <p className="text-sm text-base-content/50">İlk yorumu sen yap!</p>
    </div>
  );
}

export default function PostDetailCommentsPanel({ post, postOwner, authUser, theme, commentThread }) {
  const {
    replyingTo,
    editingComment,
    replyTexts,
    deletingCommentId,
    editingCommentId,
    editCommentMutation,
    replyToCommentMutation,
    handleLikeComment,
    handleReplyToComment,
    handleUpdateEditingComment,
    handleDeleteComment,
    handleEditComment,
    handleSubmitEditComment,
    handleSubmitReply,
    handleCancelEdit,
    handleCancelReply,
    setReplyTextForComment,
    registerReplyTextareaRef,
  } = commentThread;
  const comments = post.comments;
  const hasComments = comments?.length > 0;

  return (
    <div
      className="custom-scrollbar overflow-y-auto px-5"
      style={{ maxHeight: POST_DETAIL_COMMENTS_MAX_HEIGHT }}
    >
      {!hasComments && <CommentsEmptyState />}

      {hasComments && (
        <div className="divide-y divide-base-300/50">
          {comments.map((commentItem) => {
            if (!commentItem.user) return null;

            const isMyComment = authUser?._id === commentItem.user?._id;
            const isPostOwner = authUser?._id === post.user?._id;
            const commentLiked = isCommentLikedByUser(commentItem, authUser);
            const isEditing = editingCommentId === commentItem._id;
            const isDeleting = deletingCommentId === commentItem._id;
            const isReplying = replyingTo === commentItem._id;

            return (
              <CommentItem
                key={commentItem._id}
                commentItem={commentItem}
                authUser={authUser}
                post={post}
                postOwner={postOwner}
                isMyComment={isMyComment}
                isPostOwner={isPostOwner}
                isLiked={commentLiked}
                isEditing={isEditing}
                isDeleting={isDeleting}
                isReplying={isReplying}
                editingComment={editingComment}
                replyText={replyTexts[commentItem._id] || ""}
                onLike={(e) => handleLikeComment(commentItem._id, e)}
                onReply={(e) => handleReplyToComment(commentItem._id, e)}
                onEdit={handleUpdateEditingComment}
                onDelete={() => handleDeleteComment(commentItem._id)}
                onStartEdit={() => handleEditComment(commentItem)}
                onSubmitEdit={(e) => handleSubmitEditComment(commentItem._id, e)}
                onSubmitReply={(e) => handleSubmitReply(commentItem._id, e)}
                onCancelEdit={handleCancelEdit}
                onCancelReply={() => handleCancelReply(commentItem._id)}
                onReplyTextChange={(text) => setReplyTextForComment(commentItem._id, text)}
                replyTextareaRef={(el) => registerReplyTextareaRef(commentItem._id, el)}
                theme={theme}
                defaultProfilePicture={defaultProfilePicture}
                editCommentMutation={editCommentMutation}
                replyToCommentMutation={replyToCommentMutation}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
