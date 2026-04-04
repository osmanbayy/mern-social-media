/**
 * Derived state for post detail / comment thread (keeps JSX free of logic noise).
 */

export function getPostEngagementFlags(post, authUser) {
  const uid = authUser?._id;
  if (!post || !uid) {
    return { isLiked: false, isSaved: false, isMyPost: false };
  }
  return {
    isLiked: post.likes?.includes(uid) ?? false,
    isSaved: post.saves?.includes(uid) ?? false,
    isMyPost: post.user?._id === uid,
  };
}

export function isCommentLikedByUser(commentItem, authUser) {
  const uid = authUser?._id;
  if (!uid || !commentItem?.likes?.length) return false;
  return commentItem.likes.some((id) => id?._id === uid || id === uid);
}
