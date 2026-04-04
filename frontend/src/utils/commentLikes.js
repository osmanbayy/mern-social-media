/**
 * Yorum / yanıt `likes` dizisinde oturum kullanıcısı var mı (populate edilmiş id veya düz id).
 */
export function commentLikeListIncludesUser(likes, userId) {
  if (userId == null || !Array.isArray(likes)) return false;
  const uid = String(userId);
  return likes.some((id) => {
    if (id == null) return false;
    if (typeof id === "object" && id._id != null) return String(id._id) === uid;
    return String(id) === uid;
  });
}
