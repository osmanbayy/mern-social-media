/** authUser.following girdileri bazen id string, bazen { _id } olabilir */
export function isFollowingUser(authUser, targetUserId) {
  if (!authUser?.following?.length || targetUserId == null) return false;
  return authUser.following.some(
    (entry) => entry?._id === targetUserId || entry === targetUserId
  );
}
