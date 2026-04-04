/**
 * Takip listesi satırlarında rozetler için (mevcut API şekliyle uyumlu).
 */
export function isMutualFollow(authUser, profileUser) {
  if (!authUser?._id || !profileUser?._id) return false;
  const iFollowThem = Boolean(authUser.following?.includes(profileUser._id));
  const theyFollowMe = Boolean(profileUser.followers?.includes?.(authUser._id));
  return iFollowThem && theyFollowMe;
}

export function isNotFollowingBack(authUser, profileUser) {
  if (!authUser?._id || !profileUser?._id) return false;
  return !profileUser.followers?.includes?.(authUser._id);
}
