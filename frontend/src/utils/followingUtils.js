export function isAuthUserFollowing(authUser, targetUserId) {
  if (!authUser?.following?.length || targetUserId == null) return false;
  const tid = String(targetUserId);
  return authUser.following.some((entry) => {
    if (entry == null) return false;
    if (typeof entry === "object" && entry._id != null) {
      return String(entry._id) === tid;
    }
    return String(entry) === tid;
  });
}
