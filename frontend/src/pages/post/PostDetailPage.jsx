import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";
import PostImageViewer from "../../components/modals/PostImageViewer";
import DeletePostDialog from "../../components/modals/DeletePostDialog";
import EditPostDialog from "../../components/modals/EditPostDialog";
import PostDetailArticle from "../../components/postDetail/PostDetailArticle";
import PostDetailCommentComposer from "../../components/postDetail/PostDetailCommentComposer";
import PostDetailCommentsPanel from "../../components/postDetail/PostDetailCommentsPanel";
import PostDetailLoadingState from "../../components/postDetail/PostDetailLoadingState";
import PostDetailNotFoundState from "../../components/postDetail/PostDetailNotFoundState";
import PostDetailToolbar from "../../components/postDetail/PostDetailToolbar";
import usePostDetailActions from "../../hooks/usePostDetailActions";
import { usePostDetailComments } from "../../hooks/usePostDetailComments";
import { usePostDetailModals } from "../../hooks/usePostDetailModals";
import { usePostDetailQuery } from "../../hooks/usePostDetailQuery";
import { formatPostDate } from "../../utils/date";
import { getPostEngagementFlags } from "../../utils/postDetailUtils";

const PostDetailPage = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { authUser, isLoading: isAuthLoading } = useAuth();
  const { theme } = useTheme();

  const { data: post, isLoading: isPostLoading } = usePostDetailQuery(postId);

  const {
    likePost,
    savePost,
    deletePost,
    commentPost,
    pinPost,
    isDeleting,
    isCommenting,
    isPinning,
  } = usePostDetailActions(postId);

  const comments = usePostDetailComments(postId, { commentPost, isCommenting });

  const {
    showEditDialog,
    showImageViewer,
    setShowImageViewer,
    showDeleteDialog,
    setShowDeleteDialog,
    openEditDialog,
    closeEditDialog,
  } = usePostDetailModals(post);

  const isBootstrapping = isAuthLoading || isPostLoading;

  if (isBootstrapping) {
    return <PostDetailLoadingState />;
  }

  if (!post) {
    return <PostDetailNotFoundState onGoHome={() => navigate("/")} />;
  }

  const postOwner = post.user;
  const flags = getPostEngagementFlags(post, authUser);
  const formattedDate = formatPostDate(post.createdAt);

  const handleDeletePost = () => {
    deletePost(undefined, {
      onSuccess: () => navigate("/"),
    });
  };

  const handleLikePost = (e) => {
    e.stopPropagation();
    likePost();
  };

  const handleSavePost = (e) => {
    e.stopPropagation();
    savePost();
  };

  return (
    <div className="min-h-screen w-full pb-20 lg:pb-0">
      <PostDetailToolbar onBack={() => navigate(-1)} />

      <PostDetailArticle
        post={post}
        postOwner={postOwner}
        theme={theme}
        formattedDate={formattedDate}
        isLiked={flags.isLiked}
        isSaved={flags.isSaved}
        isMyPost={flags.isMyPost}
        isDeletingPost={isDeleting}
        isPinning={isPinning}
        onLikePost={handleLikePost}
        onSavePost={handleSavePost}
        onEditPost={openEditDialog}
        onRequestDeletePost={() => setShowDeleteDialog(true)}
        onPinPost={pinPost}
        onOpenImage={() => setShowImageViewer(true)}
      />

      <PostDetailCommentComposer
        authUser={authUser}
        comment={comments.comment}
        commentTextareaRef={comments.commentTextareaRef}
        showMentionDropdown={comments.showMentionDropdown}
        mentionPosition={comments.mentionPosition}
        mentionQuery={comments.mentionQuery}
        handleTextChange={comments.handleTextChange}
        handleSelectUser={comments.handleSelectUser}
        closeMentionDropdown={comments.closeMentionDropdown}
        onSubmit={comments.handlePostComment}
        isCommenting={isCommenting}
      />

      <PostDetailCommentsPanel
        post={post}
        postOwner={postOwner}
        authUser={authUser}
        theme={theme}
        commentThread={comments}
      />

      <PostImageViewer
        imageUrl={post.img}
        isOpen={showImageViewer}
        onClose={() => setShowImageViewer(false)}
      />

      <DeletePostDialog
        modalId={`delete_modal_${post._id}`}
        handleDeletePost={handleDeletePost}
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
      />

      {showEditDialog && (
        <EditPostDialog
          post={post}
          onClose={closeEditDialog}
          modalId={`edit_post_modal_${post._id}`}
        />
      )}
    </div>
  );
};

export default PostDetailPage;
