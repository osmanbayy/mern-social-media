/**
 * TanStack Query key'leri — tek kaynak.
 * invalidateQueries / setQueryData / prefetch ile uyumlu.
 */

/** Oturum kullanıcısı */
export const QK_AUTH_USER = ["authUser"];

/** Ana akış gönderileri (sayfalama: ["posts", feedType, ...] eşleşir) */
export const QK_POSTS = ["posts"];

/** Gündem etiketleri — prefix: ["trendingHashtags", limit, sinceDays] */
export const QK_TRENDING_HASHTAGS = ["trendingHashtags"];

/** Etiket gönderi listesi — prefix: ["hashtagPosts", tag] */
export const QK_HASHTAG_POSTS = ["hashtagPosts"];

export const QK_NOTIFICATIONS = ["notifications"];

export const QK_CONVERSATIONS = ["conversations"];

export const QK_MESSAGE_REQUESTS = ["messageRequests"];

/** Profil sayfası: ["user", username] — prefix ile tüm profil sorguları */
export const QK_USER_PREFIX = ["user"];

/** Tek gönderi detay */
export const qkPost = (postId) => ["post", postId];

/** Sohbet mesajları */
export const qkMessages = (conversationId) => ["messages", conversationId];

/** Tüm mesaj listesi sorguları (prefix eşleşmesi) */
export const QK_MESSAGES_PREFIX = ["messages"];

export const QK_FOLLOWINGS = ["followings"];

export const QK_FOLLOWERS = ["followers"];

export const QK_BLOCKED_USERS = ["blockedUsers"];

/** Önerilen kullanıcı listeleri (RightPanel, mobil, sayfalı liste) */
export const SUGGESTED_USERS_QUERY_KEYS = {
  rightPanel: ["suggestedUsers"],
  mobile: ["mobileSuggestedUsers"],
  paginatedPrefix: ["suggestedUsersPage"],
};
